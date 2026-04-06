import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileClock, RotateCcw } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useEditorStore } from "../stores/editorStore";

const STORAGE_KEY = "codeveda_local_history";

export interface HistoryEntry {
  id: string;
  filename: string;
  fileId: string;
  content: string;
  timestamp: number;
}

export function saveToLocalHistory(
  fileId: string,
  filename: string,
  content: string,
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    const entry: HistoryEntry = {
      id: `${fileId}_${Date.now()}`,
      filename,
      fileId,
      content,
      timestamp: Date.now(),
    };
    const updated = [entry, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // Seed with mock data
  const mock: HistoryEntry[] = [
    {
      id: "mock_1",
      filename: "App.tsx",
      fileId: "mock",
      content:
        "import React from 'react';\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;",
      timestamp: Date.now() - 3600000,
    },
    {
      id: "mock_2",
      filename: "index.css",
      fileId: "mock_css",
      content: ":root {\n  --bg: #1e1e1e;\n  --fg: #d4d4d4;\n}",
      timestamp: Date.now() - 7200000,
    },
    {
      id: "mock_3",
      filename: "App.tsx",
      fileId: "mock",
      content:
        "import React from 'react';\n\nfunction App() {\n  return <div>Initial version</div>;\n}",
      timestamp: Date.now() - 86400000,
    },
  ];
  return mock;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function computeSimpleDiff(
  a: string,
  b: string,
): { type: "same" | "added" | "removed"; text: string }[] {
  const la = a.split("\n");
  const lb = b.split("\n");
  const result: { type: "same" | "added" | "removed"; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < la.length || j < lb.length) {
    if (i >= la.length) {
      result.push({ type: "added", text: lb[j] });
      j++;
    } else if (j >= lb.length) {
      result.push({ type: "removed", text: la[i] });
      i++;
    } else if (la[i] === lb[j]) {
      result.push({ type: "same", text: la[i] });
      i++;
      j++;
    } else {
      result.push({ type: "removed", text: la[i] });
      result.push({ type: "added", text: lb[j] });
      i++;
      j++;
    }
  }
  return result;
}

export const LocalHistoryPanel: React.FC = () => {
  const { openFiles, activeFileId, updateFileContent } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const [diffEntry, setDiffEntry] = useState<HistoryEntry | null>(null);

  const history = useMemo(() => loadHistory(), []);

  const relevantHistory = useMemo(() => {
    if (!activeFile) return history;
    return history.filter(
      (h) => h.filename === activeFile.name || h.fileId === activeFile.id,
    );
  }, [history, activeFile]);

  const handleRestore = (entry: HistoryEntry) => {
    if (!activeFile) return;
    updateFileContent(activeFile.id, entry.content);
  };

  const diffLines = useMemo(() => {
    if (!diffEntry || !activeFile) return [];
    return computeSimpleDiff(activeFile.content, diffEntry.content);
  }, [diffEntry, activeFile]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-panel)" }}
      >
        <FileClock size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Local History
        </span>
        {activeFile && (
          <span
            className="ml-auto text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            {relevantHistory.length} snapshots
          </span>
        )}
      </div>

      <ScrollArea className="flex-1">
        {relevantHistory.length === 0 ? (
          <div className="p-6 text-center" data-ocid="localhistory.empty_state">
            <Clock
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No history yet. History is saved automatically when you edit
              files.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {relevantHistory.map((entry, i) => (
              <div
                key={entry.id}
                className="rounded-md p-2 transition-colors"
                style={{ background: "var(--bg-input)" }}
                data-ocid={`localhistory.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {entry.filename}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={9} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>
                    <p
                      className="text-[10px] mt-1 font-mono line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {entry.content.slice(0, 100)}
                      {entry.content.length > 100 && "..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] gap-1 px-2"
                    style={{ color: "var(--accent)" }}
                    onClick={() => setDiffEntry(entry)}
                    data-ocid="localhistory.secondary_button"
                  >
                    View Diff
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
                    style={{ background: "var(--accent)", color: "#fff" }}
                    onClick={() => handleRestore(entry)}
                    disabled={!activeFile}
                    data-ocid="localhistory.primary_button"
                  >
                    <RotateCcw size={9} /> Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={!!diffEntry} onOpenChange={(o) => !o && setDiffEntry(null)}>
        <DialogContent
          className="max-w-2xl"
          style={{
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border)",
            maxHeight: "80vh",
          }}
          data-ocid="localhistory.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--text-primary)" }}>
              Diff: {diffEntry?.filename} —{" "}
              {diffEntry ? timeAgo(diffEntry.timestamp) : ""}
            </DialogTitle>
          </DialogHeader>
          <div
            className="overflow-auto rounded font-mono text-[11px] max-h-[50vh]"
            style={{ background: "#1e1e1e" }}
          >
            {diffLines.map((line, i) => (
              <div
                key={`dl-${i}-${line.type}`}
                className="px-3 py-0"
                style={{
                  background:
                    line.type === "added"
                      ? "rgba(34,197,94,0.1)"
                      : line.type === "removed"
                        ? "rgba(239,68,68,0.1)"
                        : "transparent",
                  borderLeft:
                    line.type === "added"
                      ? "2px solid #22c55e"
                      : line.type === "removed"
                        ? "2px solid #ef4444"
                        : "2px solid transparent",
                  color:
                    line.type === "added"
                      ? "#98c379"
                      : line.type === "removed"
                        ? "#e06c75"
                        : "#d4d4d4",
                  lineHeight: "1.6",
                }}
              >
                <span className="mr-2 select-none" style={{ color: "#555" }}>
                  {line.type === "added"
                    ? "+"
                    : line.type === "removed"
                      ? "-"
                      : " "}
                </span>
                {line.text || "\u00A0"}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              style={{ background: "var(--accent)", color: "#fff" }}
              onClick={() => {
                if (diffEntry) handleRestore(diffEntry);
                setDiffEntry(null);
              }}
              disabled={!activeFile}
              data-ocid="localhistory.confirm_button"
            >
              Restore This Version
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDiffEntry(null)}
              data-ocid="localhistory.cancel_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
