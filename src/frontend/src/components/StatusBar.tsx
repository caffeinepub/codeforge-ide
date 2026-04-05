import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  GitBranch,
} from "lucide-react";
import type React from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useEditorStore } from "../stores/editorStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore } from "../stores/themeStore";

interface StatusBarProps {
  isMobile?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isMobile: isMobileProp,
}) => {
  const { openFiles, activeFileId } = useEditorStore();
  const { theme } = useThemeStore();
  const { settings } = useSettingsStore();
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const cursorPos = activeFile?.cursorPosition ?? { lineNumber: 1, column: 1 };

  const langLabel = activeFile?.language ?? "plaintext";

  return (
    <div
      className="flex items-center justify-between px-3 select-none flex-shrink-0 overflow-hidden"
      style={{
        height: 24,
        background: "var(--bg-status-bar)",
        color: "rgba(255,255,255,0.9)",
        fontSize: 11,
        zIndex: 100,
      }}
      data-ocid="statusbar.panel"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch size={11} />
          <span>main</span>
        </span>
        {!isMobile && (
          <span className="flex items-center gap-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
            <AlertCircle size={11} />
            <span>0</span>
            <AlertTriangle size={11} className="ml-1" />
            <span>2</span>
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {activeFile && !isMobile && (
          <>
            <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              Ln {cursorPos.lineNumber}, Col {cursorPos.column}
            </span>
            <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              Spaces: {settings.tabSize}
            </span>
            <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              UTF-8
            </span>
            <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              LF
            </span>
          </>
        )}
        {activeFile && (
          <span className="capitalize hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
            {langLabel}
          </span>
        )}
        {!isMobile && (
          <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors capitalize">
            {theme === "high-contrast"
              ? "HC Dark"
              : theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        )}
        <span className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <CheckCircle size={11} />
        </span>
      </div>
    </div>
  );
};
