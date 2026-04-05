import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, Files, Puzzle, Search, Settings } from "lucide-react";
import type React from "react";

type ActivityTab = "explorer" | "search" | "extensions" | "settings" | "ai";

interface ActivityBarProps {
  activePanel: ActivityTab;
  onPanelChange: (panel: ActivityTab) => void;
}

const ITEMS: { id: ActivityTab; icon: React.ReactNode; label: string }[] = [
  { id: "explorer", icon: <Files size={22} />, label: "Explorer" },
  { id: "search", icon: <Search size={22} />, label: "Search" },
  { id: "extensions", icon: <Puzzle size={22} />, label: "Extensions" },
];

const BOTTOM_ITEMS: {
  id: ActivityTab;
  icon: React.ReactNode;
  label: string;
}[] = [
  { id: "ai", icon: <Bot size={22} />, label: "AI Assistant" },
  { id: "settings", icon: <Settings size={22} />, label: "Settings" },
];

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activePanel,
  onPanelChange,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="flex flex-col items-center py-2 flex-shrink-0 border-r border-[var(--border)]"
        style={{ width: 48, background: "var(--bg-activity)", zIndex: 10 }}
      >
        <div className="flex flex-col items-center gap-0.5 flex-1">
          {ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`w-12 h-12 flex items-center justify-center relative transition-colors ${
                    activePanel === item.id
                      ? "text-[var(--icon-active)]"
                      : "text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => onPanelChange(item.id)}
                  data-ocid={`activitybar.${item.id}.button`}
                >
                  {activePanel === item.id && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                      style={{ background: "var(--icon-active)" }}
                    />
                  )}
                  {item.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-col items-center gap-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`w-12 h-12 flex items-center justify-center relative transition-colors ${
                    activePanel === item.id
                      ? "text-[var(--icon-active)]"
                      : "text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => onPanelChange(item.id)}
                  data-ocid={`activitybar.${item.id}.button`}
                >
                  {activePanel === item.id && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                      style={{ background: "var(--icon-active)" }}
                    />
                  )}
                  {item.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
