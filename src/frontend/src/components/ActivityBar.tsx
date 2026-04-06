import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bookmark,
  Bot,
  Brain,
  Bug,
  Cloud,
  Crown,
  Database,
  Eye,
  FileClock,
  FileText,
  Files,
  GitBranch,
  GitFork,
  GitGraph,
  History,
  Layout,
  Play,
  Puzzle,
  Scissors,
  Search,
  Settings,
  Share2,
  Shield,
  User,
  Users,
  Workflow,
} from "lucide-react";
import type React from "react";
import { useAuthStore } from "../stores/authStore";

export type ActivityTab =
  | "explorer"
  | "search"
  | "extensions"
  | "settings"
  | "ai"
  | "git"
  | "github"
  | "snippets"
  | "preview"
  | "admin"
  | "profile"
  | "intelligence"
  | "notes"
  | "bookmarks"
  | "recent"
  | "cloud"
  | "collab"
  | "social"
  | "cicd"
  | "vcs"
  | "structure"
  | "database"
  | "run-configs"
  | "local-history"
  | "inspections";

interface ActivityBarProps {
  activePanel: ActivityTab;
  onPanelChange: (panel: ActivityTab) => void;
}

const ITEMS: { id: ActivityTab; icon: React.ReactNode; label: string }[] = [
  { id: "explorer", icon: <Files size={22} />, label: "Explorer" },
  { id: "search", icon: <Search size={22} />, label: "Search" },
  { id: "git", icon: <GitBranch size={22} />, label: "Source Control" },
  { id: "github", icon: <GitFork size={22} />, label: "GitHub" },
  { id: "extensions", icon: <Puzzle size={22} />, label: "Extensions" },
  { id: "snippets", icon: <Scissors size={22} />, label: "Snippets" },
  { id: "preview", icon: <Eye size={22} />, label: "Live Preview" },
  { id: "intelligence", icon: <Brain size={22} />, label: "Code Intelligence" },
  // Phase 9: Collaboration & Social
  { id: "collab", icon: <Users size={22} />, label: "Collaboration" },
  { id: "social", icon: <Share2 size={22} />, label: "Social Coding" },
  { id: "cicd", icon: <Workflow size={22} />, label: "CI/CD Pipeline" },
  { id: "vcs", icon: <GitGraph size={22} />, label: "Version Control" },
  // Cloud-backed panels
  { id: "notes", icon: <FileText size={22} />, label: "Scratch Pad" },
  { id: "bookmarks", icon: <Bookmark size={22} />, label: "Bookmarks" },
  { id: "recent", icon: <History size={22} />, label: "Recent Files" },
  { id: "cloud", icon: <Cloud size={22} />, label: "Cloud Files" },
  // IntelliJ IDEA-inspired panels
  { id: "structure", icon: <Layout size={22} />, label: "Code Structure" },
  { id: "database", icon: <Database size={22} />, label: "Database" },
  { id: "run-configs", icon: <Play size={22} />, label: "Run Configurations" },
  {
    id: "local-history",
    icon: <FileClock size={22} />,
    label: "Local History",
  },
  { id: "inspections", icon: <Bug size={22} />, label: "Code Inspections" },
];

const BOTTOM_ITEMS: {
  id: ActivityTab;
  icon: React.ReactNode;
  label: string;
}[] = [
  { id: "ai", icon: <Bot size={22} />, label: "AI Assistant" },
  { id: "admin", icon: <Crown size={22} />, label: "Admin Dashboard" },
  { id: "profile", icon: <User size={22} />, label: "Profile" },
  { id: "settings", icon: <Settings size={22} />, label: "Settings" },
];

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activePanel,
  onPanelChange,
}) => {
  const { isAdmin } = useAuthStore();

  const renderButton = (
    item: { id: ActivityTab; icon: React.ReactNode; label: string },
    disabled = false,
    overrideIcon?: React.ReactNode,
  ) => {
    const isActive = activePanel === item.id && !disabled;
    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`w-10 h-10 mx-1 flex items-center justify-center transition-all rounded-md ${
              disabled
                ? "opacity-30 cursor-not-allowed"
                : isActive
                  ? "text-[var(--icon-active)]"
                  : "text-[var(--icon-inactive)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-item)]"
            }`}
            style={
              isActive
                ? {
                    background: "rgba(0,122,204,0.15)",
                    boxShadow:
                      "0 0 8px 2px color-mix(in srgb, var(--accent) 30%, transparent)",
                  }
                : {}
            }
            onClick={() => !disabled && onPanelChange(item.id)}
            data-ocid={`activitybar.${item.id}.button`}
          >
            {overrideIcon ?? item.icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {disabled ? "Admin Only" : item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="activity-bar flex flex-col items-center py-2 flex-shrink-0 border-r border-[var(--border)] overflow-y-auto scrollbar-none"
        style={{ width: 48, background: "var(--bg-activity)", zIndex: 10 }}
      >
        <div className="flex flex-col items-center gap-0.5 flex-1">
          {ITEMS.map((item) => renderButton(item))}
        </div>

        <div className="flex flex-col items-center gap-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const isAdminItem = item.id === "admin";
            const disabled = isAdminItem && !isAdmin;
            const overrideIcon =
              isAdminItem && isAdmin ? (
                <Shield size={22} style={{ color: "var(--warning)" }} />
              ) : undefined;
            return renderButton(item, disabled, overrideIcon);
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
