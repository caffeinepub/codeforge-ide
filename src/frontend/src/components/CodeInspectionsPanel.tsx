import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Info,
  RefreshCw,
  Wrench,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useEditorStore } from "../stores/editorStore";

type Severity = "error" | "warning" | "info";

interface Inspection {
  id: string;
  line: number;
  col: number;
  severity: Severity;
  message: string;
  code: string;
  fixable: boolean;
  fixAction?: (content: string) => string;
}

const PATTERNS: {
  regex: RegExp;
  severity: Severity;
  message: string;
  code: string;
  fixable: boolean;
  fix?: (_line: string, lineIndex: number, content: string) => string;
}[] = [
  {
    regex: /console\.log\s*\(/,
    severity: "warning",
    message:
      "Remove debug log: console.log should not remain in production code",
    code: "DEBUG001",
    fixable: true,
    fix: (_line) => {
      return "/* removed console.log */";
    },
  },
  {
    regex: /:\s*any(?=[\s,;)>]|$)/,
    severity: "info",
    message:
      "Avoid 'any' type — use a specific TypeScript type for better type safety",
    code: "TS001",
    fixable: false,
  },
  {
    regex: /\/\/\s*TODO:/i,
    severity: "info",
    message: "Unresolved TODO comment",
    code: "COMMENT001",
    fixable: false,
  },
  {
    regex: /\/\/\s*FIXME:/i,
    severity: "warning",
    message: "FIXME comment — this code needs attention",
    code: "COMMENT002",
    fixable: false,
  },
  {
    regex: /\bvar\s+\w/,
    severity: "warning",
    message:
      "Use 'let' or 'const' instead of 'var' for block-scoped declarations",
    code: "JS001",
    fixable: true,
    fix: (line) => line.replace(/\bvar\b/, "let"),
  },
  {
    regex: /\s==\s(?!=)/,
    severity: "warning",
    message: "Use strict equality '===' instead of '==' to avoid type coercion",
    code: "JS002",
    fixable: false,
  },
  {
    regex: /\s!=\s(?!=)/,
    severity: "warning",
    message:
      "Use strict inequality '!==' instead of '!=' to avoid type coercion",
    code: "JS003",
    fixable: false,
  },
  {
    regex: /eval\s*\(/,
    severity: "error",
    message: "Avoid eval() — it poses a security risk and hurts performance",
    code: "SEC001",
    fixable: false,
  },
  {
    regex: /debugger/,
    severity: "warning",
    message: "Remove debugger statement before deploying to production",
    code: "DEBUG002",
    fixable: true,
    fix: (line) => line.replace(/\bdebugger\b/, "/* debugger */"),
  },
];

function inspect(content: string): Inspection[] {
  const items: Inspection[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of PATTERNS) {
      const match = line.match(pattern.regex);
      if (match) {
        items.push({
          id: `insp_${i}_${pattern.code}`,
          line: i + 1,
          col: (match.index ?? 0) + 1,
          severity: pattern.severity,
          message: pattern.message,
          code: pattern.code,
          fixable: pattern.fixable,
          fixAction: pattern.fix
            ? (c: string) => {
                const ls = c.split("\n");
                ls[i] = pattern.fix!(ls[i], i, c);
                return ls.join("\n");
              }
            : undefined,
        });
      }
    }
  }
  return items;
}

const SeverityIcon: React.FC<{ severity: Severity; size?: number }> = ({
  severity,
  size = 12,
}) => {
  if (severity === "error")
    return <AlertCircle size={size} style={{ color: "var(--error)" }} />;
  if (severity === "warning")
    return <AlertTriangle size={size} style={{ color: "var(--warning)" }} />;
  return <Info size={size} style={{ color: "var(--info)" }} />;
};

export const CodeInspectionsPanel: React.FC = () => {
  const { openFiles, activeFileId, updateFileContent } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const inspections = useMemo(() => {
    if (!activeFile) return [];
    // refreshKey is used to manually re-trigger inspection
    return inspect(`${refreshKey}` ? activeFile.content : activeFile.content);
  }, [activeFile, refreshKey]);

  const filtered = useMemo(() => {
    if (filter === "all") return inspections;
    return inspections.filter((i) => i.severity === filter);
  }, [inspections, filter]);

  const counts = useMemo(
    () => ({
      error: inspections.filter((i) => i.severity === "error").length,
      warning: inspections.filter((i) => i.severity === "warning").length,
      info: inspections.filter((i) => i.severity === "info").length,
    }),
    [inspections],
  );

  const handleFix = (inspection: Inspection) => {
    if (!activeFile || !inspection.fixAction) return;
    const newContent = inspection.fixAction(activeFile.content);
    updateFileContent(activeFile.id, newContent);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-panel)" }}
      >
        <Bug size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Inspections
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 ml-auto"
          onClick={() => setRefreshKey((k) => k + 1)}
          title="Re-run inspections"
          data-ocid="inspections.secondary_button"
        >
          <RefreshCw size={11} />
        </Button>
      </div>

      {/* Summary badges */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--border)] flex-shrink-0 flex-wrap"
        style={{ background: "var(--bg-panel)" }}
      >
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors ${
            filter === "all"
              ? "bg-[var(--hover-item)]"
              : "hover:bg-[var(--hover-item)]"
          }`}
          style={{ color: "var(--text-secondary)" }}
          data-ocid="inspections.tab"
        >
          All ({inspections.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("error")}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors ${
            filter === "error"
              ? "bg-[rgba(220,38,38,0.15)]"
              : "hover:bg-[var(--hover-item)]"
          }`}
          style={{ color: "var(--error)" }}
          data-ocid="inspections.tab"
        >
          <AlertCircle size={10} /> {counts.error} Errors
        </button>
        <button
          type="button"
          onClick={() => setFilter("warning")}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors ${
            filter === "warning"
              ? "bg-[rgba(234,179,8,0.15)]"
              : "hover:bg-[var(--hover-item)]"
          }`}
          style={{ color: "var(--warning)" }}
          data-ocid="inspections.tab"
        >
          <AlertTriangle size={10} /> {counts.warning} Warnings
        </button>
        <button
          type="button"
          onClick={() => setFilter("info")}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors ${
            filter === "info"
              ? "bg-[rgba(59,130,246,0.15)]"
              : "hover:bg-[var(--hover-item)]"
          }`}
          style={{ color: "var(--info)" }}
          data-ocid="inspections.tab"
        >
          <Info size={10} /> {counts.info} Info
        </button>
      </div>

      <ScrollArea className="flex-1">
        {!activeFile ? (
          <div className="p-6 text-center" data-ocid="inspections.empty_state">
            <Bug
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Open a file to run code inspections
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center" data-ocid="inspections.empty_state">
            <CheckCircle2
              size={20}
              className="mx-auto mb-2"
              style={{ color: "#22c55e" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No {filter === "all" ? "" : filter} issues found in{" "}
              {activeFile.name}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-md p-2 transition-colors"
                style={{
                  background: "var(--bg-input)",
                  borderLeft: `2px solid ${
                    item.severity === "error"
                      ? "var(--error)"
                      : item.severity === "warning"
                        ? "var(--warning)"
                        : "var(--info)"
                  }`,
                }}
                data-ocid={`inspections.item.${idx + 1}`}
              >
                <div className="flex items-start gap-1.5">
                  <SeverityIcon severity={item.severity} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] leading-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Line {item.line}, Col {item.col}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0"
                        style={{
                          color: "var(--text-muted)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {item.code}
                      </Badge>
                    </div>
                  </div>
                  {item.fixable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] px-2 gap-1 flex-shrink-0"
                      style={{ color: "var(--accent)" }}
                      onClick={() => handleFix(item)}
                      title="Auto-fix this issue"
                      data-ocid="inspections.primary_button"
                    >
                      <Wrench size={9} /> Fix
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
