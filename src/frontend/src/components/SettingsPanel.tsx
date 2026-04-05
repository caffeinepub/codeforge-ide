import {
  AlignLeft,
  Hash,
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
import { useEditorStore } from "../stores/editorStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore } from "../stores/themeStore";
import type { IDETheme } from "../stores/themeStore";

const FONT_FAMILIES = [
  { label: "Fira Code", value: "'Fira Code', Consolas, monospace" },
  { label: "Consolas", value: "Consolas, 'Courier New', monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "SF Mono", value: "'SF Mono', 'Fira Code', monospace" },
  { label: "System Mono", value: "monospace" },
];

export const SettingsPanel: React.FC = () => {
  const { showSettings, setShowSettings } = useEditorStore();
  const { theme, setTheme } = useThemeStore();
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  const handleSave = () => {
    setShowSettings(false);
    addNotification({ message: "Settings saved", type: "success" });
  };

  const themes: { id: IDETheme; label: string; icon: React.ReactNode }[] = [
    { id: "dark", label: "Dark+", icon: <Moon size={14} /> },
    { id: "light", label: "Light+", icon: <Sun size={14} /> },
    {
      id: "high-contrast",
      label: "High Contrast",
      icon: <Monitor size={14} />,
    },
  ];

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
            className="relative w-full max-w-xl rounded-lg shadow-2xl border border-[var(--border)] overflow-hidden"
            style={{ background: "var(--bg-sidebar)", maxHeight: "85vh" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="settings.modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Settings
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
                data-ocid="settings.close_button"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto p-6 space-y-6"
              style={{ maxHeight: "calc(85vh - 120px)" }}
            >
              {/* Theme */}
              <section>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Color Theme
                </span>
                <div className="flex gap-2">
                  {themes.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded border text-xs transition-all flex-1 justify-center ${
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
                      updateSettings({
                        fontSize: Math.max(settings.fontSize - 1, 8),
                      })
                    }
                    className="w-7 h-7 rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--hover-item)] hover:text-[var(--text-primary)]"
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
                      updateSettings({ fontSize: Number(e.target.value) })
                    }
                    className="flex-1 accent-[var(--accent)]"
                    data-ocid="settings.font_size.input"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        fontSize: Math.min(settings.fontSize + 1, 30),
                      })
                    }
                    className="w-7 h-7 rounded border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--hover-item)] hover:text-[var(--text-primary)]"
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
                    updateSettings({ fontFamily: e.target.value })
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
                      onClick={() => updateSettings({ tabSize: size })}
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
                ].map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span style={{ color: "var(--icon-inactive)" }}>
                        {icon}
                      </span>
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
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

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
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
