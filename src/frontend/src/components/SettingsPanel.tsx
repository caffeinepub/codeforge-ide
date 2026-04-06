import {
  AlignLeft,
  Bell,
  CheckCircle2,
  Cloud,
  Download,
  Globe,
  Hash,
  Keyboard,
  Link,
  Loader2,
  Lock,
  Minus,
  Monitor,
  Moon,
  Palette,
  Plus,
  Shield,
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

const ACCENT_COLORS = [
  { color: "#007acc", label: "Blue" },
  { color: "#c678dd", label: "Purple" },
  { color: "#e06c75", label: "Red" },
  { color: "#98c379", label: "Green" },
  { color: "#e5c07b", label: "Gold" },
  { color: "#56b6c2", label: "Cyan" },
];

type SettingsTab =
  | "editor"
  | "appearance"
  | "privacy"
  | "notifications"
  | "keybindings";

export const SettingsPanel: React.FC = () => {
  const { showSettings, setShowSettings } = useEditorStore();
  const { theme, setTheme } = useThemeStore();
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { addNotification } = useNotificationStore();
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("editor");
  const [kbSearch, setKbSearch] = useState("");
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadedRef = useRef(false);

  // Appearance state
  const [density, setDensity] = useState<"compact" | "default" | "comfortable">(
    "default",
  );
  const [sidebarPos, setSidebarPos] = useState<"left" | "right">("left");
  const [showActivityLabels, setShowActivityLabels] = useState(true);
  const [cursorStyle, setCursorStyle] = useState<
    "line" | "block" | "underline"
  >("line");
  const [smoothScrolling, setSmoothScrolling] = useState(true);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [accentColor, setAccentColor] = useState("#007acc");

  // Privacy state
  const [profilePublic, setProfilePublic] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Notifications state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifFollow, setNotifFollow] = useState(true);
  const [notifMention, setNotifMention] = useState(true);
  const [notifPRReview, setNotifPRReview] = useState(true);
  const [notifCIFail, setNotifCIFail] = useState(true);
  const [notifCISuccess, setNotifCISuccess] = useState(false);
  const [notifSound, setNotifSound] = useState(false);

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

  useEffect(() => {
    if (!showSettings) isLoadedRef.current = false;
  }, [showSettings]);

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

  const handleExportData = () => {
    const data = {
      profile: {
        displayName: "CodeVeda User",
        bio: "",
        location: "",
        website: "",
      },
      settings: {
        theme,
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codeveda-profile-export.json";
    a.click();
    URL.revokeObjectURL(url);
    addNotification({ message: "Profile data exported", type: "success" });
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

  const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "editor", label: "Editor", icon: <Type size={11} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={11} /> },
    { id: "privacy", label: "Privacy", icon: <Shield size={11} /> },
    { id: "notifications", label: "Notifs", icon: <Bell size={11} /> },
    { id: "keybindings", label: "Keys", icon: <Keyboard size={11} /> },
  ];

  const Toggle = ({
    checked,
    onChange,
    ocid,
    disabled,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    ocid?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-40 ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"
      }`}
      data-ocid={ocid}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
        style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );

  const Section = ({
    title,
    children,
  }: { title: string; children: React.ReactNode }) => (
    <section>
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {title}
      </span>
      {children}
    </section>
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
            style={{ background: "var(--bg-sidebar)", maxHeight: "90vh" }}
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

            {/* Tabs — horizontally scrollable */}
            <div
              className="flex border-b border-[var(--border)] overflow-x-auto"
              style={{ background: "var(--bg-tab-bar)" }}
            >
              {TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "text-[var(--text-primary)] border-[var(--accent)]"
                      : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                  }`}
                  data-ocid={`settings.${tab.id}.tab`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 155px)" }}
            >
              {/* EDITOR TAB */}
              {activeTab === "editor" && (
                <div className="p-5 space-y-5">
                  <Section title="Color Theme">
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
                  </Section>

                  <Section title={`Font Size: ${settings.fontSize}px`}>
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
                  </Section>

                  <Section title="Font Family">
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
                  </Section>

                  <Section title="Tab Size">
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
                  </Section>

                  <Section title="Editor Options">
                    <div className="space-y-3">
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
                    </div>
                  </Section>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <div className="p-5 space-y-6">
                  {/* UI Density */}
                  <Section title="UI Density">
                    <div
                      className="flex rounded border border-[var(--border)] overflow-hidden"
                      style={{ background: "var(--bg-input)" }}
                    >
                      {(["compact", "default", "comfortable"] as const).map(
                        (d) => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => setDensity(d)}
                            className="flex-1 py-1.5 text-xs font-medium capitalize transition-colors"
                            style={{
                              background:
                                density === d ? "var(--accent)" : "transparent",
                              color:
                                density === d
                                  ? "white"
                                  : "var(--text-secondary)",
                            }}
                            data-ocid={`settings.density_${d}.button`}
                          >
                            {d}
                          </button>
                        ),
                      )}
                    </div>
                  </Section>

                  {/* Sidebar Position */}
                  <Section title="Sidebar Position">
                    <div
                      className="flex rounded border border-[var(--border)] overflow-hidden w-40"
                      style={{ background: "var(--bg-input)" }}
                    >
                      {(["left", "right"] as const).map((pos) => (
                        <button
                          type="button"
                          key={pos}
                          onClick={() => setSidebarPos(pos)}
                          className="flex-1 py-1.5 text-xs font-medium capitalize transition-colors"
                          style={{
                            background:
                              sidebarPos === pos
                                ? "var(--accent)"
                                : "transparent",
                            color:
                              sidebarPos === pos
                                ? "white"
                                : "var(--text-secondary)",
                          }}
                          data-ocid={`settings.sidebar_${pos}.button`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Toggle rows */}
                  <Section title="Interface">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Activity Bar Labels
                        </span>
                        <Toggle
                          checked={showActivityLabels}
                          onChange={setShowActivityLabels}
                          ocid="settings.activity_labels.toggle"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Smooth Scrolling
                        </span>
                        <Toggle
                          checked={smoothScrolling}
                          onChange={setSmoothScrolling}
                          ocid="settings.smooth_scroll.toggle"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Reduce Animations
                        </span>
                        <Toggle
                          checked={reduceAnimations}
                          onChange={setReduceAnimations}
                          ocid="settings.reduce_animations.toggle"
                        />
                      </div>
                    </div>
                  </Section>

                  {/* Cursor Style */}
                  <Section title="Cursor Style">
                    <div
                      className="flex rounded border border-[var(--border)] overflow-hidden"
                      style={{ background: "var(--bg-input)" }}
                    >
                      {(["line", "block", "underline"] as const).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setCursorStyle(c)}
                          className="flex-1 py-1.5 text-xs font-medium capitalize transition-colors"
                          style={{
                            background:
                              cursorStyle === c
                                ? "var(--accent)"
                                : "transparent",
                            color:
                              cursorStyle === c
                                ? "white"
                                : "var(--text-secondary)",
                          }}
                          data-ocid={`settings.cursor_${c}.button`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Accent Color */}
                  <Section title="Accent Color">
                    <div className="flex items-center gap-2">
                      {ACCENT_COLORS.map(({ color, label }) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setAccentColor(color)}
                          className="w-7 h-7 rounded-full transition-transform hover:scale-110 relative flex-shrink-0"
                          style={{
                            background: color,
                            boxShadow:
                              accentColor === color
                                ? `0 0 0 2px var(--bg-sidebar), 0 0 0 4px ${color}`
                                : "none",
                          }}
                          aria-label={`Accent color ${label}`}
                          data-ocid={`settings.accent_${label.toLowerCase()}.button`}
                        />
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === "privacy" && (
                <div className="p-5 space-y-6">
                  {/* Profile Visibility */}
                  <Section title="Profile Visibility">
                    <div
                      className="flex rounded border border-[var(--border)] overflow-hidden w-44"
                      style={{ background: "var(--bg-input)" }}
                    >
                      <button
                        type="button"
                        onClick={() => setProfilePublic(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: profilePublic
                            ? "var(--accent)"
                            : "transparent",
                          color: profilePublic
                            ? "white"
                            : "var(--text-secondary)",
                        }}
                        data-ocid="settings.profile_public.button"
                      >
                        <Globe size={10} /> Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfilePublic(false)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: !profilePublic
                            ? "var(--accent)"
                            : "transparent",
                          color: !profilePublic
                            ? "white"
                            : "var(--text-secondary)",
                        }}
                        data-ocid="settings.profile_private.button"
                      >
                        <Lock size={10} /> Private
                      </button>
                    </div>
                  </Section>

                  {/* Privacy toggles */}
                  <Section title="Visibility">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Show Online Status
                        </span>
                        <Toggle
                          checked={showOnline}
                          onChange={setShowOnline}
                          ocid="settings.show_online.toggle"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Show Activity to Followers
                        </span>
                        <Toggle
                          checked={showActivity}
                          onChange={setShowActivity}
                          ocid="settings.show_activity.toggle"
                        />
                      </div>
                    </div>
                  </Section>

                  {/* 2FA info */}
                  <Section title="Security">
                    <div
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded"
                      style={{
                        background: "rgba(152,195,121,0.08)",
                        border: "1px solid rgba(152,195,121,0.25)",
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        style={{ color: "#98c379", flexShrink: 0 }}
                      />
                      <div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#98c379" }}
                        >
                          2FA via Internet Identity
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Your identity is secured by ICP cryptography
                        </p>
                      </div>
                    </div>
                  </Section>

                  {/* Export */}
                  <Section title="Data">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="flex items-center gap-2 px-3 py-2 rounded border border-[var(--border)] text-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                      style={{ color: "var(--text-secondary)" }}
                      data-ocid="settings.export.button"
                    >
                      <Download size={12} />
                      Export Profile Data
                    </button>
                  </Section>

                  {/* Danger Zone */}
                  <section>
                    <div
                      className="rounded border p-4"
                      style={{
                        borderColor: "rgba(224,108,117,0.4)",
                        background: "rgba(224,108,117,0.04)",
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                        style={{ color: "#e06c75" }}
                      >
                        Danger Zone
                      </p>
                      {deleteConfirm ? (
                        <div className="space-y-2">
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Are you sure? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm(false);
                                addNotification({
                                  message: "Account deletion cancelled",
                                  type: "info",
                                });
                              }}
                              className="px-3 py-1.5 rounded border border-[var(--border)] text-xs"
                              style={{ color: "var(--text-secondary)" }}
                              data-ocid="settings.delete_cancel.button"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm(false);
                                addNotification({
                                  message: "Account deletion requested",
                                  type: "error",
                                });
                              }}
                              className="px-3 py-1.5 rounded text-xs font-medium"
                              style={{
                                background: "#e06c75",
                                color: "white",
                              }}
                              data-ocid="settings.delete_confirm.button"
                            >
                              Confirm Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(true)}
                          className="px-3 py-1.5 rounded text-xs font-medium border"
                          style={{
                            color: "#e06c75",
                            borderColor: "rgba(224,108,117,0.4)",
                            background: "transparent",
                          }}
                          data-ocid="settings.delete.button"
                        >
                          Delete Account
                        </button>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="p-5 space-y-6">
                  {/* Master toggle */}
                  <Section title="Push Notifications">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Enable Push Notifications
                      </span>
                      <Toggle
                        checked={pushEnabled}
                        onChange={setPushEnabled}
                        ocid="settings.push_notif.toggle"
                      />
                    </div>
                  </Section>

                  {/* Per-event toggles */}
                  <Section title="Notify Me When">
                    <div className="space-y-3">
                      {[
                        {
                          label: "Someone follows me",
                          checked: notifFollow,
                          set: setNotifFollow,
                          ocid: "settings.notif_follow.toggle",
                        },
                        {
                          label: "Someone mentions me",
                          checked: notifMention,
                          set: setNotifMention,
                          ocid: "settings.notif_mention.toggle",
                        },
                        {
                          label: "PR review requested",
                          checked: notifPRReview,
                          set: setNotifPRReview,
                          ocid: "settings.notif_pr.toggle",
                        },
                        {
                          label: "CI/CD pipeline fails",
                          checked: notifCIFail,
                          set: setNotifCIFail,
                          ocid: "settings.notif_ci_fail.toggle",
                        },
                        {
                          label: "CI/CD pipeline succeeds",
                          checked: notifCISuccess,
                          set: setNotifCISuccess,
                          ocid: "settings.notif_ci_success.toggle",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between"
                        >
                          <span
                            className="text-xs"
                            style={{
                              color: pushEnabled
                                ? "var(--text-secondary)"
                                : "var(--text-muted)",
                            }}
                          >
                            {item.label}
                          </span>
                          <Toggle
                            checked={item.checked && pushEnabled}
                            onChange={item.set}
                            disabled={!pushEnabled}
                            ocid={item.ocid}
                          />
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Sound */}
                  <Section title="Sound">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Notification Sound
                      </span>
                      <Toggle
                        checked={notifSound}
                        onChange={setNotifSound}
                        ocid="settings.notif_sound.toggle"
                      />
                    </div>
                  </Section>

                  {/* Email (disabled) */}
                  <Section title="Email Notifications">
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Email Notifications
                        </span>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--text-muted)", opacity: 0.6 }}
                        >
                          Available on paid plans
                        </p>
                      </div>
                      <Toggle
                        checked={false}
                        onChange={() => {}}
                        disabled
                        ocid="settings.email_notif.toggle"
                      />
                    </div>
                  </Section>
                </div>
              )}

              {/* KEYBINDINGS TAB */}
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
