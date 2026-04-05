import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useEditorStore } from "../stores/editorStore";

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
    ],
  },
  {
    label: "View",
    items: [
      "Command Palette...",
      "---",
      "Explorer",
      "Search",
      "---",
      "Toggle Sidebar",
      "Toggle Panel",
      "---",
      "Zoom In",
      "Zoom Out",
      "Reset Zoom",
    ],
  },
  {
    label: "Go",
    items: [
      "Go to File...",
      "Go to Line/Column...",
      "Go to Symbol...",
      "---",
      "Go to Definition",
      "Go to References",
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

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSidebar: () => void;
  onToggleBottomPanel: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  onToggleSidebar,
  onToggleBottomPanel,
}) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { setShowCommandPalette } = useEditorStore();

  const handleMenuToggle = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const handleItemClick = (item: string) => {
    if (item === "Toggle Sidebar") {
      onToggleSidebar();
    } else if (item === "Toggle Panel") {
      onToggleBottomPanel();
    } else if (item === "Command Palette...") {
      setShowCommandPalette(true);
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="p-0 border-r border-[var(--border)] flex flex-col"
        style={{
          width: "80vw",
          maxWidth: 320,
          background: "var(--bg-sidebar)",
        }}
        data-ocid="mobile.menu.panel"
      >
        <SheetHeader className="flex-shrink-0 px-4 py-3 border-b border-[var(--border)] flex flex-row items-center justify-between">
          <SheetTitle
            className="flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span>&#9889;</span>
            <span className="text-sm font-bold">CodeForge IDE</span>
          </SheetTitle>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--icon-inactive)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)] transition-colors"
            onClick={onClose}
            aria-label="Close menu"
            data-ocid="mobile.menu.close_button"
          >
            <X size={16} />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {MENUS.map((menu) => {
            const isExpanded = expandedMenu === menu.label;
            return (
              <div key={menu.label}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-[var(--hover-item)] transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => handleMenuToggle(menu.label)}
                  data-ocid={`mobile.menu.${menu.label.toLowerCase()}.toggle`}
                >
                  <span>{menu.label}</span>
                  {isExpanded ? (
                    <ChevronDown
                      size={14}
                      style={{ color: "var(--text-muted)" }}
                    />
                  ) : (
                    <ChevronRight
                      size={14}
                      style={{ color: "var(--text-muted)" }}
                    />
                  )}
                </button>

                {isExpanded && (
                  <div className="pb-1">
                    {menu.items.map((item, idx) =>
                      item === "---" ? (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: separator
                          key={`sep-${idx}`}
                          className="border-t border-[var(--border)] my-1 mx-4"
                        />
                      ) : (
                        <button
                          type="button"
                          key={item}
                          className="w-full text-left px-8 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)] transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="flex-shrink-0 px-4 py-3 border-t border-[var(--border)]"
          style={{ fontSize: 11, color: "var(--text-muted)" }}
        >
          CodeForge IDE v1.0.0
        </div>
      </SheetContent>
    </Sheet>
  );
};
