import { ChevronDown, FilePlus, RefreshCw } from "lucide-react";
import type React from "react";
import { FileTree } from "../features/filesystem/FileTree";
import { SearchPanel } from "../features/filesystem/SearchPanel";
import { useEditorStore } from "../stores/editorStore";
import { useFilesystemStore } from "../stores/filesystemStore";
import { useNotificationStore } from "../stores/notificationStore";

interface SidebarProps {
  activePanel: "explorer" | "search";
  width: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePanel, width }) => {
  const { addFile } = useFilesystemStore();
  const { openFile } = useEditorStore();
  const { addNotification } = useNotificationStore();

  const handleNewFile = () => {
    const name = `untitled-${Date.now().toString(36)}.ts`;
    const node = addFile(null, name);
    openFile({
      id: node.id,
      name: node.name,
      path: node.path,
      content: "",
      language: "typescript",
      isDirty: false,
    });
  };

  return (
    <div
      className="flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-sidebar)] overflow-hidden"
      style={{ width }}
    >
      {activePanel === "explorer" ? (
        <>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
            >
              Explorer
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                title="New File"
                onClick={handleNewFile}
                data-ocid="sidebar.primary_button"
              >
                <FilePlus size={13} />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                title="Refresh"
                onClick={() =>
                  addNotification({
                    message: "File tree refreshed",
                    type: "info",
                  })
                }
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--border)] flex-shrink-0 cursor-pointer hover:bg-[var(--hover-item)] w-full text-left"
          >
            <ChevronDown size={12} className="text-[var(--text-secondary)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              CodeForge IDE
            </span>
          </button>

          <FileTree />
        </>
      ) : (
        <>
          <div className="flex items-center px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
            >
              Search
            </span>
          </div>
          <SearchPanel />
        </>
      )}
    </div>
  );
};
