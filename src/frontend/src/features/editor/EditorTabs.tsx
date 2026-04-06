import { CloudUpload, Loader2, Pin, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { saveCloudFile } from "../../services/backendService";
import { useAuthStore } from "../../stores/authStore";
import { useEditorStore } from "../../stores/editorStore";
import { FileIcon } from "../filesystem/FileIcon";

interface EditorTabsProps {
  isPrimary: boolean;
  activeFileId: string | null;
  onTabSelect: (id: string) => void;
}

const TAB_COLORS: { label: string; value: string }[] = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
];

interface CtxMenu {
  tabId: string;
  x: number;
  y: number;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeFileId,
  onTabSelect,
}) => {
  const {
    openFiles,
    closeFile,
    closeOtherFiles,
    closeFilesToRight,
    reorderTabs,
    pinnedTabs,
    tabColors,
    pinTab,
    unpinTab,
    setTabColor,
  } = useEditorStore();
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [savingToCloud, setSavingToCloud] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const [colorSubOpen, setColorSubOpen] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);

  // Sort: pinned first
  const sortedFiles = [
    ...openFiles.filter((f) => pinnedTabs.has(f.id)),
    ...openFiles.filter((f) => !pinnedTabs.has(f.id)),
  ];

  // Close context menu on outside click
  useEffect(() => {
    if (!ctxMenu) return;
    const handler = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
        setColorSubOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [ctxMenu]);

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

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setCtxMenu({ tabId: id, x: e.clientX, y: e.clientY });
    setColorSubOpen(false);
  };

  const handleSaveToCloud = async (
    e: React.MouseEvent,
    file: (typeof openFiles)[0],
  ) => {
    e.stopPropagation();
    if (!actor || !isLoggedIn) {
      toast.error("Login to save files to cloud");
      return;
    }
    setSavingToCloud(file.id);
    const ok = await saveCloudFile(actor, {
      name: file.name,
      path: file.path,
      content: file.content,
      language: file.language,
      lastModified: BigInt(Date.now()),
    });
    setSavingToCloud(null);
    if (ok) toast.success(`"${file.name}" saved to cloud ☁`);
    else toast.error("Failed to save to cloud");
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
    <>
      <div
        className="flex items-end border-b border-[var(--border)] overflow-x-auto flex-shrink-0 scrollbar-none"
        style={{ height: 36, background: "var(--bg-tab-bar)" }}
      >
        {sortedFiles.map((file, index) => {
          const isActive = file.id === activeFileId;
          const isPinned = pinnedTabs.has(file.id);
          const tagColor = tabColors[file.id];
          const origIndex = openFiles.indexOf(file);
          return (
            <div
              key={file.id}
              draggable
              onDragStart={() => handleDragStart(origIndex)}
              onDragOver={(e) => handleDragOver(e, origIndex)}
              onDrop={(e) => handleDrop(e, origIndex)}
              onDragEnd={handleDragEnd}
              onClick={() => onTabSelect(file.id)}
              onContextMenu={(e) => handleContextMenu(e, file.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onTabSelect(file.id);
              }}
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              className={`flex items-center gap-1 px-2 h-full cursor-pointer flex-shrink-0 border-r border-[var(--border)] group relative transition-colors
                ${isActive ? "bg-[var(--bg-tab-active)] border-t-[2px] border-t-[var(--accent)]" : "bg-[var(--bg-tab-inactive)] hover:bg-[var(--hover-item)]"}
                ${dragOverIndex === origIndex ? "border-l-2 border-l-[var(--accent)]" : ""}
              `}
              style={{ maxWidth: 200, minWidth: 80, fontSize: 12 }}
              data-ocid={`editor.tab.${index + 1}`}
            >
              {/* Color tag dot */}
              {tagColor && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: tagColor }}
                />
              )}

              {isPinned && (
                <Pin
                  size={9}
                  className="flex-shrink-0"
                  style={{ color: "var(--accent)", opacity: 0.8 }}
                />
              )}

              <FileIcon name={file.name} size={13} />
              <span
                className={`truncate text-xs ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                style={{ fontSize: 12 }}
              >
                {file.name}
              </span>

              {/* Cloud save button */}
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded flex items-center justify-center hover:bg-[var(--hover-item)] text-[var(--text-muted)] hover:text-[var(--accent)] flex-shrink-0 transition-all"
                onClick={(e) => handleSaveToCloud(e, file)}
                title="Save to cloud"
                data-ocid={`editor.upload_button.${index + 1}`}
              >
                {savingToCloud === file.id ? (
                  <Loader2 size={9} className="animate-spin" />
                ) : (
                  <CloudUpload size={9} />
                )}
              </button>

              {/* Close / dirty indicator */}
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {file.isDirty ? (
                  <span
                    className="w-2 h-2 rounded-full bg-orange-400 group-hover:hidden"
                    title="Unsaved changes"
                  />
                ) : null}
                {!isPinned && (
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
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          className="fixed z-[9999] rounded shadow-2xl py-1 min-w-[180px]"
          style={{
            top: ctxMenu.y,
            left: ctxMenu.x,
            background: "var(--bg-sidebar)",
            border: "1px solid var(--border)",
          }}
          onKeyDown={(e) => e.key === "Escape" && setCtxMenu(null)}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
            onClick={() => {
              if (pinnedTabs.has(ctxMenu.tabId)) unpinTab(ctxMenu.tabId);
              else pinTab(ctxMenu.tabId);
              setCtxMenu(null);
            }}
            data-ocid="editor.tab_pin.button"
          >
            <Pin size={11} />
            {pinnedTabs.has(ctxMenu.tabId) ? "Unpin Tab" : "Pin Tab"}
          </button>

          {/* Color tag submenu */}
          <div className="relative">
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-between"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setColorSubOpen((v) => !v)}
            >
              <span>Color Tag</span>
              <span style={{ fontSize: 9, opacity: 0.7 }}>▶</span>
            </button>
            {colorSubOpen && (
              <div
                className="absolute left-full top-0 rounded shadow-2xl py-1 min-w-[130px]"
                style={{
                  background: "var(--bg-sidebar)",
                  border: "1px solid var(--border)",
                  marginLeft: 2,
                }}
              >
                {TAB_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--hover-item)] transition-colors flex items-center gap-2"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => {
                      setTabColor(ctxMenu.tabId, c.value);
                      setCtxMenu(null);
                      setColorSubOpen(false);
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: c.value }}
                    />
                    {c.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--hover-item)] transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onClick={() => {
                    setTabColor(ctxMenu.tabId, null);
                    setCtxMenu(null);
                    setColorSubOpen(false);
                  }}
                >
                  Clear tag
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] my-1" />

          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent)] hover:text-white transition-colors"
            style={{ color: "var(--text-primary)" }}
            onClick={() => {
              closeFile(ctxMenu.tabId);
              setCtxMenu(null);
            }}
            data-ocid="editor.tab_close.button"
          >
            Close
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent)] hover:text-white transition-colors"
            style={{ color: "var(--text-primary)" }}
            onClick={() => {
              closeOtherFiles(ctxMenu.tabId);
              setCtxMenu(null);
            }}
          >
            Close Others
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent)] hover:text-white transition-colors"
            style={{ color: "var(--text-primary)" }}
            onClick={() => {
              closeFilesToRight(ctxMenu.tabId);
              setCtxMenu(null);
            }}
          >
            Close to the Right
          </button>
        </div>
      )}
    </>
  );
};
