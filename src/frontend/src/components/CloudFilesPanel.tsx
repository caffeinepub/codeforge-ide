import {
  Cloud,
  CloudDownload,
  CloudUpload,
  FileCode,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  deleteCloudFile,
  fetchAllFiles,
  saveCloudFile,
} from "../services/backendService";
import { useAuthStore } from "../stores/authStore";
import { useEditorStore } from "../stores/editorStore";

const LANG_BADGE_COLORS: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f7df1e",
  python: "#3572A5",
  rust: "#dea584",
  go: "#00add8",
  motoko: "#7b2db0",
  css: "#264de4",
  html: "#e34c26",
  json: "#5bb974",
  markdown: "#083fa1",
};

function formatDate(ts: bigint): string {
  const ms = Number(ts);
  const d = new Date(ms < 1e13 ? ms * 1000 : ms); // handle seconds vs ms
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CloudFilesPanel: React.FC = () => {
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const { openFiles, activeFileId, openFile } = useEditorStore();
  const [files, setFiles] = useState<
    Array<{
      content: string;
      name: string;
      path: string;
      lastModified: bigint;
      language: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [savingCurrent, setSavingCurrent] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const isLoadedRef = useRef(false);

  const loadFiles = async () => {
    if (!actor || !isLoggedIn) return;
    setLoading(true);
    const fetched = await fetchAllFiles(actor);
    setFiles(fetched);
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadFiles is intentionally stable
  useEffect(() => {
    if (!actor || !isLoggedIn || isLoadedRef.current) return;
    isLoadedRef.current = true;
    loadFiles();
  }, [actor, isLoggedIn]);

  const handleSaveCurrent = async () => {
    if (!actor || !isLoggedIn) {
      toast.error("Login to save files to cloud");
      return;
    }
    const activeFile = openFiles.find((f) => f.id === activeFileId);
    if (!activeFile) {
      toast.error("No active file to save");
      return;
    }
    setSavingCurrent(true);
    const ok = await saveCloudFile(actor, {
      name: activeFile.name,
      path: activeFile.path,
      content: activeFile.content,
      language: activeFile.language,
      lastModified: BigInt(Date.now()),
    });
    setSavingCurrent(false);
    if (ok) {
      toast.success(`"${activeFile.name}" saved to cloud ☁`);
      isLoadedRef.current = false;
      loadFiles();
    } else {
      toast.error("Failed to save file to cloud");
    }
  };

  const handleLoad = (file: (typeof files)[0]) => {
    openFile({
      id: `cloud-${file.path}`,
      name: file.name,
      path: file.path,
      content: file.content,
      language: file.language,
      isDirty: false,
    });
    toast.success(`"${file.name}" loaded from cloud`);
  };

  const handleDelete = async (path: string) => {
    if (!actor || !isLoggedIn) return;
    setDeletingPath(path);
    const ok = await deleteCloudFile(actor, path);
    setDeletingPath(null);
    setConfirmDelete(null);
    if (ok) {
      setFiles((prev) => prev.filter((f) => f.path !== path));
      toast.success("File removed from cloud");
    } else {
      toast.error("Failed to delete file");
    }
  };

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Cloud size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
          >
            Cloud Files
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              isLoadedRef.current = false;
              loadFiles();
            }}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
            title="Refresh"
            data-ocid="cloud.secondary_button"
          >
            <RefreshCw size={11} />
          </button>
        </div>
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
          Login to access cloud file storage
        </div>
      )}

      {/* Save current file */}
      {isLoggedIn && (
        <div className="px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
          <button
            type="button"
            onClick={handleSaveCurrent}
            disabled={savingCurrent || !activeFile}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded text-[11px] font-medium transition-all disabled:opacity-50"
            style={{ background: "var(--accent)", color: "white" }}
            data-ocid="cloud.primary_button"
          >
            {savingCurrent ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CloudUpload size={12} />
            )}
            {savingCurrent
              ? "Saving..."
              : activeFile
                ? `Save "${activeFile.name}" to Cloud`
                : "Save Current File to Cloud"}
          </button>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="cloud.loading_state"
          >
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        {!loading && files.length === 0 && isLoggedIn && (
          <div className="py-12 text-center px-4" data-ocid="cloud.empty_state">
            <Cloud
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No cloud files yet
            </p>
            <p
              className="text-[10px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Save a file to access it from any device
            </p>
          </div>
        )}
        {!loading &&
          files.map((file, i) => (
            <div
              key={file.path}
              className="border-b border-[var(--border)] group"
              data-ocid={`cloud.item.${i + 1}`}
            >
              {confirmDelete === file.path ? (
                <div
                  className="px-3 py-2 flex items-center justify-between"
                  style={{ background: "rgba(255,77,79,0.08)" }}
                >
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Delete{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {file.name}
                    </strong>
                    ?
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(file.path)}
                      disabled={deletingPath === file.path}
                      className="text-[9px] px-2 py-0.5 rounded"
                      style={{ background: "var(--error)", color: "white" }}
                      data-ocid={`cloud.confirm_button.${i + 1}`}
                    >
                      {deletingPath === file.path ? "..." : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      className="text-[9px] px-2 py-0.5 rounded"
                      style={{
                        background: "var(--hover-item)",
                        color: "var(--text-muted)",
                      }}
                      data-ocid={`cloud.cancel_button.${i + 1}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--hover-item)] transition-colors">
                  <FileCode
                    size={13}
                    className="flex-shrink-0"
                    style={{
                      color:
                        LANG_BADGE_COLORS[file.language] ?? "var(--text-muted)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-mono truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {file.name}
                    </p>
                    <p
                      className="text-[9px] truncate mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatDate(file.lastModified)}
                    </p>
                  </div>
                  <span
                    className="text-[8px] px-1 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: `${LANG_BADGE_COLORS[file.language] ?? "#555"}22`,
                      color:
                        LANG_BADGE_COLORS[file.language] ?? "var(--text-muted)",
                      border: `1px solid ${LANG_BADGE_COLORS[file.language] ?? "#555"}44`,
                    }}
                  >
                    {file.language}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleLoad(file)}
                      className="p-1 rounded hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      title="Load into editor"
                      data-ocid={`cloud.secondary_button.${i + 1}`}
                    >
                      <CloudDownload size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(file.path)}
                      className="p-1 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      title="Delete from cloud"
                      data-ocid={`cloud.delete_button.${i + 1}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer */}
      {isLoggedIn && (
        <div
          className="flex-shrink-0 px-3 py-1.5 border-t border-[var(--border)] flex items-center gap-1"
          style={{ background: "var(--bg-activity)" }}
        >
          <Cloud size={9} style={{ color: "var(--success)" }} />
          <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            {files.length} file{files.length !== 1 ? "s" : ""} in cloud storage
          </span>
        </div>
      )}
    </div>
  );
};
