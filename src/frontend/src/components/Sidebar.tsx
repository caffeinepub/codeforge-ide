import {
  ChevronDown,
  FileCode2,
  FileInput,
  FilePlus,
  FolderOpen,
  Plus,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { CICDPanel } from "./CICDPanel";
import { CloudFilesPanel } from "./CloudFilesPanel";
import { CodeInspectionsPanel } from "./CodeInspectionsPanel";
import { CodeStructurePanel } from "./CodeStructurePanel";
import { CollaborationPanel } from "./CollaborationPanel";
import { DatabasePanel } from "./DatabasePanel";
import { ExtensionsMarketplace } from "./ExtensionsMarketplace";
import { GitHubPanel } from "./GitHubPanel";
import { GitPanel } from "./GitPanel";
import { IntelligencePanel } from "./IntelligencePanel";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { LocalHistoryPanel } from "./LocalHistoryPanel";
import { NotesPanel } from "./NotesPanel";
import { RecentFilesPanel } from "./RecentFilesPanel";
import { RunConfigurationsPanel } from "./RunConfigurationsPanel";
import { SnippetsPanel } from "./SnippetsPanel";
import { SocialCodingPanel } from "./SocialCodingPanel";
import { VersionControlPanel } from "./VersionControlPanel";

interface SidebarProps {
  activePanel: ActivityTab;
  width?: number;
  onOpenGitHub?: () => void;
}

const SCRATCH_FILES_KEY = "codeveda_scratch";

const DEFAULT_SCRATCH_FILES = [
  { name: "scratch.js", language: "javascript" },
  { name: "scratch.ts", language: "typescript" },
  { name: "scratch.md", language: "markdown" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePanel,
  width = 260,
  onOpenGitHub,
}) => {
  const { addFile, loadFromDirectory, loadFile, projectName } =
    useFilesystemStore();
  const { openFile } = useEditorStore();
  const { addNotification } = useNotificationStore();
  const [scratchCollapsed, setScratchCollapsed] = useState(false);
  const [scratchFiles, setScratchFiles] = useState(DEFAULT_SCRATCH_FILES);

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

  const openScratchFile = (sf: { name: string; language: string }) => {
    const storageKey = `${SCRATCH_FILES_KEY}_${sf.name}`;
    const content = localStorage.getItem(storageKey) ?? `// ${sf.name}\n`;
    openFile({
      id: `scratch_${sf.name}`,
      name: sf.name,
      path: `/scratch/${sf.name}`,
      content,
      language: sf.language,
      isDirty: false,
    });
  };

  const addScratchFile = () => {
    const ext = ["js", "ts", "md", "txt", "css"][Math.floor(Math.random() * 5)];
    const name = `scratch-${Date.now().toString(36)}.${ext}`;
    const langMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      md: "markdown",
      txt: "plaintext",
      css: "css",
    };
    const newFile = { name, language: langMap[ext] };
    setScratchFiles((prev) => [...prev, newFile]);
    openScratchFile(newFile);
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
    // Phase 9 panels
    collab: <CollaborationPanel />,
    social: <SocialCodingPanel />,
    cicd: <CICDPanel />,
    vcs: <VersionControlPanel />,
    // IntelliJ-inspired panels
    structure: <CodeStructurePanel />,
    database: <DatabasePanel />,
    "run-configs": <RunConfigurationsPanel />,
    "local-history": <LocalHistoryPanel />,
    inspections: <CodeInspectionsPanel />,
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

          <div className="flex-1 overflow-y-auto">
            <FileTree />

            {/* Scratch Files section */}
            <div className="border-t border-[var(--border)] mt-1">
              <button
                type="button"
                className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-[var(--hover-item)] transition-colors"
                onClick={() => setScratchCollapsed((v) => !v)}
              >
                <div className="flex items-center gap-1">
                  <ChevronDown
                    size={10}
                    className={`text-[var(--text-muted)] transition-transform ${
                      scratchCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Scratch Files
                  </span>
                </div>
                <button
                  type="button"
                  className="p-0.5 rounded hover:bg-[var(--hover-item)]"
                  title="New Scratch File"
                  onClick={(e) => {
                    e.stopPropagation();
                    addScratchFile();
                  }}
                  data-ocid="sidebar.scratch.primary_button"
                >
                  <Plus size={11} style={{ color: "var(--text-muted)" }} />
                </button>
              </button>
              {!scratchCollapsed && (
                <div className="pb-1">
                  {scratchFiles.map((sf) => (
                    <button
                      key={sf.name}
                      type="button"
                      className="flex items-center gap-2 w-full px-4 py-1 hover:bg-[var(--hover-item)] transition-colors text-left"
                      onClick={() => openScratchFile(sf)}
                      data-ocid="sidebar.scratch.item"
                    >
                      <FileCode2
                        size={12}
                        style={{ color: "#c678dd", flexShrink: 0 }}
                      />
                      <span
                        className="text-xs truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {sf.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
