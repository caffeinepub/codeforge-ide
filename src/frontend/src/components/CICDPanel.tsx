import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Package,
  Play,
  RefreshCw,
  Shield,
  Terminal,
  TestTube,
  Workflow,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";

type StageStatus = "idle" | "running" | "success" | "failed";
type Env = "development" | "staging" | "production";

interface Stage {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: StageStatus;
  duration: number | null;
  log: string[];
}

interface HistoryRun {
  id: string;
  branch: string;
  status: "success" | "failed";
  env: Env;
  duration: string;
  time: string;
}

const INITIAL_STAGES: Stage[] = [
  {
    id: "lint",
    name: "Lint",
    icon: <Shield size={13} />,
    status: "idle",
    duration: null,
    log: [
      "✔ ESLint: 0 errors, 2 warnings",
      "✔ Prettier: all files formatted",
      "✔ Biome: clean",
    ],
  },
  {
    id: "test",
    name: "Test",
    icon: <TestTube size={13} />,
    status: "idle",
    duration: null,
    log: [
      "✔ 124 tests passed",
      "✔ 0 failed",
      "✔ Coverage: 87.3%",
      "⚠ 3 tests skipped",
    ],
  },
  {
    id: "build",
    name: "Build",
    icon: <Package size={13} />,
    status: "idle",
    duration: null,
    log: [
      "✔ Compiled TypeScript",
      "✔ Bundled with Vite",
      "✔ Output: dist/ (2.4 MB)",
      "✔ Motoko canister compiled",
    ],
  },
  {
    id: "deploy",
    name: "Deploy",
    icon: <Zap size={13} />,
    status: "idle",
    duration: null,
    log: [
      "✔ Canister deployed to ICP",
      "✔ Frontend uploaded to IC storage",
      "✔ DNS propagated",
      "🚀 Live at codeveda.app",
    ],
  },
];

const HISTORY: HistoryRun[] = [
  {
    id: "1",
    branch: "main",
    status: "success",
    env: "production",
    duration: "4m 12s",
    time: "10m ago",
  },
  {
    id: "2",
    branch: "feature/ai-panel",
    status: "success",
    env: "staging",
    duration: "3m 47s",
    time: "1h ago",
  },
  {
    id: "3",
    branch: "fix/mobile-layout",
    status: "failed",
    env: "development",
    duration: "1m 8s",
    time: "3h ago",
  },
  {
    id: "4",
    branch: "main",
    status: "success",
    env: "production",
    duration: "4m 5s",
    time: "1d ago",
  },
  {
    id: "5",
    branch: "feature/vcs-panel",
    status: "failed",
    env: "staging",
    duration: "2m 31s",
    time: "2d ago",
  },
];

const CI_YAML = `name: CodeVeda CI/CD
on:
  push:
    branches: [main, feature/*]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: dfx deploy --network ic`;

export const CICDPanel: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [env, setEnv] = useState<Env>("production");
  const [autoOnPush, setAutoOnPush] = useState(true);
  const [running, setRunning] = useState(false);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [configExpanded, setConfigExpanded] = useState(false);

  const runPipeline = () => {
    if (running) return;
    setRunning(true);
    setStages(
      INITIAL_STAGES.map((s) => ({ ...s, status: "idle", duration: null })),
    );

    INITIAL_STAGES.forEach((stage, i) => {
      // Mark running
      setTimeout(() => {
        setStages((prev) =>
          prev.map((s) =>
            s.id === stage.id ? { ...s, status: "running" } : s,
          ),
        );
      }, i * 1200);

      // Mark success (randomize last to sometimes fail for realism)
      setTimeout(
        () => {
          const failLast = i === 3 && Math.random() < 0.15;
          const dur = 800 + Math.floor(Math.random() * 500);
          setStages((prev) =>
            prev.map((s) =>
              s.id === stage.id
                ? {
                    ...s,
                    status: failLast ? "failed" : "success",
                    duration: dur,
                  }
                : s,
            ),
          );
          if (i === INITIAL_STAGES.length - 1) setRunning(false);
        },
        i * 1200 + 1100,
      );
    });
  };

  const resetPipeline = () => {
    setStages(
      INITIAL_STAGES.map((s) => ({ ...s, status: "idle", duration: null })),
    );
    setRunning(false);
  };

  const getStatusColor = (status: StageStatus) => {
    switch (status) {
      case "running":
        return "var(--info)";
      case "success":
        return "#22c55e";
      case "failed":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  };

  const getStatusIcon = (status: StageStatus, size = 13) => {
    switch (status) {
      case "running":
        return (
          <Loader2
            size={size}
            className="animate-spin"
            style={{ color: "var(--info)" }}
          />
        );
      case "success":
        return <CheckCircle2 size={size} style={{ color: "#22c55e" }} />;
      case "failed":
        return <AlertCircle size={size} style={{ color: "var(--error)" }} />;
      default:
        return <Clock size={size} style={{ color: "var(--text-muted)" }} />;
    }
  };

  const statusBadge = (status: "success" | "failed") => (
    <Badge
      className="text-[9px] h-4 px-1.5"
      style={{
        background:
          status === "success"
            ? "rgba(34,197,94,0.15)"
            : "rgba(244,71,71,0.15)",
        color: status === "success" ? "#22c55e" : "var(--error)",
        border: `1px solid ${status === "success" ? "rgba(34,197,94,0.35)" : "rgba(244,71,71,0.35)"}`,
      }}
    >
      {status === "success" ? "✔ Pass" : "✘ Fail"}
    </Badge>
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-activity)" }}
      >
        <div className="flex items-center gap-2">
          <Workflow size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            CI/CD Pipeline
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={resetPipeline}
            className="p-1 rounded hover:bg-[var(--hover-item)] transition-colors"
            title="Reset"
            data-ocid="cicd.secondary_button"
          >
            <RefreshCw size={11} style={{ color: "var(--icon-inactive)" }} />
          </button>
          <Button
            size="sm"
            onClick={runPipeline}
            disabled={running}
            className="h-6 text-[10px] px-2 gap-1"
            style={{
              background: running ? "rgba(0,122,204,0.4)" : "var(--accent)",
              color: "#fff",
            }}
            data-ocid="cicd.primary_button"
          >
            {running ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Play size={10} />
            )}
            {running ? "Running..." : "Run Pipeline"}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Auto on Push + Env */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Auto on Push
              </span>
              <Switch
                checked={autoOnPush}
                onCheckedChange={setAutoOnPush}
                data-ocid="cicd.switch"
              />
            </div>
            <div className="flex gap-1">
              {(["development", "staging", "production"] as Env[]).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEnv(e)}
                  className="px-1.5 py-0.5 rounded text-[9px] capitalize transition-colors"
                  style={{
                    background:
                      env === e ? "rgba(0,122,204,0.2)" : "var(--bg-input)",
                    border:
                      env === e
                        ? "1px solid rgba(0,122,204,0.4)"
                        : "1px solid var(--border)",
                    color: env === e ? "var(--accent)" : "var(--text-muted)",
                  }}
                  data-ocid="cicd.tab"
                >
                  {e.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Stages */}
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Pipeline
            </p>
            <div className="flex items-center gap-0">
              {stages.map((stage, i) => (
                <div
                  key={stage.id}
                  className="flex items-center flex-1 min-w-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStage(
                        expandedStage === stage.id ? null : stage.id,
                      )
                    }
                    className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all min-w-0"
                    style={{
                      background:
                        expandedStage === stage.id
                          ? "rgba(0,122,204,0.1)"
                          : "transparent",
                      border:
                        expandedStage === stage.id
                          ? "1px solid rgba(0,122,204,0.25)"
                          : "1px solid transparent",
                    }}
                    data-ocid={`cicd.item.${i + 1}`}
                  >
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: `${getStatusColor(stage.status)}22`,
                        border: `1.5px solid ${getStatusColor(stage.status)}`,
                        boxShadow:
                          stage.status === "running"
                            ? `0 0 8px ${getStatusColor(stage.status)}66`
                            : stage.status === "success"
                              ? `0 0 6px ${getStatusColor(stage.status)}44`
                              : undefined,
                      }}
                    >
                      {stage.status === "running" ? (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{ scale: [1, 1.35, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.2,
                          }}
                          style={{
                            border: "1.5px solid var(--info)",
                            opacity: 0.5,
                          }}
                        />
                      ) : null}
                      <span style={{ color: getStatusColor(stage.status) }}>
                        {stage.icon}
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-medium truncate"
                      style={{ color: getStatusColor(stage.status) }}
                    >
                      {stage.name}
                    </span>
                    <div>{getStatusIcon(stage.status, 10)}</div>
                    {stage.duration && (
                      <span
                        className="text-[8px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {stage.duration}ms
                      </span>
                    )}
                  </button>
                  {i < stages.length - 1 && (
                    <ChevronRight
                      size={12}
                      style={{ color: "var(--text-muted)", flexShrink: 0 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Stage log drawer */}
            <AnimatePresence>
              {expandedStage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <div
                    className="rounded p-2"
                    style={{
                      background: "var(--bg-editor)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <Terminal
                        size={9}
                        style={{ color: "var(--text-muted)" }}
                      />
                      <span
                        className="text-[9px] font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {stages.find((s) => s.id === expandedStage)?.name} log
                      </span>
                    </div>
                    {stages
                      .find((s) => s.id === expandedStage)
                      ?.log.map((line, i) => (
                        <p
                          // biome-ignore lint/suspicious/noArrayIndexKey: static list
                          key={i}
                          className="text-[10px] font-mono"
                          style={{
                            color: line.startsWith("✔")
                              ? "#22c55e"
                              : line.startsWith("⚠")
                                ? "var(--warning)"
                                : line.startsWith("✘")
                                  ? "var(--error)"
                                  : "var(--text-secondary)",
                          }}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Deployment History */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Deployment History
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="grid text-[9px] font-semibold uppercase tracking-wider px-2 py-1.5"
                style={{
                  gridTemplateColumns: "1fr 60px 55px 50px 50px",
                  background: "var(--bg-activity)",
                  color: "var(--text-muted)",
                }}
              >
                <span>Branch</span>
                <span>Status</span>
                <span>Env</span>
                <span>Time</span>
                <span>When</span>
              </div>
              {HISTORY.map((run, i) => (
                <div
                  key={run.id}
                  className="grid items-center px-2 py-1.5 border-t border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors"
                  style={{ gridTemplateColumns: "1fr 60px 55px 50px 50px" }}
                  data-ocid={`cicd.item.${i + 1}`}
                >
                  <span
                    className="text-[10px] font-mono truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {run.branch}
                  </span>
                  {statusBadge(run.status)}
                  <span
                    className="text-[9px] capitalize"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {run.env.slice(0, 4)}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {run.duration}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {run.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Config */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setConfigExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 transition-colors hover:bg-[var(--hover-item)]"
              style={{
                background: "var(--bg-activity)",
                color: "var(--text-secondary)",
              }}
              data-ocid="cicd.toggle"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                .codeveda-ci.yml
              </span>
              {configExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
            <AnimatePresence>
              {configExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    readOnly
                    value={CI_YAML}
                    className="w-full text-[10px] font-mono p-3 outline-none resize-none"
                    style={{
                      background: "var(--bg-editor)",
                      color: "var(--text-secondary)",
                      height: 240,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    data-ocid="cicd.editor"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
