import { Cloud, FileText, Loader2, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { fetchScratchPad, saveScratchPad } from "../services/backendService";
import { useAuthStore } from "../stores/authStore";

export const NotesPanel: React.FC = () => {
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const [content, setContent] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadedRef = useRef(false);

  // Load scratch pad on open
  useEffect(() => {
    if (!actor || !isLoggedIn || isLoadedRef.current) return;
    isLoadedRef.current = true;
    fetchScratchPad(actor).then((text) => {
      if (text !== null) {
        setContent(text);
      }
    });
  }, [actor, isLoggedIn]);

  const doSave = useCallback(
    async (text: string) => {
      if (!actor || !isLoggedIn) return;
      setIsSyncing(true);
      const ok = await saveScratchPad(actor, text);
      setIsSyncing(false);
      if (ok) {
        setLastSaved(new Date());
      }
    },
    [actor, isLoggedIn],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    if (!isLoggedIn) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSave(text), 1500);
  };

  const handleClear = async () => {
    setContent("");
    setShowClearConfirm(false);
    if (actor && isLoggedIn) {
      setIsSyncing(true);
      const ok = await saveScratchPad(actor, "");
      setIsSyncing(false);
      if (ok) {
        setLastSaved(new Date());
        toast.success("Scratch pad cleared");
      }
    }
  };

  const formatLastSaved = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    return `${m}m ago`;
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
          >
            Scratch Pad
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSyncing && (
            <Loader2
              size={11}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
          )}
          {!isSyncing && lastSaved && (
            <span
              className="flex items-center gap-1 text-[9px]"
              style={{ color: "var(--text-muted)" }}
            >
              <Cloud size={9} />
              Saved {formatLastSaved(lastSaved)}
            </span>
          )}
          {showClearConfirm ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: "var(--error)", color: "white" }}
                onClick={handleClear}
                data-ocid="notes.confirm_button"
              >
                Clear
              </button>
              <button
                type="button"
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--hover-item)",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowClearConfirm(false)}
                data-ocid="notes.cancel_button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              title="Clear scratch pad"
              onClick={() => setShowClearConfirm(true)}
              className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-red-400 transition-colors"
              data-ocid="notes.delete_button"
            >
              <Trash2 size={11} />
            </button>
          )}
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
          Login to sync your scratch pad to the cloud
        </div>
      )}

      <textarea
        className="flex-1 resize-none p-4 outline-none font-mono text-xs leading-relaxed"
        style={{
          background: "var(--bg-editor)",
          color: "var(--text-primary)",
          fontFamily: "'JetBrains Mono', monospace",
          border: "none",
        }}
        placeholder="Type your notes, ideas, code snippets...\n\nThis scratch pad auto-saves to the cloud every 1.5 seconds."
        value={content}
        onChange={handleChange}
        spellCheck={false}
        data-ocid="notes.textarea"
      />

      <div
        className="flex-shrink-0 px-3 py-1.5 border-t border-[var(--border)] flex items-center justify-between"
        style={{ background: "var(--bg-activity)" }}
      >
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
          {content.length} chars · {content.split(/\n/).length} lines
        </span>
        {lastSaved && (
          <span
            className="flex items-center gap-1 text-[9px]"
            style={{ color: "var(--text-muted)" }}
            data-ocid="notes.success_state"
          >
            <Cloud size={9} style={{ color: "var(--success)" }} />
            <span style={{ color: "var(--success)" }}>Saved to cloud</span>
          </span>
        )}
      </div>
    </div>
  );
};
