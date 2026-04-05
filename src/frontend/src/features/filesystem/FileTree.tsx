import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useFilesystemStore } from "../../stores/filesystemStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { FileIcon } from "./FileIcon";
import type { FSNode } from "./mockFileSystem";
import { FILE_CONTENTS, getLanguageFromPath } from "./mockFileSystem";

interface FileTreeNodeProps {
  node: FSNode;
  depth: number;
  expandedFolders: Set<string>;
  selectedFileId: string | null;
  renamingNodeId: string | null;
  onFileClick: (node: FSNode) => void;
  onFolderToggle: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FSNode) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  expandedFolders,
  selectedFileId,
  renamingNodeId,
  onFileClick,
  onFolderToggle,
  onContextMenu,
  onRename,
  onDelete,
}) => {
  const [renameValue, setRenameValue] = useState(node.name);
  const renameRef = useRef<HTMLInputElement>(null);
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedFileId === node.id;
  const isRenaming = renamingNodeId === node.id;

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename(node.id, renameValue.trim());
    } else {
      onRename(node.id, node.name);
    }
  };

  const handleRowClick = () => {
    if (node.type === "folder") {
      onFolderToggle(node.id);
    } else {
      onFileClick(node);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-1 py-0.5 cursor-pointer select-none group relative
          ${isSelected ? "bg-[var(--active-item)]" : "hover:bg-[var(--hover-item)]"}
        `}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleRowClick();
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
        role="treeitem"
        aria-expanded={node.type === "folder" ? isExpanded : undefined}
      >
        {node.type === "folder" ? (
          <span className="w-4 h-4 flex items-center justify-center text-[var(--text-secondary)] flex-shrink-0">
            {isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </span>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        <span className="flex-shrink-0">
          <FileIcon
            name={node.name}
            isFolder={node.type === "folder"}
            isOpen={isExpanded}
            size={14}
          />
        </span>

        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") onRename(node.id, node.name);
            }}
            className="flex-1 text-xs bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--accent)] outline-none px-1 py-0.5 rounded-sm"
            style={{ fontSize: 12 }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 text-xs truncate"
            style={{
              fontSize: 12,
              color: isSelected
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            }}
          >
            {node.name}
          </span>
        )}

        {!isRenaming && (
          <div className="absolute right-1 top-0 bottom-0 items-center gap-0.5 hidden group-hover:flex">
            {node.type === "folder" && (
              <>
                <button
                  type="button"
                  className="p-0.5 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  onClick={(e) => e.stopPropagation()}
                  title="New File"
                >
                  <FilePlus size={11} />
                </button>
                <button
                  type="button"
                  className="p-0.5 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  onClick={(e) => e.stopPropagation()}
                  title="New Folder"
                >
                  <FolderPlus size={11} />
                </button>
              </>
            )}
            <button
              type="button"
              className="p-0.5 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
              onClick={(e) => {
                e.stopPropagation();
                setRenameValue(node.name);
                onRename(node.id, "__EDITING__");
              }}
              title="Rename"
            >
              <Pencil size={11} />
            </button>
            <button
              type="button"
              className="p-0.5 rounded hover:bg-[var(--hover-item)] text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              selectedFileId={selectedFileId}
              renamingNodeId={renamingNodeId}
              onFileClick={onFileClick}
              onFolderToggle={onFolderToggle}
              onContextMenu={onContextMenu}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ContextMenuState {
  x: number;
  y: number;
  node: FSNode;
}

export const FileTree: React.FC = () => {
  const {
    fileTree,
    selectedFileId,
    expandedFolders,
    renamingNodeId,
    setSelectedFile,
    toggleFolder,
    renameNode,
    deleteNode,
    addFile,
    addFolder,
    setRenamingNode,
  } = useFilesystemStore();

  const { openFile } = useEditorStore();
  const { addNotification } = useNotificationStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleFileClick = (node: FSNode) => {
    setSelectedFile(node.id);
    const content = FILE_CONTENTS[node.path] ?? `// ${node.name}\n`;
    const language = node.language ?? getLanguageFromPath(node.path);
    openFile({
      id: node.id,
      name: node.name,
      path: node.path,
      content,
      language,
      isDirty: false,
    });
  };

  const handleContextMenu = (e: React.MouseEvent, node: FSNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleRename = (id: string, newName: string) => {
    if (newName === "__EDITING__") {
      setRenamingNode(id);
    } else {
      renameNode(id, newName);
      setRenamingNode(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteNode(id);
    addNotification({ message: "File deleted", type: "info" });
  };

  const handleNewFile = (parentId: string | null) => {
    const name = `newfile_${Date.now().toString(36)}.ts`;
    const node = addFile(parentId, name);
    openFile({
      id: node.id,
      name: node.name,
      path: node.path,
      content: "",
      language: "typescript",
      isDirty: false,
    });
    setRenamingNode(node.id);
    setContextMenu(null);
  };

  const handleNewFolder = (parentId: string | null) => {
    const node = addFolder(parentId, "new-folder");
    setRenamingNode(node.id);
    setContextMenu(null);
  };

  return (
    <div className="flex-1 overflow-y-auto relative">
      {fileTree.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          depth={0}
          expandedFolders={expandedFolders}
          selectedFileId={selectedFileId}
          renamingNodeId={renamingNodeId}
          onFileClick={handleFileClick}
          onFolderToggle={toggleFolder}
          onContextMenu={handleContextMenu}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      ))}

      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") setContextMenu(null);
          }}
          role="menu"
        >
          {contextMenu.node.type === "folder" && (
            <>
              <button
                type="button"
                className="w-full text-left px-4 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white flex items-center gap-2"
                onClick={() => handleNewFile(contextMenu.node.id)}
              >
                <FilePlus size={12} /> New File
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white flex items-center gap-2"
                onClick={() => handleNewFolder(contextMenu.node.id)}
              >
                <FolderPlus size={12} /> New Folder
              </button>
              <div className="border-t border-[var(--border)] my-1" />
            </>
          )}
          <button
            type="button"
            className="w-full text-left px-4 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white flex items-center gap-2"
            onClick={() => {
              handleRename(contextMenu.node.id, "__EDITING__");
              setContextMenu(null);
            }}
          >
            <Pencil size={12} /> Rename
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-1.5 text-xs text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2"
            onClick={() => {
              handleDelete(contextMenu.node.id);
              setContextMenu(null);
            }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
