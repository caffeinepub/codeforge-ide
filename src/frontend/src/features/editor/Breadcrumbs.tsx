import { ChevronRight } from "lucide-react";
import type React from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { FileIcon } from "../filesystem/FileIcon";

const TS_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx", "mts", "cts"]);

function getExt(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export const Breadcrumbs: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const { addNotification } = useNotificationStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  if (!activeFile) return null;

  const parts = activeFile.path.split("/");
  const ext = getExt(activeFile.name);
  const isCodeFile = TS_EXTENSIONS.has(ext);

  return (
    <div
      className="flex items-center gap-0.5 px-3 border-b border-[var(--border)] overflow-x-auto flex-shrink-0"
      style={{
        height: 24,
        background: "var(--bg-editor)",
        scrollbarWidth: "none",
      }}
    >
      {parts.map((part, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static path segments
        <span key={`${part}-${idx}`} className="flex items-center gap-0.5">
          {idx > 0 && (
            <ChevronRight
              size={10}
              className="text-[var(--text-muted)] flex-shrink-0"
            />
          )}
          <button
            type="button"
            className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-[var(--hover-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
            style={{ fontSize: 11 }}
            onClick={() =>
              addNotification({ message: `Navigate to: ${part}`, type: "info" })
            }
          >
            {idx === parts.length - 1 && <FileIcon name={part} size={11} />}
            <span
              className={
                idx === parts.length - 1 ? "text-[var(--text-primary)]" : ""
              }
            >
              {part}
            </span>
          </button>
        </span>
      ))}
      {/* Code symbol badge for TS/JS files */}
      {isCodeFile && (
        <span
          className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold flex-shrink-0"
          style={{
            background: "rgba(0,122,204,0.2)",
            color: "var(--accent)",
            border: "1px solid rgba(0,122,204,0.3)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {"</>"}
        </span>
      )}
    </div>
  );
};
