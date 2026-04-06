import {
  AlignLeft,
  CheckCircle2,
  Cloud,
  Hash,
  Keyboard,
  Link,
  Loader2,
  Minus,
  Monitor,
  Moon,
  Plus,
  Sun,
  Type,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  fetchEditorSettings,
  saveEditorSettings,
} from "../services/backendService";
import { useAuthStore } from "../stores/authStore";
import { useEditorStore } from "../stores/editorStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore } from "../stores/themeStore";
import type { IDETheme } from "../stores/themeStore";

const FONT_FAMILIES = [
  {
    label: "JetBrains Mono",
    value: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  {
    label: "Fira Code",
    value: "'Fira Code', Consolas, 'Courier New', monospace",
  },
  { label: "Consolas", value: "Consolas, 'Courier New', monospace" },
  { label: "SF Mono", value: "'SF Mono', 'Fira Code', monospace" },
  { label: "System Mono", value: "monospace" },
];

const KEYBOARD_SHORTCUTS = [
  { key: "Ctrl+P", action: "Quick Open File" },
  { key: "Ctrl+Shift+P", action: "Command Palette" },
  { key: "Ctrl+W", action: "Close Tab" },
  { key: "Ctrl+S", action: "Save File" },
  { key: "Ctrl+Shift+S", action: "Save to Cloud" },
  { key: "Ctrl+B", action: "Toggle Sidebar" },
  { key: "Ctrl+`", action: "Toggle Terminal" },
  { key: "Ctrl+\\", action: "Split Editor" },
  { key: "Ctrl+Shift+N", action: "Open Scratchpad" },
  { key: "Ctrl+Shift+G", action: "Toggle Git Panel" },
  { key: "Ctrl+Shift+X", action: "Open Extensions" },
  { key: "Ctrl+F", action: "Find in File" },
  { key: "Ctrl+H", action: "Find & Replace" },
  { key: "Ctrl+Z", action: "Undo" },
  { key: "Ctrl+Shift+Z", action: "Redo" },
  { key: "Ctrl+Shift+F11", action: "Toggle Focus Mode" },
  { key: "Shift+?", action: "Keyboard Shortcuts Overlay" },
];

export const SettingsPanel: React.FC = () => {
  const { showSettings, setShowSettings } = useEditorStore();
  const { theme, setTheme } = useThemeStore();
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { addNotification } = useNotificationStore();
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"editor" | "keybindings">(
    "editor",
  );
  const [kbSearch, setKbSearch] = useState("");
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadedRef = useRef(false);

  // Load settings from backend when panel opens
  // biome-ignore lint/correctness/useExhaustiveDependencies: updateSettings is stable
  useEffect(() => {
    if (!showSettings || !actor || !isLoggedIn || isLoadedRef.current) return;
    isLoadedRef.current = true;
    fetchEditorSettings(actor).then((json) => {
      if (json) {
        try {
          const parsed = JSON.parse(json);
          updateSettings(parsed);
        } catch {
          // malformed JSON — ignore
        }
      }
    });
  }, [showSettings, actor, isLoggedIn]);

  // Reset loaded flag when panel closes
  useEffect(() => {
    if (!showSettings) isLoadedRef.current = false;
  }, [showSettings]);

  // Debounced cloud save whenever settings change
  const handleSettingsChange = (
    patch: Parameters<typeof updateSettings>[0],
  ) => {
    updateSettings(patch);
    if (!actor || !isLoggedIn) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCloudSyncing(true);
      const newSettings = { ...settings, ...patch };
      const ok = await saveEditorSettings(actor, JSON.stringify(newSettings));
      setCloudSyncing(false);
      if (ok) {
        setCloudSynced(true);
        setTimeout(() => setCloudSynced(false), 2500);
      }
    }, 2000);
  };

  const handleSave = () => {
    setShowSettings(false);
    addNotification({ message: "Settings saved", type: "success" });
  };

  const themes: { id: IDETheme; label: string; icon: React.ReactNode }[] = [
    { id: "dark", label: "Dark+", icon: <Moon size={12} /> },
    { id: "light", label: "Light+", icon: <Sun size={12} /> },
    {
      id: "high-contrast",
      label: "High Contrast",
      icon: <Monitor size={12} />,
    },
    {
      id: "monokai",
      label: "Monokai",
      icon: <span style={{ fontSize: 10 }}>🍂</span>,
    },
    {
      id: "solarized-dark",
      label: "Solarized",
      icon: <span style={{ fontSize: 10 }}>🌞</span>,
    },
    {
      id: "dracula",
      label: "Dracula",
      icon: <span style={{ fontSize: 10 }}>🧛</span>,
    },
    {
      id: "nord",
      label: "Nord",
      icon: <span style={{ fontSize: 10 }}>❄️</span>,
    },
    {
      id: "one-dark",
      label: "One Dark Pro",
      icon: <span style={{ fontSize: 10 }}>🌘</span>,
    },
  ];

  const filteredShortcuts = KEYBOARD_SHORTCUTS.filter(
    (s) =>
      !kbSearch ||
      s.action.toLowerCase().includes(kbSearch.toLowerCase()) ||
      s.key.toLowerCase().includes(kbSearch.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(3px)",
            }}
          />
          <motion.div
            className="relative w-full max-w-xl rounded border border-[var(--border)] shadow-2xl overflow-hidden"
            style={{ background: "var(--bg-sidebar)", maxHeight: "85vh" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="settings.modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Settings
                </h2>
                {isLoggedIn && (
                  <span
                    className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      background: cloudSynced
                        ? "rgba(34,197,94,0.1)"
                        : cloudSyncing
                          ? "rgba(0,122,204,0.08)"
                          : "transparent",
                      color: cloudSynced
                        ? "#22c55e"
                        : cloudSyncing
                          ? "var(--accent)"
                          : "var(--text-muted)",
                      border: `1px solid ${
                        cloudSynced
                          ? "rgba(34,197,94,0.2)"
                          : cloudSyncing
                            ? "rgba(0,122,204,0.15)"
                            : "var(--border)"
                      }`,
                      transition: "all 0.3s",
                    }}
                    data-ocid="settings.success_state"
                  >
                    {cloudSyncing ? (
                      <>
                        <Loader2 size={9} className="animate-spin" /> Syncing...
                      </>
                    ) : cloudSynced ? (
                      <>
                        <CheckCircle2 size={9} /> Settings synced
                      </>
                    ) : (
                      <>
                        <Cloud size={9} /> Auto-syncs to cloud
                      </>
                    )}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
                data-ocid="settings.close_button"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex border-b border-[var(--border)]"
              style={{ background: "var(--bg-tab-bar)" }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs border-b-2 transition-colors ${
                  activeTab === "editor"
                    ? "text-[var(--text-primary)] border-[var(--accent)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                }`}
                data-ocid="settings.editor.tab"
              >
                <Type size={11} /> Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("keybindings")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs border-b-2 transition-colors ${
                  activeTab === "keybindings"
                    ? "text-[var(--text-primary)] border-[var(--accent)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                }`}
                data-ocid="settings.keybindings.tab"
              >
                <Keyboard size={11} /> Keybindings
              </button>
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(85vh - 150px)" }}
            >
              {activeTab === "editor" && (
                <div className="p-5 space-y-5">
                  {/* Theme */}
                  <section>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Color Theme
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {themes.map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded border text-xs transition-all justify-center ${
                            theme === t.id
                              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                          }`}
                          data-ocid={`settings.theme_${t.id}.button`}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Font Size */}
                  <section>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Font Size: {settings.fontSize}px
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleSettingsChange({
                            fontSize: Math.max(settings.fontSize - 1, 8),
                          })
                        }
                        className="w-7 h-7 rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--hover-item)]"
                        data-ocid="settings.font_decrease.button"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        id="settings-font-size"
                        type="range"
                        min={8}
                        max={30}
                        value={settings.fontSize}
                        onChange={(e) =>
                          handleSettingsChange({
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="flex-1 accent-[var(--accent)]"
                        data-ocid="settings.font_size.input"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleSettingsChange({
                            fontSize: Math.min(settings.fontSize + 1, 30),
                          })
                        }
                        className="w-7 h-7 rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--hover-item)]"
                        data-ocid="settings.font_increase.button"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </section>

                  {/* Font Family */}
                  <section>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Font Family
                    </span>
                    <select
                      id="settings-font-family"
                      value={settings.fontFamily}
                      onChange={(e) =>
                        handleSettingsChange({ fontFamily: e.target.value })
                      }
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] text-xs rounded px-3 py-2 outline-none focus:border-[var(--accent)]"
                      data-ocid="settings.font_family.select"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </section>

                  {/* Tab Size */}
                  <section>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Tab Size
                    </span>
                    <div className="flex gap-2">
                      {[2, 4, 8].map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() =>
                            handleSettingsChange({ tabSize: size })
                          }
                          className={`px-4 py-1.5 rounded border text-xs transition-all ${
                            settings.tabSize === size
                              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                          }`}
                          data-ocid={`settings.tabsize_${size}.button`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Toggles */}
                  <section className="space-y-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Editor Options
                    </span>
                    {[
                      {
                        key: "wordWrap",
                        label: "Word Wrap",
                        icon: <AlignLeft size={13} />,
                      },
                      {
                        key: "minimap",
                        label: "Show Minimap",
                        icon: <Hash size={13} />,
                      },
                      {
                        key: "lineNumbers",
                        label: "Line Numbers",
                        icon: <Type size={13} />,
                      },
                      {
                        key: "fontLigatures",
                        label: "Font Ligatures",
                        icon: <Link size={13} />,
                      },
                    ].map(({ key, label, icon }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <span style={{ color: "var(--icon-inactive)" }}>
                            {icon}
                          </span>
                          {label}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleSettingsChange({
                              [key]: !settings[key as keyof typeof settings],
                            })
                          }
                          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                            settings[key as keyof typeof settings]
                              ? "bg-[var(--accent)]"
                              : "bg-[var(--border)]"
                          }`}
                          data-ocid={`settings.${key}.toggle`}
                        >
                          <span
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                            style={{
                              left: settings[key as keyof typeof settings]
                                ? "calc(100% - 18px)"
                                : "2px",
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </section>
                </div>
              )}

              {activeTab === "keybindings" && (
                <div className="p-4">
                  <div
                    className="flex items-center gap-2 rounded border border-[var(--border)] px-2 py-1.5 mb-3"
                    style={{ background: "var(--bg-input)" }}
                  >
                    <Keyboard
                      size={11}
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
                      placeholder="Search keybindings..."
                      value={kbSearch}
                      onChange={(e) => setKbSearch(e.target.value)}
                      data-ocid="settings.keybindings.search_input"
                    />
                  </div>
                  <div className="space-y-0.5">
                    {filteredShortcuts.map(({ key, action }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-2 rounded hover:bg-[var(--hover-item)] transition-colors"
                      >
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {action}
                        </span>
                        <kbd
                          className="text-[10px] rounded px-1.5 py-0.5 border flex-shrink-0"
                          style={{
                            background: "var(--bg-tab-inactive)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  resetSettings();
                  addNotification({
                    message: "Settings reset to defaults",
                    type: "info",
                  });
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                data-ocid="settings.reset.button"
              >
                Reset to defaults
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded text-xs text-white transition-colors"
                style={{ background: "var(--accent)" }}
                data-ocid="settings.save.button"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
