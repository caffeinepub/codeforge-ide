import { Zap } from "lucide-react";
import React, { useState } from "react";
import { useEditorStore } from "../stores/editorStore";
import { useFilesystemStore } from "../stores/filesystemStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSettingsStore } from "../stores/settingsStore";
import {
  openDirectoryFromSystem,
  openFileFromSystem,
  saveFileToSystem,
} from "../utils/fileSystemService";

interface MenuBarProps {
  sidebarVisible: boolean;
  bottomPanelVisible: boolean;
  onToggleSidebar: () => void;
  onToggleBottomPanel: () => void;
  onOpenCommandPalette: () => void;
  onOpenSearch: () => void;
  onOpenExplorer: () => void;
  onOpenExtensions: () => void;
  onOpenGit: () => void;
  onOpenAI: () => void;
  onOpenProfile: () => void;
  onNewTerminal: () => void;
  onToggleFocusMode?: () => void;
  onOpenShortcutOverlay?: () => void;
}

type MenuAction = () => void;

interface MenuItem {
  label: string;
  action?: MenuAction;
  shortcut?: string;
}

type MenuItemOrSep = MenuItem | "---";

interface MenuDef {
  label: string;
  items: MenuItemOrSep[];
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onToggleSidebar,
  onToggleBottomPanel,
  onOpenCommandPalette,
  onOpenSearch,
  onOpenExplorer,
  onOpenExtensions,
  onOpenGit,
  onOpenAI,
  onOpenProfile,
  onNewTerminal,
  onToggleFocusMode,
  onOpenShortcutOverlay,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { addNotification } = useNotificationStore();
  const { openFiles, activeFileId, closeFile, markFileDirty } =
    useEditorStore();
  const { addFile, loadFromDirectory, loadFile, saveFileByPath, saveAllFiles } =
    useFilesystemStore();
  const { openFile } = useEditorStore();
  const { updateSettings, settings } = useSettingsStore();

  const notify = (
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
  ) => addNotification({ message, type });

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
        notify(`Opened project: ${result.name}`, "success");
      }
    } catch (err) {
      notify(`Failed to open folder: ${(err as Error).message}`, "error");
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
        notify(
          `Opened ${files.length} file${files.length !== 1 ? "s" : ""}`,
          "success",
        );
      }
    } catch (err) {
      notify(`Failed to open file: ${(err as Error).message}`, "error");
    }
  };

  const handleSave = async () => {
    if (activeFileId) {
      const activeFile = openFiles.find((f) => f.id === activeFileId);
      if (activeFile) {
        await saveFileByPath(activeFile.path, activeFile.content);
        markFileDirty(activeFileId, false);
        notify("File saved", "success");
      }
    }
  };

  const handleSaveAs = async () => {
    if (activeFileId) {
      const activeFile = openFiles.find((f) => f.id === activeFileId);
      if (activeFile) {
        const handle = await saveFileToSystem(
          activeFile.name,
          activeFile.content,
          undefined,
        );
        if (handle) {
          markFileDirty(activeFileId, false);
          notify(`Saved as ${activeFile.name}`, "success");
        }
      }
    }
  };

  const handleSaveAll = async () => {
    await saveAllFiles(
      openFiles.map((f) => ({
        name: f.name,
        path: f.path,
        content: f.content,
      })),
    );
    for (const f of openFiles) {
      markFileDirty(f.id, false);
    }
    notify(`All ${openFiles.length} files saved`, "success");
  };

  const handleCloseEditor = () => {
    if (activeFileId) closeFile(activeFileId);
  };

  const MENUS: MenuDef[] = [
    {
      label: "File",
      items: [
        { label: "New File", action: handleNewFile, shortcut: "Ctrl+N" },
        { label: "Open Folder...", action: handleOpenFolder },
        { label: "Open File...", action: handleOpenFile, shortcut: "Ctrl+O" },
        "---",
        { label: "Save", action: handleSave, shortcut: "Ctrl+S" },
        {
          label: "Save As...",
          action: handleSaveAs,
          shortcut: "Ctrl+Shift+S",
        },
        { label: "Save All", action: handleSaveAll, shortcut: "Ctrl+K S" },
        "---",
        {
          label: "Close Editor",
          action: handleCloseEditor,
          shortcut: "Ctrl+W",
        },
        {
          label: "Open Recent",
          action: () => notify("Open Recent: no recent files"),
        },
        "---",
        {
          label: "Exit",
          action: () => notify("Close the browser tab to exit"),
        },
      ],
    },
    {
      label: "Edit",
      items: [
        {
          label: "Undo",
          action: () => notify("Use Ctrl+Z to undo"),
          shortcut: "Ctrl+Z",
        },
        {
          label: "Redo",
          action: () => notify("Use Ctrl+Y to redo"),
          shortcut: "Ctrl+Y",
        },
        "---",
        {
          label: "Cut",
          action: () => notify("Use Ctrl+X to cut"),
          shortcut: "Ctrl+X",
        },
        {
          label: "Copy",
          action: () => notify("Use Ctrl+C to copy"),
          shortcut: "Ctrl+C",
        },
        {
          label: "Paste",
          action: () => notify("Use Ctrl+V to paste"),
          shortcut: "Ctrl+V",
        },
        "---",
        {
          label: "Find",
          action: () => notify("Use Ctrl+F to find in editor"),
          shortcut: "Ctrl+F",
        },
        {
          label: "Replace",
          action: () => notify("Use Ctrl+H to replace in editor"),
          shortcut: "Ctrl+H",
        },
        "---",
        {
          label: "Find in Files",
          action: onOpenSearch,
          shortcut: "Ctrl+Shift+F",
        },
        { label: "Replace in Files", action: onOpenSearch },
      ],
    },
    {
      label: "Selection",
      items: [
        {
          label: "Select All",
          action: () => notify("Use Ctrl+A to select all"),
          shortcut: "Ctrl+A",
        },
        {
          label: "Expand Selection",
          action: () => notify("Use Shift+Alt+Right to expand selection"),
        },
        {
          label: "Shrink Selection",
          action: () => notify("Use Shift+Alt+Left to shrink selection"),
        },
        "---",
        {
          label: "Copy Line Up",
          action: () => notify("Use Shift+Alt+Up to copy line up"),
        },
        {
          label: "Copy Line Down",
          action: () => notify("Use Shift+Alt+Down to copy line down"),
        },
        {
          label: "Move Line Up",
          action: () => notify("Use Alt+Up to move line up"),
        },
        {
          label: "Move Line Down",
          action: () => notify("Use Alt+Down to move line down"),
        },
        "---",
        {
          label: "Add Cursor Above",
          action: () => notify("Use Ctrl+Alt+Up to add cursor above"),
        },
        {
          label: "Add Cursor Below",
          action: () => notify("Use Ctrl+Alt+Down to add cursor below"),
        },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "Command Palette...",
          action: onOpenCommandPalette,
          shortcut: "Ctrl+Shift+P",
        },
        "---",
        { label: "Explorer", action: onOpenExplorer, shortcut: "Ctrl+Shift+E" },
        { label: "Search", action: onOpenSearch, shortcut: "Ctrl+Shift+F" },
        { label: "Source Control", action: onOpenGit },
        {
          label: "Extensions",
          action: onOpenExtensions,
          shortcut: "Ctrl+Shift+X",
        },
        { label: "AI Assistant", action: onOpenAI },
        { label: "Profile", action: onOpenProfile },
        "---",
        {
          label: "Toggle Sidebar",
          action: onToggleSidebar,
          shortcut: "Ctrl+B",
        },
        {
          label: "Toggle Panel",
          action: onToggleBottomPanel,
          shortcut: "Ctrl+`",
        },
        {
          label: "Focus Mode",
          action: onToggleFocusMode,
          shortcut: "Ctrl+Shift+F11",
        },
        {
          label: "Toggle Minimap",
          action: () => {
            updateSettings({ minimap: !settings.minimap });
            notify(`Minimap ${!settings.minimap ? "enabled" : "disabled"}`);
          },
        },
        "---",
        {
          label: "Zoom In",
          action: () => {
            const next = Math.min(24, settings.fontSize + 1);
            updateSettings({ fontSize: next });
            notify(`Font size: ${next}px`);
          },
          shortcut: "Ctrl++",
        },
        {
          label: "Zoom Out",
          action: () => {
            const next = Math.max(10, settings.fontSize - 1);
            updateSettings({ fontSize: next });
            notify(`Font size: ${next}px`);
          },
          shortcut: "Ctrl+-",
        },
        {
          label: "Reset Zoom",
          action: () => {
            updateSettings({ fontSize: 14 });
            notify("Zoom reset to 14px");
          },
        },
      ],
    },
    {
      label: "Go",
      items: [
        {
          label: "Back",
          action: () => notify("Navigation history: use browser back"),
        },
        {
          label: "Forward",
          action: () => notify("Navigation history: use browser forward"),
        },
        "---",
        {
          label: "Go to File...",
          action: onOpenCommandPalette,
          shortcut: "Ctrl+P",
        },
        {
          label: "Go to Line/Column...",
          action: () => notify("Use Ctrl+G to go to line"),
          shortcut: "Ctrl+G",
        },
        {
          label: "Go to Symbol...",
          action: () => notify("Use Ctrl+Shift+O for symbol navigation"),
        },
        "---",
        {
          label: "Go to Definition",
          action: () => notify("Use F12 to go to definition"),
        },
        {
          label: "Go to References",
          action: () => notify("Use Shift+F12 for references"),
        },
      ],
    },
    {
      label: "Run",
      items: [
        {
          label: "Start Debugging",
          action: () => notify("Debug: Start a debug configuration first"),
        },
        {
          label: "Run Without Debugging",
          action: () => notify("Run: Use npm run dev in terminal"),
        },
        "---",
        {
          label: "Add Configuration...",
          action: () => notify("Add a launch.json in .vscode/"),
        },
        {
          label: "Open Configurations",
          action: () => notify("Open .vscode/launch.json"),
        },
      ],
    },
    {
      label: "Terminal",
      items: [
        { label: "New Terminal", action: onNewTerminal, shortcut: "Ctrl+`" },
        {
          label: "Split Terminal",
          action: () => notify("Split Terminal: coming soon"),
        },
        "---",
        {
          label: "Run Task...",
          action: () => notify("Run Task: configure tasks.json"),
        },
        {
          label: "Run Build Task",
          action: () => notify("Run Build Task: npm run build"),
          shortcut: "Ctrl+Shift+B",
        },
      ],
    },
    {
      label: "Help",
      items: [
        {
          label: "Welcome",
          action: () => {
            openFile({
              id: "welcome",
              name: "Welcome",
              path: "welcome",
              content: "",
              language: "plaintext",
              isDirty: false,
            });
          },
        },
        {
          label: "Documentation",
          action: () => notify("Documentation: https://codeveda.dev/docs"),
        },
        "---",
        {
          label: "Keyboard Shortcuts",
          action: onOpenShortcutOverlay,
          shortcut: "Shift+?",
        },
        "---",
        {
          label: "About CodeVeda",
          action: () =>
            notify("CodeVeda v4.0.0 \u2014 A VS Code-like IDE for ICP"),
        },
      ],
    },
  ];

  const handleMenuClick = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  React.useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div
      className="flex items-center px-2 flex-shrink-0 border-b relative z-50"
      style={{
        height: 36,
        background: "var(--bg-activity)",
        borderBottomColor: "rgba(255,255,255,0.08)",
        borderBottomWidth: 1,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Premium brand logo */}
      <div className="flex items-center gap-1.5 mr-3 flex-shrink-0">
        <span
          className="zap-pulse"
          style={{ display: "flex", alignItems: "center" }}
        >
          <Zap
            size={14}
            style={{
              color: "#61dafb",
              filter: "drop-shadow(0 0 4px #007acc88)",
            }}
          />
        </span>
        <span
          className="text-xs font-bold"
          style={{
            background: "linear-gradient(90deg, #007acc, #61dafb)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.3px",
          }}
        >
          CodeVeda
        </span>
        <span
          className="text-[9px] font-semibold px-1 py-0.5 rounded-full"
          style={{
            background: "rgba(0,122,204,0.25)",
            color: "#61dafb",
            border: "1px solid rgba(97,218,251,0.3)",
            lineHeight: 1,
          }}
        >
          v4.0
        </span>
      </div>

      {MENUS.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            type="button"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              openMenu === menu.label
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(menu.label);
            }}
            data-ocid={`menubar.${menu.label.toLowerCase()}.button`}
          >
            {menu.label}
          </button>

          {openMenu === menu.label && (
            <div
              className="absolute top-full left-0 min-w-[220px] rounded shadow-2xl border border-[var(--border)] py-1 z-50"
              style={{ background: "var(--bg-sidebar)", marginTop: 2 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenMenu(null);
              }}
            >
              {menu.items.map((item, idx) =>
                item === "---" ? (
                  <div
                    key={`sep-${menu.label}-${idx}`}
                    className="border-t border-[var(--border)] my-1"
                  />
                ) : (
                  <button
                    type="button"
                    key={item.label}
                    className="w-full text-left px-4 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center justify-between gap-4"
                    onClick={() => {
                      setOpenMenu(null);
                      item.action?.();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span
                        className="text-[9px] opacity-60 flex-shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
