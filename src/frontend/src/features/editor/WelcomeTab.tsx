import { Clock, Keyboard, Plus, Terminal } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEditorStore } from "../../stores/editorStore";
import {
  FILE_CONTENTS,
  getLanguageFromPath,
} from "../filesystem/mockFileSystem";

const RECENT_FILES = [
  { name: "Button.tsx", path: "src/components/Button.tsx", id: "file-button" },
  {
    name: "Dashboard.tsx",
    path: "src/pages/Dashboard.tsx",
    id: "file-dashboard",
  },
  { name: "main.mo", path: "backend/canisters/main.mo", id: "file-mainmo" },
  { name: "useAuth.ts", path: "src/hooks/useAuth.ts", id: "file-useauth" },
];

const SHORTCUTS = [
  { key: "Ctrl+P", action: "Quick Open File" },
  { key: "Ctrl+Shift+P", action: "Command Palette" },
  { key: "Ctrl+W", action: "Close Tab" },
  { key: "Ctrl+S", action: "Save File" },
  { key: "Ctrl+B", action: "Toggle Sidebar" },
  { key: "Ctrl+`", action: "Toggle Terminal" },
  { key: "Ctrl+\\", action: "Split Editor" },
  { key: "Ctrl+Z", action: "Undo" },
  { key: "Ctrl+H", action: "Find & Replace" },
  { key: "Ctrl+F", action: "Find in File" },
];

export const WelcomeTab: React.FC = () => {
  const { openFile } = useEditorStore();

  const handleOpenRecent = (file: (typeof RECENT_FILES)[0]) => {
    const content = FILE_CONTENTS[file.path] ?? `// ${file.name}\n`;
    openFile({
      id: file.id,
      name: file.name,
      path: file.path,
      content,
      language: getLanguageFromPath(file.path),
      isDirty: false,
    });
  };

  const handleNewFile = () => {
    const id = `new-${Date.now().toString(36)}`;
    openFile({
      id,
      name: "untitled.ts",
      path: "untitled.ts",
      content: "",
      language: "typescript",
      isDirty: false,
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-12"
      style={{ background: "var(--bg-editor)" }}
    >
      <motion.div
        className="max-w-3xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 32px var(--accent)44",
              }}
            >
              \u26a1
            </div>
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            CodeForge IDE
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            A VS Code-like editor for the Web, powered by Internet Computer
            Protocol
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Start
            </h2>
            <div className="space-y-1">
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-2 rounded text-left hover:bg-[var(--hover-item)] transition-colors"
                onClick={handleNewFile}
                data-ocid="welcome.primary_button"
              >
                <Plus size={16} style={{ color: "var(--accent)" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  New File
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-2 rounded text-left hover:bg-[var(--hover-item)] transition-colors"
                onClick={() => {}}
              >
                <Terminal size={16} style={{ color: "var(--accent)" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Open Terminal
                </span>
              </button>
            </div>

            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3 mt-6"
              style={{ color: "var(--text-muted)" }}
            >
              Recent
            </h2>
            <div className="space-y-1">
              {RECENT_FILES.map((file) => (
                <button
                  type="button"
                  key={file.id}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded text-left hover:bg-[var(--hover-item)] transition-colors"
                  onClick={() => handleOpenRecent(file)}
                >
                  <Clock size={14} style={{ color: "var(--icon-inactive)" }} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {file.name}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {file.path}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="flex items-center gap-1">
                <Keyboard size={12} /> Shortcuts
              </span>
            </h2>
            <div className="space-y-1">
              {SHORTCUTS.map(({ key, action }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-1.5"
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {action}
                  </span>
                  <kbd
                    className="text-[10px] rounded px-1.5 py-0.5 border"
                    style={{
                      background: "var(--bg-tab-inactive)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center border-t border-[var(--border)] pt-6">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Phase 2: AI Assistant, Extensions Marketplace, Cloud Sync,
            Collaborative Editing
          </p>
        </div>
      </motion.div>
    </div>
  );
};
