import { X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { FileIcon } from "../filesystem/FileIcon";

interface EditorTabsProps {
  isPrimary: boolean;
  activeFileId: string | null;
  onTabSelect: (id: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeFileId,
  onTabSelect,
}) => {
  const { openFiles, closeFile, reorderTabs } = useEditorStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndexRef.current !== null && dragIndexRef.current !== toIndex) {
      reorderTabs(dragIndexRef.current, toIndex);
    }
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeFile(id);
  };

  if (openFiles.length === 0) {
    return (
      <div
        className="flex items-center border-b border-[var(--border)] overflow-hidden flex-shrink-0"
        style={{ height: 36, background: "var(--bg-tab-bar)" }}
      />
    );
  }

  return (
    <div
      className="flex items-end border-b border-[var(--border)] overflow-x-auto flex-shrink-0 scrollbar-none"
      style={{ height: 36, background: "var(--bg-tab-bar)" }}
    >
      {openFiles.map((file, index) => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onTabSelect(file.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onTabSelect(file.id);
            }}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            className={`flex items-center gap-1.5 px-3 h-full cursor-pointer flex-shrink-0 border-r border-[var(--border)] group relative transition-colors
              ${
                isActive
                  ? "bg-[var(--bg-tab-active)] border-t-[2px] border-t-[var(--accent)]"
                  : "bg-[var(--bg-tab-inactive)] hover:bg-[var(--hover-item)]"
              }
              ${dragOverIndex === index ? "border-l-2 border-l-[var(--accent)]" : ""}
            `}
            style={{ maxWidth: 200, minWidth: 80, fontSize: 12 }}
            data-ocid={`editor.tab.${index + 1}`}
          >
            <FileIcon name={file.name} size={13} />
            <span
              className={`truncate text-xs ${
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)]"
              }`}
              style={{ fontSize: 12 }}
            >
              {file.name}
            </span>
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {file.isDirty ? (
                <span
                  className="w-2 h-2 rounded-full bg-orange-400 group-hover:hidden"
                  title="Unsaved changes"
                />
              ) : null}
              <button
                type="button"
                className={`w-4 h-4 rounded flex items-center justify-center hover:bg-[var(--hover-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0
                  ${file.isDirty ? "hidden group-hover:flex" : "opacity-0 group-hover:opacity-100"}
                `}
                onClick={(e) => handleClose(e, file.id)}
                data-ocid={`editor.close_button.${index + 1}`}
              >
                <X size={11} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
