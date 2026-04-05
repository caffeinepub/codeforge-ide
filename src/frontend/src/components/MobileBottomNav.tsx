import { Bot, Files, Search, Settings } from "lucide-react";
import type React from "react";

type MobileNavTab = "explorer" | "search" | "ai" | "settings";

interface MobileBottomNavProps {
  activeTab?: MobileNavTab;
  onNavChange: (tab: MobileNavTab) => void;
}

const NAV_ITEMS: { id: MobileNavTab; icon: React.ReactNode; label: string }[] =
  [
    { id: "explorer", icon: <Files size={20} />, label: "Explorer" },
    { id: "search", icon: <Search size={20} />, label: "Search" },
    { id: "ai", icon: <Bot size={20} />, label: "AI" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings" },
  ];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavChange,
}) => {
  return (
    <div
      className="flex items-center flex-shrink-0 border-t border-[var(--border)]"
      style={{ height: 52, background: "var(--bg-activity)" }}
      data-ocid="mobile.bottomnav.panel"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 relative transition-colors"
            style={{
              color: isActive ? "var(--accent)" : "var(--icon-inactive)",
            }}
            onClick={() => onNavChange(item.id)}
            data-ocid={`mobile.${item.id}.tab`}
            aria-label={item.label}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b"
                style={{ background: "var(--accent)" }}
              />
            )}
            {item.icon}
            <span className="text-[9px] font-medium tracking-wide">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
