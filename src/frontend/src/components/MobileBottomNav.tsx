import {
  Bot,
  Files,
  GitFork,
  GitGraph,
  Settings,
  Share2,
  Terminal,
  Users,
  Workflow,
} from "lucide-react";
import type React from "react";

export type MobileNavTab =
  | "explorer"
  | "github"
  | "ai"
  | "terminal"
  | "settings"
  | "collab"
  | "social"
  | "cicd"
  | "vcs";

interface MobileBottomNavProps {
  activeTab?: MobileNavTab;
  onNavChange: (tab: MobileNavTab) => void;
}

const NAV_ITEMS: { id: MobileNavTab; icon: React.ReactNode; label: string }[] =
  [
    { id: "explorer", icon: <Files size={19} />, label: "Files" },
    { id: "github", icon: <GitFork size={19} />, label: "GitHub" },
    { id: "ai", icon: <Bot size={19} />, label: "AI" },
    { id: "terminal", icon: <Terminal size={19} />, label: "Terminal" },
    { id: "collab", icon: <Users size={19} />, label: "Collab" },
    { id: "social", icon: <Share2 size={19} />, label: "Social" },
    { id: "cicd", icon: <Workflow size={19} />, label: "CI/CD" },
    { id: "vcs", icon: <GitGraph size={19} />, label: "VCS" },
    { id: "settings", icon: <Settings size={19} />, label: "Settings" },
  ];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavChange,
}) => {
  return (
    <div
      className="flex items-center flex-shrink-0 border-t border-[var(--border)] overflow-x-auto scrollbar-none"
      style={{ height: 52, background: "var(--bg-activity)" }}
      data-ocid="mobile.bottomnav.panel"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className="flex-shrink-0 min-w-[52px] h-full flex flex-col items-center justify-center gap-0.5 relative transition-colors px-1"
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
