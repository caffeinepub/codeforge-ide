import { Clock, Cloud, FileCode, Loader2, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  clearSessionHistory,
  fetchSessionHistory,
} from "../services/backendService";
import { useAuthStore } from "../stores/authStore";
import { useEditorStore } from "../stores/editorStore";

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "React TSX",
    js: "JavaScript",
    jsx: "React JSX",
    py: "Python",
    rs: "Rust",
    go: "Go",
    mo: "Motoko",
    css: "CSS",
    html: "HTML",
    json: "JSON",
    md: "Markdown",
  };
  return map[ext ?? ""] ?? "File";
}

export const RecentFilesPanel: React.FC = () => {
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const { openFile, openFiles } = useEditorStore();
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!actor || !isLoggedIn || isLoadedRef.current) return;
    isLoadedRef.current = true;
    setLoading(true);
    fetchSessionHistory(actor).then((hist) => {
      setHistory(hist);
      setLoading(false);
    });
  }, [actor, isLoggedIn]);

  const handleOpen = (path: string) => {
    const existing = openFiles.find(
      (f) => f.path === path || f.name === path.split("/").pop(),
    );
    if (existing) {
      openFile(existing);
    } else {
      const name = path.split("/").pop() ?? path;
      const ext = name.split(".").pop() ?? "";
      const langMap: Record<string, string> = {
        ts: "typescript",
        tsx: "typescript",
        js: "javascript",
        jsx: "javascript",
        py: "python",
        rs: "rust",
        go: "go",
        css: "css",
        html: "html",
        json: "json",
        md: "markdown",
        mo: "motoko",
      };
      openFile({
        id: `recent-${path}`,
        name,
        path,
        content: `// Opened from recent files\n// Path: ${path}`,
        language: langMap[ext] ?? "plaintext",
        isDirty: false,
      });
    }
  };

  const handleClear = async () => {
    if (!actor || !isLoggedIn) return;
    setClearing(true);
    const ok = await clearSessionHistory(actor);
    setClearing(false);
    setShowClearConfirm(false);
    if (ok) {
      setHistory([]);
      toast.success("Session history cleared");
    } else {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
          >
            Recent Files
          </span>
        </div>
        {isLoggedIn && history.length > 0 && (
          <div className="flex items-center gap-1">
            {showClearConfirm ? (
              <>
                <button
                  type="button"
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--error)", color: "white" }}
                  onClick={handleClear}
                  disabled={clearing}
                  data-ocid="recent.confirm_button"
                >
                  {clearing ? "..." : "Clear"}
                </button>
                <button
                  type="button"
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--hover-item)",
                    color: "var(--text-muted)",
                  }}
                  onClick={() => setShowClearConfirm(false)}
                  data-ocid="recent.cancel_button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-red-400 transition-colors"
                title="Clear history"
                data-ocid="recent.delete_button"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      {!isLoggedIn && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded text-[10px] flex items-center gap-2"
          style={{
            background: "rgba(255,193,7,0.08)",
            border: "1px solid rgba(255,193,7,0.2)",
            color: "var(--warning)",
          }}
        >
          <Cloud size={11} />
          Login to see session history
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="recent.loading_state"
          >
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        {!loading && history.length === 0 && (
          <div
            className="py-12 text-center px-4"
            data-ocid="recent.empty_state"
          >
            <Clock
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No recent files
            </p>
            <p
              className="text-[10px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {isLoggedIn
                ? "Open files to track them here"
                : "Sign in to see session history"}
            </p>
          </div>
        )}
        {!loading &&
          history.map((path, i) => (
            <button
              key={path || String(i)}
              type="button"
              onClick={() => handleOpen(path)}
              className="w-full flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors text-left"
              data-ocid={`recent.item.${i + 1}`}
            >
              <FileCode
                size={13}
                style={{ color: "var(--accent)", flexShrink: 0 }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-mono truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {path.split("/").pop() ?? path}
                </p>
                <p
                  className="text-[9px] truncate mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {path}
                </p>
              </div>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  background: "var(--bg-activity)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {getLanguageFromPath(path)}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};
