import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  GitBranch,
  Loader2,
  LogIn,
  Monitor,
  Mouse,
  Timer,
  User,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
  onOpenLiveTemplates?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isMobile: isMobileProp,
  onOpenGit,
  onOpenLogin,
  onOpenProfile,
  onOpenCloud,
  cloudSyncStatus = "idle",
  isPresentationMode = false,
  onTogglePresentationMode,
  onOpenLiveTemplates,
}) => {
  const { openFiles, activeFileId } = useEditorStore();
  const { theme } = useThemeStore();
  const { settings, updateSettings } = useSettingsStore();
  const { isLoggedIn, principal } = useAuthStore();
  const { branch } = useGitStore();
  const { connectedRepo } = useGithubStore();
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const [vimMode, setVimMode] = useState(false);

  // Pomodoro state
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroFlash, setPomodoroFlash] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pomodoroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pomodoroRunning) {
      intervalRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setPomodoroRunning(false);
            setPomodoroFlash(true);
            setTimeout(() => setPomodoroFlash(false), 3000);
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              new Notification("CodeVeda", {
                body: "Pomodoro session complete! Time for a break.",
                icon: "/favicon.ico",
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pomodoroRunning]);

  // Close pomodoro popover on outside click
  useEffect(() => {
    if (!pomodoroOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        pomodoroRef.current &&
        !pomodoroRef.current.contains(e.target as Node)
      ) {
        setPomodoroOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [pomodoroOpen]);

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const cursorPos = activeFile?.cursorPosition ?? { lineNumber: 1, column: 1 };
  const langLabel = activeFile?.language ?? "plaintext";

  // File stats
  const lineCount = activeFile ? activeFile.content.split("\n").length : 0;
  const wordCount = activeFile
    ? activeFile.content.split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = activeFile ? activeFile.content.length : 0;
  const charDisplay =
    charCount >= 1000 ? `${(charCount / 1000).toFixed(1)}K` : String(charCount);

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
    if (cloudSyncStatus === "syncing")
      return <Loader2 size={11} className="animate-spin" />;
    if (cloudSyncStatus === "synced")
      return <CheckCircle2 size={11} style={{ color: "#22c55e" }} />;
    return <Cloud size={11} />;
  };

  const cloudLabel = () => {
    if (cloudSyncStatus === "syncing") return "Syncing...";
    if (cloudSyncStatus === "synced") return "Synced";
    if (cloudSyncStatus === "error") return "Sync error";
    return "Cloud";
  };

  const pomodoroPresets = [
    { label: "25 min", value: 25 * 60 },
    { label: "5 min", value: 5 * 60 },
    { label: "15 min", value: 15 * 60 },
  ];

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

        {!isMobile && (
          <span
            className="live-badge flex items-center px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: "#22c55e", color: "#fff", fontSize: 10 }}
          >
            ● LIVE
          </span>
        )}

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

        {/* Multi-cursor hint */}
        {!isMobile && (
          <span
            className="relative group"
            title="Alt+Click to add multi-cursor"
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}
              data-ocid="statusbar.multicursor.button"
            >
              <Mouse size={10} />
            </button>
            <span
              className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{
                background: "var(--bg-sidebar)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Alt+Click for multi-cursor
            </span>
          </span>
        )}

        {/* Presentation Mode badge */}
        {isPresentationMode && !isMobile && (
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            PRESENTATION
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
            {/* Live file stats */}
            <span
              className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              title={`${lineCount} lines, ${wordCount} words, ${charCount} chars`}
            >
              {lineCount}L {wordCount}W {charDisplay}C
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

        {/* Font size controls */}
        {!isMobile && (
          <span className="flex items-center gap-0.5 hover:bg-white/10 px-1 py-0.5 rounded transition-colors">
            <button
              type="button"
              className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/15 transition-colors text-[9px] font-bold leading-none"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onClick={() =>
                updateSettings({
                  fontSize: Math.max(10, settings.fontSize - 1),
                })
              }
              title="Decrease font size"
              data-ocid="statusbar.font_decrease.button"
            >
              A-
            </button>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.6)",
                minWidth: 18,
                textAlign: "center",
              }}
            >
              {settings.fontSize}
            </span>
            <button
              type="button"
              className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/15 transition-colors text-[9px] font-bold leading-none"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onClick={() =>
                updateSettings({
                  fontSize: Math.min(24, settings.fontSize + 1),
                })
              }
              title="Increase font size"
              data-ocid="statusbar.font_increase.button"
            >
              A+
            </button>
          </span>
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

        {/* Live Templates shortcut */}
        {!isMobile && onOpenLiveTemplates && (
          <button
            type="button"
            onClick={onOpenLiveTemplates}
            className="flex items-center gap-0.5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}
            title="Live Templates (Ctrl+J)"
            data-ocid="statusbar.templates.button"
          >
            <Zap size={9} />
          </button>
        )}

        {/* Presentation Mode toggle */}
        {!isMobile && onTogglePresentationMode && (
          <button
            type="button"
            onClick={onTogglePresentationMode}
            className="flex items-center gap-0.5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
            style={{
              color: isPresentationMode
                ? "var(--accent)"
                : "rgba(255,255,255,0.5)",
              fontSize: 10,
            }}
            title="Presentation Mode (Alt+F7)"
            data-ocid="statusbar.presentation.toggle"
          >
            <Monitor size={9} />
          </button>
        )}

        {/* Pomodoro Timer */}
        {!isMobile && (
          <div className="relative" ref={pomodoroRef}>
            <button
              type="button"
              onClick={() => setPomodoroOpen((v) => !v)}
              className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
              style={{
                fontSize: 10,
                color: pomodoroFlash
                  ? "#f7c948"
                  : pomodoroRunning
                    ? "#22c55e"
                    : "rgba(255,255,255,0.6)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              title="Pomodoro Timer"
              data-ocid="statusbar.pomodoro.button"
            >
              <Timer size={10} />
              <span>{formatTime(pomodoroSeconds)}</span>
            </button>

            {pomodoroOpen && (
              <div
                className="absolute bottom-7 right-0 rounded-lg shadow-2xl p-3 z-50"
                style={{
                  background: "var(--bg-sidebar)",
                  border: "1px solid var(--border)",
                  width: 180,
                }}
              >
                <p
                  className="text-[10px] font-semibold mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  POMODORO TIMER
                </p>
                <div className="text-center mb-3">
                  <span
                    className="text-xl font-bold"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {formatTime(pomodoroSeconds)}
                  </span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <button
                    type="button"
                    className="flex-1 text-[10px] py-1 rounded font-medium transition-colors"
                    style={{ background: "var(--accent)", color: "#fff" }}
                    onClick={() => setPomodoroRunning((v) => !v)}
                    data-ocid="statusbar.pomodoro_toggle.button"
                  >
                    {pomodoroRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-[10px] py-1 rounded font-medium transition-colors hover:bg-[var(--hover-item)]"
                    style={{
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                    onClick={() => {
                      setPomodoroRunning(false);
                      setPomodoroSeconds(25 * 60);
                    }}
                    data-ocid="statusbar.pomodoro_reset.button"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex gap-1">
                  {pomodoroPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className="flex-1 text-[9px] py-0.5 rounded transition-colors hover:bg-[var(--hover-item)]"
                      style={{
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                      onClick={() => {
                        setPomodoroRunning(false);
                        setPomodoroSeconds(p.value);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full mt-2 text-[9px] py-0.5 rounded transition-colors hover:bg-[var(--hover-item)]"
                  style={{ color: "var(--text-muted)" }}
                  onClick={() => {
                    if (
                      typeof Notification !== "undefined" &&
                      Notification.permission !== "granted"
                    ) {
                      Notification.requestPermission();
                    }
                  }}
                >
                  Enable notifications
                </button>
              </div>
            )}
          </div>
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
