import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Play, Plus, Star, Terminal, Trash2, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface RunConfig {
  id: string;
  name: string;
  command: string;
  isDefault: boolean;
}

const DEFAULT_CONFIGS: RunConfig[] = [
  { id: "rc1", name: "Dev Server", command: "npm run dev", isDefault: true },
  { id: "rc2", name: "Build", command: "npm run build", isDefault: false },
  { id: "rc3", name: "Tests", command: "npm test", isDefault: false },
  {
    id: "rc4",
    name: "Typecheck",
    command: "npm run typecheck",
    isDefault: false,
  },
  { id: "rc5", name: "Lint", command: "npm run lint", isDefault: false },
];

const STORAGE_KEY = "codeveda_run_configs";

function loadConfigs(): RunConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_CONFIGS;
}

function saveConfigs(configs: RunConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

const MOCK_OUTPUT: Record<string, string[]> = {
  "npm run dev": [
    "  VITE v5.4.1  ready in 842 ms",
    "",
    "  ➜  Local:   http://localhost:5173/",
    "  ➜  Network: http://192.168.1.100:5173/",
    "  ➜  press h + enter to show help",
  ],
  "npm run build": [
    "vite v5.4.1 building for production...",
    "✓ 1847 modules transformed.",
    "dist/index.html          2.31 kB│gzip: 0.90 kB",
    "dist/assets/index.css   89.42 kB│gzip: 14.2 kB",
    "dist/assets/index.js  2847.18 kB│gzip: 748.3 kB",
    "",
    "✓ built in 4.28s",
  ],
  "npm test": [
    "PASS src/__tests__/utils.test.ts",
    "PASS src/__tests__/store.test.ts",
    "PASS src/__tests__/components.test.ts",
    "",
    "Test Suites: 3 passed, 3 total",
    "Tests:       47 passed, 47 total",
    "Snapshots:   0 total",
    "Time:        2.841s",
  ],
  "npm run typecheck": [
    "Running TypeScript compiler...",
    "✓ No TypeScript errors found.",
  ],
  "npm run lint": ["✓ 0 lint errors found."],
};

export const RunConfigurationsPanel: React.FC = () => {
  const [configs, setConfigs] = useState<RunConfig[]>(loadConfigs);
  const [editingConfig, setEditingConfig] = useState<RunConfig | null>(null);
  const [isNewConfig, setIsNewConfig] = useState(false);
  const [runningConfig, setRunningConfig] = useState<RunConfig | null>(null);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveConfigs(configs);
  }, [configs]);

  const handleSave = (cfg: RunConfig) => {
    if (isNewConfig) {
      setConfigs((prev) => [...prev, cfg]);
    } else {
      setConfigs((prev) => prev.map((c) => (c.id === cfg.id ? cfg : c)));
    }
    setEditingConfig(null);
    setIsNewConfig(false);
  };

  const handleDelete = (id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setConfigs((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleRun = (cfg: RunConfig) => {
    setRunningConfig(cfg);
    setIsRunning(true);
    setOutputLines([`$ ${cfg.command}`, ""]);
    const lines = MOCK_OUTPUT[cfg.command] ?? [
      `Running: ${cfg.command}`,
      "...",
      "Done.",
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i >= lines.length) {
        clearInterval(iv);
        setIsRunning(false);
        return;
      }
      setOutputLines((prev) => [...prev, lines[i]]);
      i++;
    }, 120);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on output update
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputLines]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-panel)" }}
      >
        <div className="flex items-center gap-2">
          <Play size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Run Configurations
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setEditingConfig({
              id: `rc_${Date.now()}`,
              name: "",
              command: "",
              isDefault: false,
            });
            setIsNewConfig(true);
          }}
          data-ocid="runconfig.primary_button"
        >
          <Plus size={13} />
        </Button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {configs.map((cfg) => (
              <div
                key={cfg.id}
                className="rounded-md p-2 transition-colors"
                style={{ background: "var(--bg-input)" }}
                data-ocid={`runconfig.item.${configs.indexOf(cfg) + 1}`}
              >
                <div className="flex items-center gap-2">
                  <Terminal
                    size={13}
                    style={{
                      color: cfg.isDefault
                        ? "var(--accent)"
                        : "var(--text-muted)",
                    }}
                  />
                  <span
                    className="text-xs font-medium flex-1 truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cfg.name}
                  </span>
                  {cfg.isDefault && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0"
                      style={{
                        color: "var(--accent)",
                        borderColor: "var(--accent)44",
                      }}
                    >
                      DEFAULT
                    </Badge>
                  )}
                </div>
                <p
                  className="text-[11px] mt-0.5 pl-5 font-mono truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cfg.command}
                </p>
                <div className="flex items-center gap-1 mt-1.5 pl-5">
                  <Button
                    size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
                    style={{ background: "var(--accent)", color: "#fff" }}
                    onClick={() => handleRun(cfg)}
                    data-ocid="runconfig.primary_button"
                  >
                    <Play size={9} /> Run
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-1.5"
                    onClick={() => {
                      setEditingConfig({ ...cfg });
                      setIsNewConfig(false);
                    }}
                    data-ocid="runconfig.edit_button"
                  >
                    <Edit2 size={10} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-1.5"
                    onClick={() => handleSetDefault(cfg.id)}
                    title="Set as default"
                    data-ocid="runconfig.toggle"
                  >
                    <Star
                      size={10}
                      style={{
                        color: cfg.isDefault ? "#f7c948" : undefined,
                        fill: cfg.isDefault ? "#f7c948" : "none",
                      }}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-1.5"
                    onClick={() => handleDelete(cfg.id)}
                    data-ocid="runconfig.delete_button"
                  >
                    <Trash2 size={10} style={{ color: "var(--error)" }} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Output area */}
        {runningConfig && (
          <div
            className="flex flex-col flex-shrink-0 border-t border-[var(--border)]"
            style={{ height: 160, background: "#1e1e1e" }}
          >
            <div
              className="flex items-center justify-between px-3 py-1 flex-shrink-0 border-b border-[#333]"
              style={{ background: "#252526" }}
            >
              <span className="text-[11px] font-semibold text-[#ccc]">
                {runningConfig.name}{" "}
                {isRunning && (
                  <span className="text-[#e5e510] animate-pulse">
                    ● running
                  </span>
                )}
                {!isRunning && <span className="text-[#0dbc79]">● done</span>}
              </span>
              <button
                type="button"
                className="text-[#858585] hover:text-white"
                onClick={() => setRunningConfig(null)}
                data-ocid="runconfig.close_button"
              >
                <X size={12} />
              </button>
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto p-2 font-mono text-[11px]"
              style={{ color: "#d4d4d4" }}
            >
              {outputLines.map((line, i) => (
                <div
                  key={`out-${i}-${line.slice(0, 10)}`}
                  style={{
                    color: line.startsWith("$")
                      ? "#61afef"
                      : line.startsWith("✓") || line.includes("passed")
                        ? "#98c379"
                        : line.startsWith("ERROR") || line.includes("error")
                          ? "#e06c75"
                          : "#d4d4d4",
                  }}
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog
        open={!!editingConfig}
        onOpenChange={(open) => {
          if (!open) {
            setEditingConfig(null);
            setIsNewConfig(false);
          }
        }}
      >
        <DialogContent
          style={{
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border)",
          }}
          data-ocid="runconfig.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--text-primary)" }}>
              {isNewConfig ? "New Run Configuration" : "Edit Configuration"}
            </DialogTitle>
          </DialogHeader>
          {editingConfig && (
            <ConfigEditForm
              config={editingConfig}
              onSave={handleSave}
              onCancel={() => {
                setEditingConfig(null);
                setIsNewConfig(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function ConfigEditForm({
  config,
  onSave,
  onCancel,
}: {
  config: RunConfig;
  onSave: (c: RunConfig) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(config.name);
  const [command, setCommand] = useState(config.command);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dev Server"
          className="mt-1 text-sm"
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          data-ocid="runconfig.input"
        />
      </div>
      <div>
        <Label className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Command
        </Label>
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="npm run dev"
          className="mt-1 text-sm font-mono"
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          data-ocid="runconfig.input"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1"
          style={{ background: "var(--accent)", color: "#fff" }}
          onClick={() => onSave({ ...config, name, command })}
          disabled={!name.trim() || !command.trim()}
          data-ocid="runconfig.save_button"
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          data-ocid="runconfig.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
