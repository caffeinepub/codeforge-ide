import { Eye, RefreshCw } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../stores/editorStore";

export const LivePreviewPanel: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const isHtml = activeFile?.name.endsWith(".html") ?? false;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const content = activeFile?.content ?? "";

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional for manual refresh
  useEffect(() => {
    if (!isHtml || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(content);
      doc.close();
    }
  }, [content, isHtml, refreshKey]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={12} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
          >
            Live Preview
          </span>
        </div>
        {isHtml && (
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
            title="Refresh"
            data-ocid="preview.secondary_button"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>

      {isHtml ? (
        <iframe
          ref={iframeRef}
          title="Live Preview"
          className="flex-1 w-full border-none"
          sandbox="allow-scripts allow-same-origin"
          data-ocid="preview.canvas_target"
        />
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          data-ocid="preview.empty_state"
        >
          <Eye
            size={32}
            className="mb-3"
            style={{ color: "var(--text-muted)" }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            No HTML file active
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Open an <code style={{ color: "var(--accent)" }}>.html</code> file
            to preview it here.
          </p>
        </div>
      )}
    </div>
  );
};
