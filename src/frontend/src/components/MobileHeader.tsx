import { Command, Menu, Plus } from "lucide-react";
import type React from "react";
import { useEditorStore } from "../stores/editorStore";
import { useFilesystemStore } from "../stores/filesystemStore";

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuOpen }) => {
  const { setShowCommandPalette, openFile } = useEditorStore();
  const { addFile } = useFilesystemStore();

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
      className="flex items-center justify-between flex-shrink-0 border-b border-[var(--border)]"
      style={{
        height: 44,
        background: "var(--bg-activity)",
        paddingLeft: 4,
        paddingRight: 4,
      }}
      data-ocid="mobile.header.panel"
    >
      {/* Left: hamburger */}
      <button
        type="button"
        className="w-11 h-11 flex items-center justify-center rounded text-[var(--icon-inactive)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)] transition-colors"
        onClick={onMenuOpen}
        data-ocid="mobile.menu.button"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Center: app name */}
      <div className="flex items-center gap-1.5">
        <span className="text-base">&#9889;</span>
        <span
          className="text-sm font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          CodeForge
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center">
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center rounded text-[var(--icon-inactive)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)] transition-colors"
          onClick={handleNewFile}
          aria-label="New file"
          data-ocid="mobile.newfile.button"
        >
          <Plus size={20} />
        </button>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center rounded text-[var(--icon-inactive)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)] transition-colors"
          onClick={() => setShowCommandPalette(true)}
          aria-label="Command palette"
          data-ocid="mobile.command.button"
        >
          <Command size={20} />
        </button>
      </div>
    </div>
  );
};
