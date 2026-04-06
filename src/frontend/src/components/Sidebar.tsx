import {
  ChevronDown,
  FileInput,
  FilePlus,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { FileTree } from "../features/filesystem/FileTree";
import { SearchPanel } from "../features/filesystem/SearchPanel";
import { useEditorStore } from "../stores/editorStore";
import { useFilesystemStore } from "../stores/filesystemStore";
import { useNotificationStore } from "../stores/notificationStore";
import {
  openDirectoryFromSystem,
  openFileFromSystem,
} from "../utils/fileSystemService";
import type { ActivityTab } from "./ActivityBar";
import { BookmarksPanel } from "./BookmarksPanel";
import { CloudFilesPanel } from "./CloudFilesPanel";
import { ExtensionsMarketplace } from "./ExtensionsMarketplace";
import { GitHubPanel } from "./GitHubPanel";
import { GitPanel } from "./GitPanel";
import { IntelligencePanel } from "./IntelligencePanel";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { NotesPanel } from "./NotesPanel";
import { RecentFilesPanel } from "./RecentFilesPanel";
import { SnippetsPanel } from "./SnippetsPanel";

interface SidebarProps {
  activePanel: ActivityTab;
  width: number;
  onOpenGitHub?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePanel,
  width,
  onOpenGitHub,
}) => {
  const { addFile, loadFromDirectory, loadFile, projectName } =
    useFilesystemStore();
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

  const handleOpenFolder = async () => {
    try {
      const result = await openDirectoryFromSystem();
      if (result) {
        loadFromDirectory(result);
        addNotification({
          message: `Opened project: ${result.name}`,
          type: "success",
        });
      }
    } catch (err) {
      addNotification({
        message: `Failed to open folder: ${(err as Error).message}`,
        type: "error",
      });
    }
  };

  const handleOpenFile = async () => {
    try {
      const files = await openFileFromSystem();
      for (const f of files) {
        loadFile(f);
        openFile({
          id: f.node.id,
          name: f.node.name,
          path: f.node.path,
          content: f.content,
          language: f.node.language ?? "plaintext",
          isDirty: false,
        });
      }
      if (files.length > 0) {
        addNotification({
          message: `Opened ${files.length} file${files.length !== 1 ? "s" : ""}`,
          type: "success",
        });
      }
    } catch (err) {
      addNotification({
        message: `Failed to open file: ${(err as Error).message}`,
        type: "error",
      });
    }
  };

  // Full-height panels that replace the sidebar entirely
  const fullPanelMap: Partial<Record<ActivityTab, React.ReactNode>> = {
    extensions: <ExtensionsMarketplace />,
    git: <GitPanel onOpenGitHub={onOpenGitHub} />,
    github: <GitHubPanel />,
    snippets: <SnippetsPanel />,
    preview: <LivePreviewPanel />,
    intelligence: <IntelligencePanel />,
    notes: <NotesPanel />,
    bookmarks: <BookmarksPanel />,
    recent: <RecentFilesPanel />,
    cloud: <CloudFilesPanel />,
  };

  if (fullPanelMap[activePanel]) {
    return (
      <div
        className="sidebar-panel flex flex-col h-full border-r border-[var(--border)] overflow-hidden"
        style={{ width }}
      >
        {fullPanelMap[activePanel]}
      </div>
    );
  }

  return (
    <div
      className="sidebar-panel flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-sidebar)] overflow-hidden"
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
                title="Open Folder"
                onClick={handleOpenFolder}
                data-ocid="sidebar.open_modal_button"
              >
                <FolderOpen size={13} />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                title="Open File"
                onClick={handleOpenFile}
                data-ocid="sidebar.secondary_button"
              >
                <FileInput size={13} />
              </button>
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
              {projectName}
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
