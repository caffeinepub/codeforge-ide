import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../stores/editorStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore } from "../stores/themeStore";
import type { IDETheme } from "../stores/themeStore";

interface Command {
  id: string;
  label: string;
  description?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    showCommandPalette,
    setShowCommandPalette,
    setShowSettings,
    setSplitMode,
    splitMode,
  } = useEditorStore();
  const { setTheme } = useThemeStore();
  const { updateSettings, settings } = useSettingsStore();
  const { addNotification } = useNotificationStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCommandPalette) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  const allCommands: Command[] = [
    {
      id: "theme-dark",
      label: "Color Theme: Dark+",
      description: "Switch to VS Code Dark+ theme",
      action: () => {
        setTheme("dark" as IDETheme);
        addNotification({ message: "Theme: Dark+", type: "info" });
      },
    },
    {
      id: "theme-light",
      label: "Color Theme: Light+",
      description: "Switch to VS Code Light+ theme",
      action: () => {
        setTheme("light" as IDETheme);
        addNotification({ message: "Theme: Light+", type: "info" });
      },
    },
    {
      id: "theme-hc",
      label: "Color Theme: High Contrast Dark",
      description: "Switch to High Contrast Dark theme",
      action: () => {
        setTheme("high-contrast" as IDETheme);
        addNotification({ message: "Theme: High Contrast Dark", type: "info" });
      },
    },
    {
      id: "toggle-minimap",
      label: "Toggle Minimap",
      action: () => {
        updateSettings({ minimap: !settings.minimap });
        addNotification({
          message: `Minimap ${settings.minimap ? "hidden" : "visible"}`,
          type: "info",
        });
      },
    },
    {
      id: "toggle-wordwrap",
      label: "Toggle Word Wrap",
      action: () => {
        updateSettings({ wordWrap: !settings.wordWrap });
        addNotification({
          message: `Word Wrap ${settings.wordWrap ? "off" : "on"}`,
          type: "info",
        });
      },
    },
    {
      id: "split-horizontal",
      label: "Split Editor Horizontally",
      action: () => {
        setSplitMode(true, "horizontal");
        addNotification({ message: "Editor split horizontally", type: "info" });
      },
    },
    {
      id: "split-vertical",
      label: "Split Editor Vertically",
      action: () => {
        setSplitMode(true, "vertical");
        addNotification({ message: "Editor split vertically", type: "info" });
      },
    },
    {
      id: "unsplit",
      label: "Close Split Editor",
      action: () => {
        setSplitMode(!splitMode);
      },
    },
    {
      id: "open-settings",
      label: "Open Settings",
      description: "Open the settings panel",
      action: () => setShowSettings(true),
    },
    {
      id: "font-increase",
      label: "Increase Font Size",
      action: () => {
        updateSettings({ fontSize: Math.min(settings.fontSize + 2, 30) });
        addNotification({
          message: `Font size: ${settings.fontSize + 2}`,
          type: "info",
        });
      },
    },
    {
      id: "font-decrease",
      label: "Decrease Font Size",
      action: () => {
        updateSettings({ fontSize: Math.max(settings.fontSize - 2, 8) });
        addNotification({
          message: `Font size: ${settings.fontSize - 2}`,
          type: "info",
        });
      },
    },
    {
      id: "toggle-linenumbers",
      label: "Toggle Line Numbers",
      action: () => {
        updateSettings({ lineNumbers: !settings.lineNumbers });
      },
    },
  ];

  const filtered = query.trim()
    ? allCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : allCommands;

  // biome-ignore lint/correctness/useExhaustiveDependencies: filtered is derived from allCommands
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowCommandPalette(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setShowCommandPalette(false);
    }
  };

  return (
    <AnimatePresence>
      {showCommandPalette && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
            }}
          />
          <motion.div
            className="relative w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden border border-[var(--border)]"
            style={{ background: "var(--bg-sidebar)" }}
            initial={{ scale: 0.97, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -12, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="command_palette.modal"
          >
            <input
              ref={inputRef}
              className="w-full px-4 py-3 text-sm outline-none bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] border-b border-[var(--border)]"
              placeholder="Type a command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              data-ocid="command_palette.search_input"
            />
            <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                  No commands found
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    type="button"
                    key={cmd.id}
                    className={`flex items-center justify-between w-full px-4 py-2.5 cursor-pointer transition-colors text-left ${
                      i === selectedIndex
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-primary)] hover:bg-[var(--hover-item)]"
                    }`}
                    onClick={() => {
                      cmd.action();
                      setShowCommandPalette(false);
                    }}
                    data-ocid={`command_palette.item.${i + 1}`}
                  >
                    <div>
                      <div className="text-xs font-medium">{cmd.label}</div>
                      {cmd.description && (
                        <div
                          className="text-[10px] mt-0.5"
                          style={{
                            color:
                              i === selectedIndex
                                ? "rgba(255,255,255,0.7)"
                                : "var(--text-muted)",
                          }}
                        >
                          {cmd.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
