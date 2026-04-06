import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ListTodo,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useRef, useState } from "react";
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
    message:
      "'React' is defined but never used (can be removed with React 17+ JSX transform)",
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
  "[12:03:24] ICP canister: Connecting to local replica...",
  "[12:03:25] \u2713 Replica connected at http://localhost:4943",
  "[12:03:25] Deploying canisters: main, assets",
  "[12:03:27] \u2713 Canister 'main' deployed: rrkah-fqaaa-aaaaa-aaaaq-cai",
  "[12:03:28] \u2713 All canisters deployed successfully",
  "[12:03:28] \u2713 Phase 4 Performance & Intelligence: active",
  "[12:03:28] Ready. Watching for changes...",
];

const PERF_METRICS = [
  {
    label: "Memory Usage",
    value: "42.3 MB",
    percent: 35,
    color: "#61afef",
  },
  {
    label: "Build Time",
    value: "1.2s",
    percent: 60,
    color: "#f7c948",
  },
  {
    label: "Bundle Size",
    value: "892 KB",
    percent: 45,
    color: "#c678dd",
  },
];

export type PanelTab =
  | "problems"
  | "output"
  | "terminal"
  | "debug"
  | "todo"
  | "performance";

interface BottomPanelHandle {
  setTab: (tab: PanelTab) => void;
}

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
      if (!("touches" in e)) {
        (e as React.MouseEvent).preventDefault();
      }

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!isResizing.current) return;
        const y = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
        const delta = startY.current - y;
        const maxH = isMobile
          ? window.innerHeight * 0.5
          : window.innerHeight * 0.6;
        const minH = isMobile ? 160 : 80;
        const newH = Math.max(minH, Math.min(startH.current + delta, maxH));
        onHeightChange(newH);
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
            {/* Resize handle */}
            <div
              className={`flex-shrink-0 cursor-ns-resize hover:bg-[var(--accent)] transition-colors ${isMobile ? "h-3" : "h-1"}`}
              style={{ background: "transparent" }}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
            />

            {/* Tabs */}
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

            {/* Content */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

BottomPanel.displayName = "BottomPanel";
