import {
  Brain,
  CheckCircle,
  Code2,
  FileCode,
  Minimize2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type React from "react";
import { useEditorStore } from "../stores/editorStore";
import { useNotificationStore } from "../stores/notificationStore";

const MOCK_OUTLINE = [
  { kind: "function", name: "handleSubmit", line: 12 },
  { kind: "function", name: "validateInput", line: 28 },
  { kind: "class", name: "AuthController", line: 45 },
  { kind: "function", name: "parseTokens", line: 67 },
  { kind: "function", name: "encodePayload", line: 89 },
  { kind: "class", name: "RequestBuilder", line: 102 },
];

const LANG_STATS = [
  { label: "TypeScript", percent: 68, color: "#4ec9b0" },
  { label: "Motoko", percent: 22, color: "#f7c948" },
  { label: "CSS", percent: 10, color: "#61dafb" },
];

export const IntelligencePanel: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const { addNotification } = useNotificationStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const notify = (msg: string) =>
    addNotification({ message: msg, type: "success" });

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-activity)" }}
      >
        <Brain size={13} style={{ color: "#c678dd" }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          Code Intelligence
        </span>
      </div>

      <div className="p-3 space-y-4">
        {/* Active file */}
        <div
          className="rounded-lg p-2.5"
          style={{
            background: "var(--bg-activity)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileCode size={11} style={{ color: "var(--accent)" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Active File
            </span>
          </div>
          <p
            className="text-xs truncate"
            style={{
              color: "var(--text-primary)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {activeFile?.path ?? "No file open"}
          </p>
        </div>

        {/* Complexity Score */}
        <div
          className="rounded-lg p-2.5"
          style={{
            background: "var(--bg-activity)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Complexity Score
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#22c55e22", color: "#22c55e" }}
            >
              3/10
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 4, background: "var(--bg-input)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: "30%", background: "#22c55e" }}
            />
          </div>
          <p
            className="text-[10px] mt-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Low complexity — easy to maintain
          </p>
        </div>

        {/* File Outline */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Outline
          </p>
          <div className="space-y-0.5">
            {MOCK_OUTLINE.map((item) => (
              <div
                key={`${item.name}-${item.line}`}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--hover-item)] cursor-pointer transition-colors"
              >
                <Code2
                  size={10}
                  style={{
                    color: item.kind === "class" ? "#c678dd" : "#61afef",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-xs flex-1 truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.name}
                </span>
                <span
                  className="text-[10px] flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  :{item.line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Actions */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Code Actions
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => notify("File formatted successfully")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors hover:bg-[var(--hover-item)]"
              style={{
                background: "var(--bg-activity)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              data-ocid="intelligence.format.button"
            >
              <RefreshCw size={11} style={{ color: "#61afef" }} />
              Format Document
            </button>
            <button
              type="button"
              onClick={() => notify("No issues found — code looks clean!")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors hover:bg-[var(--hover-item)]"
              style={{
                background: "var(--bg-activity)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              data-ocid="intelligence.lint.button"
            >
              <ShieldCheck size={11} style={{ color: "#22c55e" }} />
              Run Linter
            </button>
            <button
              type="button"
              onClick={() => notify("Minified: 4.2 KB \u2192 1.8 KB")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors hover:bg-[var(--hover-item)]"
              style={{
                background: "var(--bg-activity)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              data-ocid="intelligence.minify.button"
            >
              <Minimize2 size={11} style={{ color: "#f7c948" }} />
              Minify
            </button>
          </div>
        </div>

        {/* Language Stats */}
        <div
          className="rounded-lg p-2.5"
          style={{
            background: "var(--bg-activity)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={11} style={{ color: "var(--accent)" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Language Mix
            </span>
          </div>
          <div className="space-y-2">
            {LANG_STATS.map((lang) => (
              <div key={lang.label}>
                <div className="flex justify-between mb-1">
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {lang.label}
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: lang.color }}
                  >
                    {lang.percent}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 3, background: "var(--bg-input)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.percent}%`,
                      background: lang.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
