import { ChevronRight } from "lucide-react";
import type React from "react";
import { useEditorStore } from "../../stores/editorStore";
import { FileIcon } from "../filesystem/FileIcon";

export const Breadcrumbs: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  if (!activeFile) return null;

  const parts = activeFile.path.split("/");

  return (
    <div
      className="flex items-center gap-0.5 px-3 border-b border-[var(--border)] overflow-x-auto flex-shrink-0"
      style={{ height: 24, background: "var(--bg-editor)" }}
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
            className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-[var(--hover-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            style={{ fontSize: 11 }}
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
    </div>
  );
};
