import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  GitCompare,
  ListTodo,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useRef, useState } from "react";
import { useEditorStore } from "../stores/editorStore";
import { InteractiveTerminal } from "./InteractiveTerminal";
import { TodoPanel } from "./TodoPanel";

interface BottomPanelProps {
  visible: boolean;
  height: number;
  onHeightChange: (h: number) => void;
  onToggle: () => void;
  isMobile?: boolean;
  initialTab?: PanelTab;
}

const MOCK_PROBLEMS = [
  {
    type: "error",
    file: "src/components/Button.tsx",
    line: 42,
    col: 8,
    message: "Type 'string | undefined' is not assignable to type 'string'",
  },
  {
    type: "warning",
    file: "src/pages/Dashboard.tsx",
    line: 17,
    col: 3,
    message: "Variable 'stats' is declared but its value is never read",
  },
  {
    type: "warning",
    file: "src/hooks/useAuth.ts",
    line: 88,
    col: 12,
    message: "'registerUser' is defined but never used",
  },
  {
    type: "error",
    file: "src/utils/api.ts",
    line: 56,
    col: 24,
    message: "Cannot find name 'RequestConfig'. Did you mean 'RequestOptions'?",
  },
  {
    type: "info",
    file: "src/App.tsx",
    line: 11,
    col: 1,
    message: "'React' is defined but never used",
  },
  {
    type: "warning",
    file: "backend/canisters/main.mo",
    line: 32,
    col: 5,
    message: "Unused import: 'Array'",
  },
];

const OUTPUT_LINES = [
  "[12:03:21] Starting CodeVeda development server...",
  "[12:03:21] Loading TypeScript compiler v5.4.5",
  "[12:03:22] Compiling 47 source files...",
  "[12:03:23] \u2713 TypeScript compilation successful",
  "[12:03:23] Starting Vite dev server on http://localhost:5173",
  "[12:03:24] \u2713 Vite server ready in 1.2s",
  "[12:03:25] \u2713 Replica connected at http://localhost:4943",
  "[12:03:27] \u2713 Canister 'main' deployed: rrkah-fqaaa-aaaaa-aaaaq-cai",
  "[12:03:28] \u2713 All canisters deployed successfully",
  "[12:03:28] Ready. Watching for changes...",
];

const PERF_METRICS = [
  { label: "Memory Usage", value: "42.3 MB", percent: 35, color: "#61afef" },
  { label: "Build Time", value: "1.2s", percent: 60, color: "#f7c948" },
  { label: "Bundle Size", value: "892 KB", percent: 45, color: "#c678dd" },
];

export type PanelTab =
  | "problems"
  | "output"
  | "terminal"
  | "debug"
  | "todo"
  | "performance"
  | "diff";

interface BottomPanelHandle {
  setTab: (tab: PanelTab) => void;
}

/** Simple line-level text diff renderer — no external dependency */
function computeDiff(origLines: string[], modLines: string[]) {
  // Simple LCS-based diff: mark added/removed/same lines
  const result: {
    type: "same" | "removed" | "added";
    text: string;
    lineOrig?: number;
    lineMod?: number;
  }[] = [];
  let i = 0;
  let j = 0;
  // Use a simple approach: interleave lines showing +/-
  while (i < origLines.length || j < modLines.length) {
    const a = origLines[i];
    const b = modLines[j];
    if (i >= origLines.length) {
      result.push({ type: "added", text: b, lineMod: j + 1 });
      j++;
    } else if (j >= modLines.length) {
      result.push({ type: "removed", text: a, lineOrig: i + 1 });
      i++;
    } else if (a === b) {
      result.push({ type: "same", text: a, lineOrig: i + 1, lineMod: j + 1 });
      i++;
      j++;
    } else {
      result.push({ type: "removed", text: a, lineOrig: i + 1 });
      result.push({ type: "added", text: b, lineMod: j + 1 });
      i++;
      j++;
    }
  }
  return result;
}

const DiffTab: React.FC = () => {
  const { openFiles } = useEditorStore();
  const [origId, setOrigId] = useState<string>(openFiles[0]?.id ?? "");
  const [modId, setModId] = useState<string>(
    openFiles[1]?.id ?? openFiles[0]?.id ?? "",
  );

  const origFile = openFiles.find((f) => f.id === origId);
  const modFile = openFiles.find((f) => f.id === modId);

  const selectStyle: React.CSSProperties = {
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: 4,
    fontSize: 11,
    padding: "2px 6px",
    outline: "none",
  };

  if (openFiles.length < 2) {
    return (
      <div className="p-8 text-center">
        <GitCompare
          size={24}
          className="mx-auto mb-2"
          style={{ color: "var(--text-muted)" }}
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Open at least 2 files to use the diff viewer
        </p>
      </div>
    );
  }

  const origLines = (origFile?.content ?? "").split("\n");
  const modLines = (modFile?.content ?? "").split("\n");
  const diffLines = computeDiff(origLines, modLines);
  const changedCount = diffLines.filter((l) => l.type !== "same").length;

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-3 px-3 py-1.5 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--bg-panel)" }}
      >
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Original:
        </span>
        <select
          style={selectStyle}
          value={origId}
          onChange={(e) => setOrigId(e.target.value)}
        >
          {openFiles.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Modified:
        </span>
        <select
          style={selectStyle}
          value={modId}
          onChange={(e) => setModId(e.target.value)}
        >
          {openFiles.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <span
          className="text-[10px] ml-2"
          style={{ color: changedCount > 0 ? "#f7c948" : "#22c55e" }}
        >
          {changedCount > 0
            ? `${changedCount} changed line${changedCount !== 1 ? "s" : ""}`
            : "Files are identical"}
        </span>
      </div>
      <div
        className="flex-1 overflow-auto"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
      >
        {diffLines.map((line, idx) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: diff lines
            key={idx}
            className="flex items-start px-3 py-0"
            style={{
              background:
                line.type === "added"
                  ? "rgba(34,197,94,0.12)"
                  : line.type === "removed"
                    ? "rgba(239,68,68,0.12)"
                    : "transparent",
              borderLeft:
                line.type === "added"
                  ? "2px solid #22c55e"
                  : line.type === "removed"
                    ? "2px solid #ef4444"
                    : "2px solid transparent",
            }}
          >
            <span
              className="w-8 text-right flex-shrink-0 mr-3 select-none"
              style={{
                color: "var(--text-muted)",
                fontSize: 10,
                lineHeight: "1.6",
              }}
            >
              {line.lineOrig ?? ""}
            </span>
            <span
              className="w-4 flex-shrink-0 select-none"
              style={{
                color:
                  line.type === "added"
                    ? "#22c55e"
                    : line.type === "removed"
                      ? "#ef4444"
                      : "transparent",
                lineHeight: "1.6",
              }}
            >
              {line.type === "added"
                ? "+"
                : line.type === "removed"
                  ? "-"
                  : " "}
            </span>
            <span
              className="flex-1 whitespace-pre truncate"
              style={{
                color:
                  line.type === "same"
                    ? "var(--text-secondary)"
                    : "var(--text-primary)",
                lineHeight: "1.6",
              }}
            >
              {line.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BottomPanel = React.forwardRef<
  BottomPanelHandle,
  BottomPanelProps
>(
  (
    { visible, height, onHeightChange, onToggle, isMobile = false, initialTab },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState<PanelTab>(
      initialTab ?? "problems",
    );
    const isResizing = useRef(false);
    const startY = useRef(0);
    const startH = useRef(0);

    React.useImperativeHandle(ref, () => ({
      setTab: (tab: PanelTab) => setActiveTab(tab),
    }));

    const effectiveHeight = isMobile
      ? Math.min(Math.max(height, 160), window.innerHeight * 0.5)
      : height;

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
      isResizing.current = true;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      startY.current = clientY;
      startH.current = height;
      if (!("touches" in e)) (e as React.MouseEvent).preventDefault();
      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!isResizing.current) return;
        const y = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
        const delta = startY.current - y;
        const maxH = isMobile
          ? window.innerHeight * 0.5
          : window.innerHeight * 0.6;
        const minH = isMobile ? 160 : 80;
        onHeightChange(Math.max(minH, Math.min(startH.current + delta, maxH)));
      };
      const onUp = () => {
        isResizing.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onUp);
    };

    const TABS: { id: PanelTab; label: string; icon?: React.ReactNode }[] = [
      { id: "problems", label: "Problems" },
      { id: "output", label: "Output" },
      { id: "terminal", label: "Terminal" },
      { id: "debug", label: "Debug Console" },
      { id: "todo", label: "TODO", icon: <ListTodo size={11} /> },
      { id: "performance", label: "Performance", icon: <Activity size={11} /> },
      { id: "diff", label: "Diff", icon: <GitCompare size={11} /> },
    ];

    return (
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            className="flex-shrink-0 border-t border-[var(--border)] flex flex-col overflow-hidden"
            style={{ background: "var(--bg-panel)", height: effectiveHeight }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: effectiveHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-ocid="bottom.panel"
          >
            <div
              className={`flex-shrink-0 cursor-ns-resize hover:bg-[var(--accent)] transition-colors ${isMobile ? "h-3" : "h-1"}`}
              style={{ background: "transparent" }}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
            />

            <div
              className="flex items-center border-b border-[var(--border)] flex-shrink-0 px-2 overflow-x-auto"
              style={{
                height: 32,
                background: "var(--bg-tab-bar)",
                scrollbarWidth: "none",
              }}
            >
              {TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 h-full text-xs transition-colors border-b-2 whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                    activeTab === tab.id
                      ? "text-[var(--text-primary)] border-[var(--accent)]"
                      : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                  }`}
                  data-ocid={`bottom.${tab.id}.tab`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={onToggle}
                  className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  title="Close Panel"
                  data-ocid="bottom.close_button"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "problems" && (
                <div className="p-2 h-full overflow-y-auto">
                  {MOCK_PROBLEMS.map((problem) => (
                    <div
                      key={`${problem.file}-${problem.line}`}
                      className="flex items-start gap-2 px-3 py-1.5 rounded hover:bg-[var(--hover-item)] cursor-pointer"
                    >
                      {problem.type === "error" ? (
                        <AlertCircle
                          size={13}
                          className="text-[var(--error)] flex-shrink-0 mt-0.5"
                        />
                      ) : problem.type === "warning" ? (
                        <AlertTriangle
                          size={13}
                          className="text-[var(--warning)] flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <CheckCircle
                          size={13}
                          className="text-[var(--info)] flex-shrink-0 mt-0.5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-[var(--text-primary)] block">
                          {problem.message}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {problem.file}:{problem.line}:{problem.col}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "output" && (
                <div
                  className="p-3 h-full overflow-y-auto font-mono"
                  style={{
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {OUTPUT_LINES.map((line) => (
                    <div
                      key={line}
                      className="py-0.5 text-[var(--text-secondary)]"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "terminal" && <InteractiveTerminal />}

              {activeTab === "debug" && (
                <div className="p-8 text-center">
                  <p className="text-xs text-[var(--text-muted)]">
                    No debug session active
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Start a debug session to see output here
                  </p>
                </div>
              )}

              {activeTab === "todo" && <TodoPanel />}

              {activeTab === "performance" && (
                <div className="p-4 h-full overflow-y-auto">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Runtime Metrics
                  </p>
                  <div className="space-y-4">
                    {PERF_METRICS.map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Activity
                              size={11}
                              style={{ color: metric.color }}
                            />
                            <span
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {metric.label}
                            </span>
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: metric.color,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {metric.value}
                          </span>
                        </div>
                        <div
                          className="w-full rounded-full overflow-hidden"
                          style={{ height: 4, background: "var(--bg-input)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${metric.percent}%`,
                              background: metric.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "diff" && <DiffTab />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

BottomPanel.displayName = "BottomPanel";
