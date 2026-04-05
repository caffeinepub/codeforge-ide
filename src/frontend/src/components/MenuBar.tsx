import React, { useState } from "react";

const MENUS: { label: string; items: string[] }[] = [
  {
    label: "File",
    items: [
      "New File",
      "New Window",
      "---",
      "Open...",
      "Open Recent",
      "---",
      "Save",
      "Save As...",
      "Save All",
      "---",
      "Close Editor",
      "Exit",
    ],
  },
  {
    label: "Edit",
    items: [
      "Undo",
      "Redo",
      "---",
      "Cut",
      "Copy",
      "Paste",
      "---",
      "Find",
      "Replace",
      "---",
      "Find in Files",
      "Replace in Files",
    ],
  },
  {
    label: "Selection",
    items: [
      "Select All",
      "Expand Selection",
      "Shrink Selection",
      "---",
      "Copy Line Up",
      "Copy Line Down",
      "Move Line Up",
      "Move Line Down",
      "---",
      "Add Cursor Above",
      "Add Cursor Below",
    ],
  },
  {
    label: "View",
    items: [
      "Command Palette...",
      "---",
      "Explorer",
      "Search",
      "Extensions",
      "---",
      "Toggle Sidebar",
      "Toggle Panel",
      "Toggle Minimap",
      "---",
      "Zoom In",
      "Zoom Out",
      "Reset Zoom",
    ],
  },
  {
    label: "Go",
    items: [
      "Back",
      "Forward",
      "---",
      "Go to File...",
      "Go to Line/Column...",
      "Go to Symbol...",
      "---",
      "Go to Definition",
      "Go to References",
    ],
  },
  {
    label: "Run",
    items: [
      "Start Debugging",
      "Run Without Debugging",
      "---",
      "Add Configuration...",
      "Open Configurations",
    ],
  },
  {
    label: "Terminal",
    items: [
      "New Terminal",
      "Split Terminal",
      "---",
      "Run Task...",
      "Run Build Task",
    ],
  },
  {
    label: "Help",
    items: [
      "Welcome",
      "Documentation",
      "---",
      "Keyboard Shortcuts",
      "---",
      "About CodeForge IDE",
    ],
  },
];

interface MenuBarProps {
  sidebarVisible: boolean;
  bottomPanelVisible: boolean;
  onToggleSidebar: () => void;
  onToggleBottomPanel: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onToggleSidebar,
  onToggleBottomPanel,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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
      className="flex items-center px-2 flex-shrink-0 border-b border-[var(--border)] relative z-50"
      style={{ height: 30, background: "var(--bg-activity)" }}
    >
      <div className="flex items-center gap-1.5 mr-3 flex-shrink-0">
        <span className="text-sm">\u26a1</span>
        <span
          className="text-xs font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          CodeForge
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
              className="absolute top-full left-0 min-w-[200px] rounded shadow-2xl border border-[var(--border)] py-1 z-50"
              style={{ background: "var(--bg-sidebar)", marginTop: 2 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenMenu(null);
              }}
            >
              {menu.items.map((item) =>
                item === "---" ? (
                  <div
                    key={`sep-${item}-${menu.label}`}
                    className="border-t border-[var(--border)] my-1"
                  />
                ) : (
                  <button
                    type="button"
                    key={item}
                    className="w-full text-left px-4 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                    onClick={() => {
                      setOpenMenu(null);
                      if (item === "Toggle Sidebar") onToggleSidebar();
                      if (item === "Toggle Panel") onToggleBottomPanel();
                    }}
                  >
                    {item}
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
