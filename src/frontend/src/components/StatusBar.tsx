import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  GitBranch,
  Loader2,
  LogIn,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useAuthStore } from "../stores/authStore";
import { useEditorStore } from "../stores/editorStore";
import { useGitStore } from "../stores/gitStore";
import { useGithubStore } from "../stores/githubStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore } from "../stores/themeStore";
import { NotificationCenter } from "./NotificationCenter";

interface StatusBarProps {
  isMobile?: boolean;
  onOpenGit?: () => void;
  onOpenLogin?: () => void;
  onOpenProfile?: () => void;
  onOpenCloud?: () => void;
  cloudSyncStatus?: "idle" | "syncing" | "synced" | "error";
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isMobile: isMobileProp,
  onOpenGit,
  onOpenLogin,
  onOpenProfile,
  onOpenCloud,
  cloudSyncStatus = "idle",
}) => {
  const { openFiles, activeFileId } = useEditorStore();
  const { theme } = useThemeStore();
  const { settings } = useSettingsStore();
  const { isLoggedIn, principal } = useAuthStore();
  const { branch } = useGitStore();
  const { connectedRepo } = useGithubStore();
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const [vimMode, setVimMode] = useState(false);

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const cursorPos = activeFile?.cursorPosition ?? { lineNumber: 1, column: 1 };
  const langLabel = activeFile?.language ?? "plaintext";

  const wordCount = activeFile
    ? activeFile.content.split(/\s+/).filter(Boolean).length
    : 0;

  const principalShort = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : null;

  const themeLabel =
    {
      dark: "Dark+",
      light: "Light+",
      "high-contrast": "HC Dark",
      monokai: "Monokai",
      "solarized-dark": "Solarized",
      dracula: "Dracula",
      nord: "Nord",
      "one-dark": "One Dark",
    }[theme] ?? theme;

  const cloudIcon = () => {
    if (cloudSyncStatus === "syncing") {
      return <Loader2 size={11} className="animate-spin" />;
    }
    if (cloudSyncStatus === "synced") {
      return <CheckCircle2 size={11} style={{ color: "#22c55e" }} />;
    }
    return <Cloud size={11} />;
  };

  const cloudLabel = () => {
    if (cloudSyncStatus === "syncing") return "Syncing...";
    if (cloudSyncStatus === "synced") return "Synced";
    if (cloudSyncStatus === "error") return "Sync error";
    return "Cloud";
  };

  return (
    <div
      className="flex items-center justify-between px-3 select-none flex-shrink-0 overflow-hidden"
      style={{
        height: 24,
        background:
          "linear-gradient(90deg, var(--bg-status-bar) 0%, color-mix(in srgb, var(--bg-status-bar) 80%, #000) 100%)",
        color: "rgba(255,255,255,0.9)",
        fontSize: 11,
        zIndex: 100,
      }}
      data-ocid="statusbar.panel"
    >
      {/* Left */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenGit}
          className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          data-ocid="statusbar.git.button"
        >
          <GitBranch size={11} />
          <span>{branch}</span>
        </button>

        {/* LIVE badge */}
        {!isMobile && (
          <span
            className="live-badge flex items-center px-1.5 py-0.5 rounded-full font-semibold"
            style={{
              background: "#22c55e",
              color: "#fff",
              fontSize: 10,
            }}
          >
            ● LIVE
          </span>
        )}

        {/* GitHub badge */}
        {connectedRepo && !isMobile && (
          <span className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
            <Cloud size={11} />
            <span>
              {connectedRepo.owner}/{connectedRepo.name}
            </span>
          </span>
        )}

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
      <div className="flex items-center gap-1">
        {activeFile && !isMobile && (
          <>
            <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              Ln {cursorPos.lineNumber}, Col {cursorPos.column}
            </span>
            <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              {wordCount}W
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
            {themeLabel}
          </span>
        )}

        {/* Vim mode toggle */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setVimMode((v) => !v)}
            className="px-1.5 py-0.5 rounded font-semibold transition-colors hover:bg-white/10"
            style={{
              fontSize: 10,
              color: vimMode ? "var(--accent)" : "rgba(255,255,255,0.5)",
            }}
            data-ocid="statusbar.toggle"
          >
            {vimMode ? "VIM" : "INS"}
          </button>
        )}

        {/* Cloud sync indicator */}
        {isLoggedIn && !isMobile && (
          <button
            type="button"
            onClick={onOpenCloud}
            className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            style={{
              color:
                cloudSyncStatus === "error"
                  ? "#ff6b6b"
                  : cloudSyncStatus === "synced"
                    ? "#22c55e"
                    : "rgba(255,255,255,0.7)",
            }}
            title="Cloud Storage"
            data-ocid="statusbar.cloud.button"
          >
            {cloudIcon()}
            <span style={{ fontSize: 10 }}>{cloudLabel()}</span>
          </button>
        )}

        {/* Auth / Profile */}
        <button
          type="button"
          onClick={isLoggedIn ? onOpenProfile : onOpenLogin}
          className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          data-ocid="statusbar.auth.button"
        >
          {isLoggedIn ? (
            <>
              <User size={11} />
              {!isMobile && <span>{principalShort}</span>}
            </>
          ) : (
            <>
              <LogIn size={11} />
              {!isMobile && <span>Sign In</span>}
            </>
          )}
        </button>

        <NotificationCenter />
      </div>
    </div>
  );
};
