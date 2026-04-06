import {
  Bot,
  Brain,
  FileCode,
  GitBranch,
  Keyboard,
  Layers,
  Monitor,
  MousePointer2,
  Plus,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import { useEditorStore } from "../../stores/editorStore";
import {
  FILE_CONTENTS,
  getLanguageFromPath,
} from "../filesystem/mockFileSystem";

const RECENT_FILES = [
  {
    name: "Button.tsx",
    path: "src/components/Button.tsx",
    id: "file-button",
    lang: "tsx",
    color: "#61dafb",
  },
  {
    name: "Dashboard.tsx",
    path: "src/pages/Dashboard.tsx",
    id: "file-dashboard",
    lang: "tsx",
    color: "#61dafb",
  },
  {
    name: "main.mo",
    path: "backend/canisters/main.mo",
    id: "file-mainmo",
    lang: "mo",
    color: "#f7c948",
  },
  {
    name: "useAuth.ts",
    path: "src/hooks/useAuth.ts",
    id: "file-useauth",
    lang: "ts",
    color: "#4ec9b0",
  },
];

const SHORTCUTS = [
  { key: "Ctrl+P", action: "Quick Open File" },
  { key: "Ctrl+Shift+P", action: "Command Palette" },
  { key: "Ctrl+W", action: "Close Tab" },
  { key: "Ctrl+S", action: "Save File" },
  { key: "Ctrl+B", action: "Toggle Sidebar" },
  { key: "Ctrl+`", action: "Toggle Terminal" },
  { key: "Ctrl+\\", action: "Split Editor" },
  { key: "Ctrl+Shift+F11", action: "Focus Mode" },
  { key: "Shift+?", action: "Keyboard Overlay" },
  { key: "Ctrl+H", action: "Find & Replace" },
];

const PHASE4_FEATURES = [
  { icon: <Brain size={12} />, label: "Code Intelligence", color: "#c678dd" },
  { icon: <Zap size={12} />, label: "Focus Mode", color: "#f7c948" },
  { icon: <Layers size={12} />, label: "3 New Themes", color: "#4ec9b0" },
  {
    icon: <Bot size={12} />,
    label: "AI Quick Actions",
    color: "var(--accent)",
  },
  { icon: <Shield size={12} />, label: "Keyboard Overlay", color: "#e06c75" },
  { icon: <GitBranch size={12} />, label: "Live Collab", color: "#22c55e" },
  { icon: <Monitor size={12} />, label: "Performance Tab", color: "#fd971f" },
  {
    icon: <MousePointer2 size={12} />,
    label: "Context Menus",
    color: "#61afef",
  },
];

const STATS = [
  { label: "Files", value: "12", color: "#61dafb" },
  { label: "Extensions", value: "8", color: "#c678dd" },
  { label: "Themes", value: "8", color: "#f7c948" },
  { label: "Lines", value: "2.4k", color: "#22c55e" },
];

export const WelcomeTab: React.FC = () => {
  const { openFile } = useEditorStore();
  const isMobile = useIsMobile();

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
      content: "// TODO: Start coding here\n",
      language: "typescript",
      isDirty: false,
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-6 md:p-10"
      style={{ background: "var(--bg-editor)" }}
    >
      <motion.div
        className="max-w-3xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero Section */}
        <div
          className="hero-blob rounded-xl mb-8 p-8 text-center relative overflow-hidden"
          style={{ border: "1px solid rgba(97,218,251,0.1)" }}
        >
          <div className="relative z-10">
            <motion.div
              className="flex items-center justify-center gap-3 mb-5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #007acc, #61dafb)",
                  boxShadow: "0 0 40px rgba(0,122,204,0.4)",
                }}
              >
                <Zap size={28} color="#fff" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{
                background: "linear-gradient(90deg, #007acc, #61dafb, #c678dd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-1px",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              CodeVeda
            </motion.h1>

            <motion.p
              className="text-sm md:text-base mb-1"
              style={{ color: "var(--text-secondary)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Phase 4 — Elite browser IDE for the Internet Computer
            </motion.p>
            <motion.p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              Powered by Monaco Editor · React 19 · ICP
            </motion.p>
          </div>
        </div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-4 gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg p-3 flex flex-col items-center gap-1"
              style={{
                background: "var(--bg-sidebar)",
                borderLeft: `3px solid ${stat.color}`,
                border: "1px solid var(--border)",
                borderLeftColor: stat.color,
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: stat.color, lineHeight: 1 }}
              >
                {stat.value}
              </span>
              <span
                className="text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Phase 4 Feature Chips */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            ✨ What&apos;s New in Phase 4
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PHASE4_FEATURES.map((feat) => (
              <span
                key={feat.label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border"
                style={{
                  borderColor: `${feat.color}44`,
                  background: `${feat.color}11`,
                  color: feat.color,
                }}
              >
                {feat.icon} {feat.label}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start + Recent */}
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
              >
                <Terminal size={16} style={{ color: "#22c55e" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Open Terminal
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-3 py-2 rounded text-left hover:bg-[var(--hover-item)] transition-colors"
              >
                <GitBranch size={16} style={{ color: "#f7c948" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Clone Repository
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
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: `${file.color}22`,
                      color: file.color,
                      fontFamily: "'JetBrains Mono', monospace",
                      minWidth: 28,
                      textAlign: "center",
                    }}
                  >
                    {file.lang}
                  </span>
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

          {/* Shortcuts */}
          {!isMobile && (
            <div>
              <h2
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="flex items-center gap-1">
                  <Keyboard size={12} /> Shortcuts
                </span>
              </h2>
              <div className="space-y-0.5">
                {SHORTCUTS.map(({ key, action }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-[var(--hover-item)] transition-colors"
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
        <div className="mt-8 text-center border-t border-[var(--border)] pt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileCode size={12} style={{ color: "var(--text-muted)" }} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              CodeVeda IDE v4.0 — Built with React 19 + Monaco Editor + ICP
            </p>
          </div>
          <p
            className="text-[10px] mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            &copy; {new Date().getFullYear()}. Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
