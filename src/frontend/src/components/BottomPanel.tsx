import { AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";

interface BottomPanelProps {
  visible: boolean;
  height: number;
  onHeightChange: (h: number) => void;
  onToggle: () => void;
  isMobile?: boolean;
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
  "[12:03:21] Starting CodeForge development server...",
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
  "[12:03:28] \u2713 Frontend available at http://localhost:5173",
  "[12:03:28] Ready. Watching for changes...",
];

const TERMINAL_HISTORY = [
  { type: "prompt", text: "user@CodeForge:~/project$ npm install" },
  { type: "output", text: "added 1247 packages in 23s" },
  { type: "output", text: "" },
  { type: "prompt", text: "user@CodeForge:~/project$ npm run dev" },
  { type: "output", text: "> codeforge-ide@1.0.0 dev" },
  { type: "output", text: "> vite" },
  { type: "output", text: "" },
  { type: "output", text: "  VITE v5.4.1  ready in 1204 ms" },
  { type: "output", text: "  \u279c  Local:   http://localhost:5173/" },
  { type: "output", text: "  \u279c  Network: http://192.168.1.45:5173/" },
  { type: "prompt", text: "user@CodeForge:~/project$ dfx deploy" },
  { type: "output", text: "Deploying all canisters." },
  { type: "output", text: "Creating canisters..." },
  { type: "output", text: "Installing canisters..." },
  { type: "output", text: "Deployed canisters. URLs:" },
  { type: "output", text: "  Frontend canister via browser:" },
  {
    type: "output",
    text: "    http://127.0.0.1:4943/?canisterId=rrkah-fqaaa-aaaaa-aaaaq-cai",
  },
  { type: "prompt", text: "user@CodeForge:~/project$ " },
];

type PanelTab = "problems" | "output" | "terminal" | "debug";

export const BottomPanel: React.FC<BottomPanelProps> = ({
  visible,
  height,
  onHeightChange,
  onToggle,
  isMobile = false,
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>("problems");
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const effectiveHeight = isMobile
    ? Math.min(Math.max(height, 160), window.innerHeight * 0.5)
    : height;

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    isResizing.current = true;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startH.current = height;
    if ("touches" in e) {
      // touch-based resize
    } else {
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

  const TABS: { id: PanelTab; label: string }[] = [
    { id: "problems", label: "Problems" },
    { id: "output", label: "Output" },
    { id: "terminal", label: "Terminal" },
    { id: "debug", label: "Debug Console" },
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
          {/* Resize handle — taller on mobile */}
          <div
            className={`flex-shrink-0 cursor-ns-resize hover:bg-[var(--accent)] transition-colors ${isMobile ? "h-3" : "h-1"}`}
            style={{ background: "transparent" }}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          />

          {/* Tabs — scrollable on mobile */}
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
                className={`px-4 h-full text-xs transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "text-[var(--text-primary)] border-[var(--accent)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                }`}
                data-ocid={`bottom.${tab.id}.tab`}
              >
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
          <div className="flex-1 overflow-y-auto">
            {activeTab === "problems" && (
              <div className="p-2">
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
              <div className="p-3 font-mono" style={{ fontSize: 12 }}>
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

            {activeTab === "terminal" && (
              <div
                className="p-3 font-mono"
                style={{ fontSize: 12, color: "var(--text-primary)" }}
              >
                {TERMINAL_HISTORY.map((item, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static list
                    key={i}
                    className={`py-0.5 ${
                      item.type === "prompt"
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {item.text || "\u00a0"}
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span style={{ color: "var(--accent)" }}>
                    user@CodeForge:~/project$
                  </span>
                  <span
                    className="w-2 h-4 inline-block animate-pulse"
                    style={{ background: "var(--text-primary)", marginLeft: 4 }}
                  />
                </div>
              </div>
            )}

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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
