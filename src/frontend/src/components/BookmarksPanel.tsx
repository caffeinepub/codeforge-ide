import { Bookmark, Cloud, FileCode, Loader2, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  addBookmark,
  deleteBookmark,
  fetchAllBookmarks,
} from "../services/backendService";
import { useAuthStore } from "../stores/authStore";
import { useEditorStore } from "../stores/editorStore";

interface FrontendBookmark {
  filePath: string;
  lineNumber: number;
  annotation: string;
  timestamp: bigint;
}

function toFrontend(b: {
  filePath: string;
  lineNumber: bigint;
  annotation: string;
  timestamp: bigint;
}): FrontendBookmark {
  return {
    filePath: b.filePath,
    lineNumber: Number(b.lineNumber),
    annotation: b.annotation,
    timestamp: b.timestamp,
  };
}

export const BookmarksPanel: React.FC = () => {
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const { openFile, activeFileId, openFiles } = useEditorStore();
  const [bookmarks, setBookmarks] = useState<FrontendBookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newAnnotation, setNewAnnotation] = useState("");
  const [deletingTs, setDeletingTs] = useState<bigint | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!actor || !isLoggedIn || isLoadedRef.current) return;
    isLoadedRef.current = true;
    setLoading(true);
    fetchAllBookmarks(actor).then((bms) => {
      setBookmarks(bms.map(toFrontend));
      setLoading(false);
    });
  }, [actor, isLoggedIn]);

  // Pre-fill path from active file
  useEffect(() => {
    if (showAdd) {
      const activeFile = openFiles.find((f) => f.id === activeFileId);
      if (activeFile) setNewPath(activeFile.path);
    }
  }, [showAdd, activeFileId, openFiles]);

  const handleAdd = async () => {
    if (!actor || !isLoggedIn) return;
    if (!newPath.trim() || !newLine.trim()) {
      toast.error("File path and line number are required");
      return;
    }
    const lineNum = Number.parseInt(newLine, 10);
    if (Number.isNaN(lineNum) || lineNum < 1) {
      toast.error("Invalid line number");
      return;
    }
    const ts = BigInt(Date.now());
    const bookmark = {
      filePath: newPath.trim(),
      lineNumber: BigInt(lineNum),
      annotation: newAnnotation.trim(),
      timestamp: ts,
    };
    const ok = await addBookmark(actor, bookmark);
    if (ok) {
      setBookmarks((prev) => [...prev, toFrontend(bookmark)]);
      setShowAdd(false);
      setNewPath("");
      setNewLine("");
      setNewAnnotation("");
      toast.success("Bookmark saved to cloud");
    } else {
      toast.error("Failed to save bookmark");
    }
  };

  const handleDelete = async (ts: bigint) => {
    if (!actor || !isLoggedIn) return;
    setDeletingTs(ts);
    const ok = await deleteBookmark(actor, ts);
    setDeletingTs(null);
    if (ok) {
      setBookmarks((prev) => prev.filter((b) => b.timestamp !== ts));
      toast.success("Bookmark deleted");
    } else {
      toast.error("Failed to delete bookmark");
    }
  };

  const handleOpen = (bm: FrontendBookmark) => {
    const existing = openFiles.find(
      (f) => f.path === bm.filePath || f.name === bm.filePath.split("/").pop(),
    );
    if (existing) {
      openFile(existing);
    } else {
      openFile({
        id: `bookmark-${bm.timestamp}`,
        name: bm.filePath.split("/").pop() ?? bm.filePath,
        path: bm.filePath,
        content: `// Bookmarked: line ${bm.lineNumber}\n// ${bm.annotation}`,
        language: "typescript",
        isDirty: false,
      });
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
          <Bookmark size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
          >
            Bookmarks
          </span>
        </div>
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
            title="Add Bookmark"
            data-ocid="bookmarks.open_modal_button"
          >
            <Plus size={13} />
          </button>
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
          Login to manage bookmarks
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div
          className="px-3 py-3 border-b border-[var(--border)] space-y-2"
          style={{ background: "var(--bg-editor)" }}
          data-ocid="bookmarks.panel"
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Add Bookmark
          </p>
          <input
            type="text"
            placeholder="File path (e.g. src/App.tsx)"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[11px] text-[var(--text-primary)] rounded px-2 py-1 outline-none focus:border-[var(--accent)]"
            data-ocid="bookmarks.input"
          />
          <input
            type="number"
            placeholder="Line number"
            value={newLine}
            onChange={(e) => setNewLine(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[11px] text-[var(--text-primary)] rounded px-2 py-1 outline-none focus:border-[var(--accent)]"
            min={1}
          />
          <input
            type="text"
            placeholder="Annotation (optional)"
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[11px] text-[var(--text-primary)] rounded px-2 py-1 outline-none focus:border-[var(--accent)]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-1 rounded text-[10px] font-medium"
              style={{ background: "var(--accent)", color: "white" }}
              data-ocid="bookmarks.submit_button"
            >
              Add Bookmark
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 rounded text-[10px]"
              style={{
                background: "var(--hover-item)",
                color: "var(--text-muted)",
              }}
              data-ocid="bookmarks.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="bookmarks.loading_state"
          >
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        {!loading && bookmarks.length === 0 && (
          <div
            className="py-12 text-center px-4"
            data-ocid="bookmarks.empty_state"
          >
            <Bookmark
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No bookmarks yet
            </p>
            <p
              className="text-[10px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Add one while editing a file
            </p>
          </div>
        )}
        {!loading &&
          bookmarks.map((bm, i) => (
            <div
              key={`${bm.timestamp}`}
              className="flex items-start gap-2 px-3 py-2 border-b border-[var(--border)] hover:bg-[var(--hover-item)] group transition-colors"
              data-ocid={`bookmarks.item.${i + 1}`}
            >
              <FileCode
                size={13}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "var(--accent)" }}
              />
              <button
                type="button"
                className="flex-1 min-w-0 text-left"
                onClick={() => handleOpen(bm)}
                title={`Open ${bm.filePath}:${bm.lineNumber}`}
              >
                <p
                  className="text-[11px] font-mono truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {bm.filePath.split("/").pop()}
                  <span
                    className="ml-1 text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    :{bm.lineNumber}
                  </span>
                </p>
                {bm.annotation && (
                  <p
                    className="text-[9px] truncate mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {bm.annotation}
                  </p>
                )}
                <p
                  className="text-[9px] truncate mt-0.5"
                  style={{ color: "var(--text-muted)", opacity: 0.6 }}
                >
                  {bm.filePath}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(bm.timestamp)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all flex-shrink-0"
                title="Delete bookmark"
                disabled={deletingTs === bm.timestamp}
                data-ocid={`bookmarks.delete_button.${i + 1}`}
              >
                {deletingTs === bm.timestamp ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Trash2 size={11} />
                )}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
