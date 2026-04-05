import { Sheet, SheetContent } from "@/components/ui/sheet";
import type React from "react";
import { Sidebar } from "./Sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: "explorer" | "search";
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  activePanel,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="p-0 border-r border-[var(--border)]"
        style={{
          width: "85vw",
          maxWidth: 360,
          background: "var(--bg-sidebar)",
        }}
        data-ocid="mobile.sidebar.panel"
      >
        <Sidebar
          activePanel={activePanel}
          width={(85 * window.innerWidth) / 100}
        />
      </SheetContent>
    </Sheet>
  );
};
