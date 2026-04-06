import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AIAssistantPanel } from "./components/AIAssistantPanel";
import { ActivityBar } from "./components/ActivityBar";
import type { ActivityTab } from "./components/ActivityBar";
import { AdminDashboard } from "./components/AdminDashboard";
import type { PanelTab } from "./components/BottomPanel";
import { BottomPanel } from "./components/BottomPanel";
import { ClipboardHistoryPanel } from "./components/ClipboardHistoryPanel";
import { CommandPalette } from "./components/CommandPalette";
import { FileTemplatesDialog } from "./components/FileTemplatesDialog";
import { GitHubPanel } from "./components/GitHubPanel";
import { LiveTemplatesManager } from "./components/LiveTemplatesManager";
import { LoginDialog } from "./components/LoginDialog";
import { MenuBar } from "./components/MenuBar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import type { MobileNavTab } from "./components/MobileBottomNav";
import { MobileHeader } from "./components/MobileHeader";
import { MobileMenuDrawer } from "./components/MobileMenuDrawer";
import { MobileSidebar } from "./components/MobileSidebar";
import { NotificationToast } from "./components/NotificationToast";
import { QuickOpen } from "./components/QuickOpen";
import { ResizeHandle } from "./components/ResizeHandle";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { UserProfilePanel } from "./components/UserProfilePanel";
import { SplitEditor } from "./features/editor/SplitEditor";
import { useEditorShortcuts } from "./features/editor/useEditorShortcuts";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { useIsMobile } from "./hooks/use-mobile";
import { useEditorStore } from "./stores/editorStore";

const MIN_SIDEBAR_WIDTH = 150;
const MAX_SIDEBAR_WIDTH = 520;
const DEFAULT_SIDEBAR_WIDTH = 260;
const DEFAULT_BOTTOM_HEIGHT = 200;

interface BottomPanelHandle {
  setTab: (tab: PanelTab) => void;
}

const ALL_SHORTCUTS = [
  { key: "Ctrl+P", action: "Quick Open File" },
  { key: "Ctrl+Shift+P", action: "Command Palette" },
  { key: "Ctrl+W", action: "Close Tab" },
  { key: "Ctrl+S", action: "Save File" },
  { key: "Ctrl+Shift+S", action: "Save to Cloud" },
  { key: "Ctrl+B", action: "Toggle Sidebar" },
  { key: "Ctrl+`", action: "Toggle Terminal" },
  { key: "Ctrl+\\\\", action: "Split Editor" },
  { key: "Ctrl+Shift+F11", action: "Focus Mode" },
  { key: "Ctrl+K Z", action: "Zen Mode" },
  { key: "Shift+?", action: "Keyboard Overlay" },
  { key: "Ctrl+Shift+A", action: "Focus AI Input" },
  { key: "Ctrl+Shift+E", action: "Open Explorer" },
  { key: "Ctrl+Shift+F", action: "Search in Files" },
  { key: "Ctrl+Shift+G", action: "Source Control" },
  { key: "Ctrl+Shift+X", action: "Extensions" },
  { key: "Ctrl+F", action: "Find in Editor" },
  { key: "Ctrl+H", action: "Find & Replace" },
  { key: "Ctrl+Z", action: "Undo" },
  { key: "Ctrl+Y", action: "Redo" },
  { key: "Ctrl+/", action: "Toggle Line Comment" },
  { key: "Alt+Up", action: "Move Line Up" },
  { key: "Alt+Down", action: "Move Line Down" },
  { key: "Alt+Click", action: "Add Multi-Cursor" },
  { key: "Ctrl+D", action: "Select Next Occurrence" },
  { key: "Ctrl+Shift+K", action: "Delete Line" },
  { key: "Ctrl+Enter", action: "Insert Line Below" },
  { key: "F12", action: "Go to Definition" },
  { key: "Ctrl+Shift+V", action: "Clipboard History" },
  { key: "Ctrl+J", action: "Live Templates" },
  { key: "Alt+F7", action: "Presentation Mode" },
];

// Map mobile nav tabs that correspond to sidebar panels
const MOBILE_SIDEBAR_PANEL_TABS: Record<string, ActivityTab> = {
  collab: "collab",
  social: "social",
  cicd: "cicd",
  vcs: "vcs",
};

function IDELayout() {
  useEditorShortcuts();

  const { setShowSettings, setSplitMode, setShowCommandPalette } =
    useEditorStore();
  const isMobile = useIsMobile();

  const [activePanel, setActivePanel] = useState<ActivityTab>("explorer");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(
    DEFAULT_BOTTOM_HEIGHT,
  );
  const [aiPanelVisible, setAiPanelVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [shortcutOverlayVisible, setShortcutOverlayVisible] = useState(false);
  const [fileTemplatesVisible, setFileTemplatesVisible] = useState(false);
  const [cloudSyncStatus, _setCloudSyncStatus] = useState<
    "idle" | "syncing" | "synced" | "error"
  >("idle");

  // New IntelliJ features state
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showClipboardHistory, setShowClipboardHistory] = useState(false);
  const [showLiveTemplates, setShowLiveTemplates] = useState(false);

  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSidebarPanel, setMobileSidebarPanel] = useState<
    "explorer" | "search"
  >("explorer");
  const [mobileActiveTab, setMobileActiveTab] = useState<
    MobileNavTab | undefined
  >(undefined);
  const [mobileGitHubOpen, setMobileGitHubOpen] = useState(false);
  // Mobile panel drawer (for collab/social/cicd/vcs)
  const [mobilePanelDrawerOpen, setMobilePanelDrawerOpen] = useState(false);
  const [mobilePanelDrawerTab, setMobilePanelDrawerTab] =
    useState<ActivityTab>("collab");

  const bottomPanelRef = useRef<BottomPanelHandle>(null);

  useEffect(() => {
    if (isMobile) setSplitMode(false);
  }, [isMobile, setSplitMode]);

  useEffect(() => {
    if (isMobile) return;
    let ctrlKPending = false;
    let ctrlKTimer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "b") {
        e.preventDefault();
        setSidebarVisible((v) => !v);
      }
      if (ctrl && e.key === "`") {
        e.preventDefault();
        setBottomPanelVisible((v) => !v);
      }
      if (ctrl && e.shiftKey && e.key === "F11") {
        e.preventDefault();
        setFocusMode((v) => !v);
      }
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setShortcutOverlayVisible((v) => !v);
      }
      if (e.key === "Escape") {
        setShortcutOverlayVisible(false);
        setZenMode(false);
        setIsPresentationMode(false);
        setShowClipboardHistory(false);
      }
      if (ctrl && e.key === "k") {
        e.preventDefault();
        ctrlKPending = true;
        if (ctrlKTimer) clearTimeout(ctrlKTimer);
        ctrlKTimer = setTimeout(() => {
          ctrlKPending = false;
        }, 1500);
        return;
      }
      if (ctrlKPending && e.key === "z") {
        e.preventDefault();
        ctrlKPending = false;
        if (ctrlKTimer) clearTimeout(ctrlKTimer);
        setZenMode((v) => !v);
      }
      // Clipboard History: Ctrl+Shift+V
      if (ctrl && e.shiftKey && e.key === "V") {
        e.preventDefault();
        setShowClipboardHistory((v) => !v);
      }
      // Live Templates: Ctrl+J
      if (ctrl && e.key === "j") {
        e.preventDefault();
        setShowLiveTemplates((v) => !v);
      }
      // Presentation Mode: Alt+F7
      if (e.altKey && e.key === "F7") {
        e.preventDefault();
        setIsPresentationMode((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (ctrlKTimer) clearTimeout(ctrlKTimer);
    };
  }, [isMobile]);

  const handleActivityChange = (panel: ActivityTab) => {
    if (panel === "settings") {
      setShowSettings(true);
      return;
    }
    if (panel === "ai") {
      setAiPanelVisible((v) => !v);
      return;
    }
    if (panel === "admin") {
      setAdminVisible(true);
      return;
    }
    if (panel === "profile") {
      setProfileVisible(true);
      return;
    }
    if (panel === activePanel && sidebarVisible) {
      setSidebarVisible(false);
    } else {
      setActivePanel(panel);
      setSidebarVisible(true);
    }
  };

  const handleSidebarResize = (delta: number) => {
    setSidebarWidth((w) =>
      Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, w + delta)),
    );
  };

  const handleMobileNav = (tab: MobileNavTab) => {
    // Close previously open panels
    setMobileSidebarOpen(false);
    setMobileGitHubOpen(false);
    setMobilePanelDrawerOpen(false);

    if (tab === "explorer") {
      setMobileSidebarPanel("explorer");
      setMobileSidebarOpen(true);
      setMobileActiveTab("explorer");
    } else if (tab === "github") {
      setMobileGitHubOpen(true);
      setMobileActiveTab("github");
    } else if (tab === "settings") {
      setShowSettings(true);
      setMobileActiveTab("settings");
    } else if (tab === "ai") {
      setAiPanelVisible((v) => !v);
      setMobileActiveTab(tab);
    } else if (tab === "terminal") {
      setBottomPanelVisible(true);
      setTimeout(() => bottomPanelRef.current?.setTab("terminal"), 50);
      setMobileActiveTab("terminal");
    } else if (MOBILE_SIDEBAR_PANEL_TABS[tab]) {
      const panelTab = MOBILE_SIDEBAR_PANEL_TABS[tab];
      setMobilePanelDrawerTab(panelTab);
      setMobilePanelDrawerOpen(true);
      setMobileActiveTab(tab);
    }
  };

  const cmdOpenAI = () => setAiPanelVisible((v) => !v);
  const cmdOpenAdmin = () => setAdminVisible(true);
  const cmdOpenGit = () => {
    setActivePanel("git");
    setSidebarVisible(true);
  };
  const cmdOpenGitHub = () => {
    setActivePanel("github");
    setSidebarVisible(true);
  };
  const cmdOpenExtensions = () => {
    setActivePanel("extensions");
    setSidebarVisible(true);
  };
  const cmdOpenSnippets = () => {
    setActivePanel("snippets");
    setSidebarVisible(true);
  };
  const cmdOpenPreview = () => {
    setActivePanel("preview");
    setSidebarVisible(true);
  };
  const cmdOpenExplorer = () => {
    setActivePanel("explorer");
    setSidebarVisible(true);
  };
  const cmdOpenSearch = () => {
    setActivePanel("search");
    setSidebarVisible(true);
  };
  const cmdOpenCommandPalette = () => setShowCommandPalette(true);
  const cmdOpenProfile = () => setProfileVisible(true);
  const cmdNewTerminal = () => {
    setBottomPanelVisible(true);
    setTimeout(() => bottomPanelRef.current?.setTab("terminal"), 50);
  };
  const cmdOpenCloud = () => {
    setActivePanel("cloud");
    setSidebarVisible(true);
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div
        className="flex flex-col overflow-hidden"
        style={{
          height: "100dvh",
          width: "100vw",
          background: "var(--bg-editor)",
        }}
      >
        <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            <SplitEditor />
            <BottomPanel
              ref={bottomPanelRef}
              visible={bottomPanelVisible}
              height={bottomPanelHeight}
              onHeightChange={setBottomPanelHeight}
              onToggle={() => setBottomPanelVisible(false)}
              isMobile
            />
          </div>
          {aiPanelVisible && (
            <AIAssistantPanel
              onClose={() => setAiPanelVisible(false)}
              width={Math.min(300, window.innerWidth * 0.8)}
            />
          )}
        </div>
        <MobileBottomNav
          activeTab={mobileActiveTab}
          onNavChange={handleMobileNav}
        />
        <StatusBar
          isMobile
          onOpenLogin={() => setLoginVisible(true)}
          onOpenProfile={cmdOpenProfile}
          onOpenCloud={cmdOpenCloud}
          cloudSyncStatus={cloudSyncStatus}
        />

        {/* GitHub drawer overlay */}
        {mobileGitHubOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => {
              setMobileGitHubOpen(false);
              setMobileActiveTab(undefined);
            }}
            onKeyDown={(e) => e.key === "Escape" && setMobileGitHubOpen(false)}
          >
            <div
              className="absolute top-0 right-0 h-full overflow-y-auto"
              style={{
                width: Math.min(320, window.innerWidth * 0.85),
                background: "var(--bg-sidebar)",
                borderLeft: "1px solid var(--border)",
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]"
                style={{ background: "var(--bg-activity)" }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  GitHub
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileGitHubOpen(false);
                    setMobileActiveTab(undefined);
                  }}
                  className="p-1 rounded hover:bg-[var(--hover-item)] transition-colors"
                  data-ocid="github.mobile.close_button"
                >
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <GitHubPanel />
            </div>
          </div>
        )}

        {/* Phase 9 panel drawer (Collab / Social / CI/CD / VCS) */}
        {mobilePanelDrawerOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => {
              setMobilePanelDrawerOpen(false);
              setMobileActiveTab(undefined);
            }}
            onKeyDown={(e) =>
              e.key === "Escape" && setMobilePanelDrawerOpen(false)
            }
          >
            <div
              className="absolute top-0 right-0 h-full overflow-y-auto"
              style={{
                width: Math.min(320, window.innerWidth * 0.9),
                background: "var(--bg-sidebar)",
                borderLeft: "1px solid var(--border)",
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
                style={{ background: "var(--bg-activity)" }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {mobilePanelDrawerTab === "collab" && "Collaboration"}
                  {mobilePanelDrawerTab === "social" && "Social Coding"}
                  {mobilePanelDrawerTab === "cicd" && "CI/CD Pipeline"}
                  {mobilePanelDrawerTab === "vcs" && "Version Control"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobilePanelDrawerOpen(false);
                    setMobileActiveTab(undefined);
                  }}
                  className="p-1 rounded hover:bg-[var(--hover-item)] transition-colors"
                  data-ocid="mobile.panel.close_button"
                >
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="h-full overflow-y-auto">
                <Sidebar
                  activePanel={mobilePanelDrawerTab}
                  width={Math.min(320, window.innerWidth * 0.9)}
                />
              </div>
            </div>
          </div>
        )}

        <MobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => {
            setMobileSidebarOpen(false);
            setMobileActiveTab(undefined);
          }}
          activePanel={mobileSidebarPanel}
        />
        <MobileMenuDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onToggleSidebar={() => setBottomPanelVisible((v) => !v)}
          onToggleBottomPanel={() => setBottomPanelVisible((v) => !v)}
        />
        <CommandPalette
          onOpenAI={cmdOpenAI}
          onOpenAdmin={cmdOpenAdmin}
          onOpenGit={cmdOpenGit}
          onOpenExtensions={cmdOpenExtensions}
          onOpenSnippets={cmdOpenSnippets}
          onOpenPreview={cmdOpenPreview}
        />
        <QuickOpen />
        <SettingsPanel />
        <NotificationToast />
        <LoginDialog
          isOpen={loginVisible}
          onClose={() => setLoginVisible(false)}
        />
        {adminVisible && (
          <AdminDashboard onClose={() => setAdminVisible(false)} />
        )}
        {profileVisible && (
          <UserProfilePanel onClose={() => setProfileVisible(false)} />
        )}
        <FileTemplatesDialog
          isOpen={fileTemplatesVisible}
          onClose={() => setFileTemplatesVisible(false)}
        />
        <ClipboardHistoryPanel
          isOpen={showClipboardHistory}
          onClose={() => setShowClipboardHistory(false)}
        />
        <LiveTemplatesManager
          isOpen={showLiveTemplates}
          onClose={() => setShowLiveTemplates(false)}
        />
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div
      className={`flex flex-col overflow-hidden ${focusMode ? "focus-mode" : ""}`}
      style={{
        height: "100vh",
        width: "100vw",
        background: "var(--bg-editor)",
      }}
    >
      {/* Presentation Mode */}
      {isPresentationMode ? (
        <div
          className="flex flex-1 overflow-hidden relative"
          style={{ height: "100vh" }}
        >
          <SplitEditor />
          <button
            type="button"
            onClick={() => setIsPresentationMode(false)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl z-50 transition-all hover:scale-105"
            style={{
              background: "rgba(0,122,204,0.9)",
              color: "#fff",
              border: "1px solid rgba(97,218,251,0.4)",
              backdropFilter: "blur(8px)",
            }}
            data-ocid="presentation.exit.button"
          >
            Exit Presentation Mode (Alt+F7 or Esc)
          </button>
          <div
            className="fixed top-4 right-4 px-2 py-1 rounded text-[10px] font-bold z-50"
            style={{ background: "rgba(0,122,204,0.8)", color: "#fff" }}
          >
            PRESENTATION
          </div>
        </div>
      ) : zenMode ? (
        /* Zen Mode: show only editor */
        <div
          className="flex flex-1 overflow-hidden relative"
          style={{ height: "100vh" }}
        >
          <SplitEditor />
          <button
            type="button"
            onClick={() => setZenMode(false)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-medium shadow-2xl z-50 transition-all hover:scale-105"
            style={{
              background: "rgba(0,122,204,0.85)",
              color: "#fff",
              border: "1px solid rgba(97,218,251,0.3)",
              backdropFilter: "blur(8px)",
            }}
            data-ocid="zen_mode.exit.button"
          >
            Exit Zen Mode (Esc or Ctrl+K Z)
          </button>
        </div>
      ) : (
        <>
          <MenuBar
            sidebarVisible={sidebarVisible}
            bottomPanelVisible={bottomPanelVisible}
            onToggleSidebar={() => setSidebarVisible((v) => !v)}
            onToggleBottomPanel={() => setBottomPanelVisible((v) => !v)}
            onOpenCommandPalette={cmdOpenCommandPalette}
            onOpenSearch={cmdOpenSearch}
            onOpenExplorer={cmdOpenExplorer}
            onOpenExtensions={cmdOpenExtensions}
            onOpenGit={cmdOpenGit}
            onOpenAI={cmdOpenAI}
            onOpenProfile={cmdOpenProfile}
            onNewTerminal={cmdNewTerminal}
            onToggleFocusMode={() => setFocusMode((v) => !v)}
            onOpenShortcutOverlay={() => setShortcutOverlayVisible(true)}
            onToggleZenMode={() => setZenMode((v) => !v)}
            onOpenFileTemplates={() => setFileTemplatesVisible(true)}
            zenMode={zenMode}
          />
          <div className="flex flex-1 overflow-hidden">
            <ActivityBar
              activePanel={activePanel}
              onPanelChange={handleActivityChange}
            />
            {sidebarVisible && (
              <>
                <Sidebar
                  activePanel={activePanel}
                  width={sidebarWidth}
                  onOpenGitHub={cmdOpenGitHub}
                />
                <ResizeHandle
                  direction="horizontal"
                  onResize={handleSidebarResize}
                />
              </>
            )}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-1 overflow-hidden">
                <SplitEditor />
              </div>
              <BottomPanel
                ref={bottomPanelRef}
                visible={bottomPanelVisible}
                height={bottomPanelHeight}
                onHeightChange={setBottomPanelHeight}
                onToggle={() => setBottomPanelVisible(false)}
              />
            </div>
            {aiPanelVisible && (
              <AIAssistantPanel
                onClose={() => setAiPanelVisible(false)}
                width={320}
              />
            )}
          </div>
          <StatusBar
            onOpenGit={cmdOpenGit}
            onOpenLogin={() => setLoginVisible(true)}
            onOpenProfile={cmdOpenProfile}
            onOpenCloud={cmdOpenCloud}
            cloudSyncStatus={cloudSyncStatus}
            isPresentationMode={isPresentationMode}
            onTogglePresentationMode={() => setIsPresentationMode((v) => !v)}
            onOpenLiveTemplates={() => setShowLiveTemplates(true)}
          />
        </>
      )}

      <CommandPalette
        onOpenAI={cmdOpenAI}
        onOpenAdmin={cmdOpenAdmin}
        onOpenGit={cmdOpenGit}
        onOpenExtensions={cmdOpenExtensions}
        onOpenSnippets={cmdOpenSnippets}
        onOpenPreview={cmdOpenPreview}
      />
      <QuickOpen />
      <SettingsPanel />
      <NotificationToast />
      <LoginDialog
        isOpen={loginVisible}
        onClose={() => setLoginVisible(false)}
      />
      {adminVisible && (
        <AdminDashboard onClose={() => setAdminVisible(false)} />
      )}
      {profileVisible && (
        <UserProfilePanel onClose={() => setProfileVisible(false)} />
      )}
      <FileTemplatesDialog
        isOpen={fileTemplatesVisible}
        onClose={() => setFileTemplatesVisible(false)}
      />
      <ClipboardHistoryPanel
        isOpen={showClipboardHistory}
        onClose={() => setShowClipboardHistory(false)}
      />
      <LiveTemplatesManager
        isOpen={showLiveTemplates}
        onClose={() => setShowLiveTemplates(false)}
      />

      {/* Keyboard Shortcut Overlay */}
      {shortcutOverlayVisible && (
        <dialog
          open
          className="fixed inset-0 z-[9999] flex items-center justify-center w-full h-full max-w-none max-h-none p-0 m-0 border-0"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setShortcutOverlayVisible(false)}
          onKeyDown={(e) =>
            e.key === "Escape" && setShortcutOverlayVisible(false)
          }
          aria-label="Keyboard Shortcuts"
          data-ocid="shortcuts.modal"
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(30,30,35,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              maxWidth: 700,
              width: "90vw",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div>
                <h2
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Keyboard Shortcuts
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  All CodeVeda keyboard shortcuts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShortcutOverlayVisible(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                data-ocid="shortcuts.close_button"
                aria-label="Close keyboard shortcuts"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-1">
              {ALL_SHORTCUTS.map(({ key, action }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {action}
                  </span>
                  <kbd
                    className="text-[10px] rounded px-1.5 py-0.5 border flex-shrink-0 ml-4"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "var(--text-primary)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <div
              className="px-6 py-3 border-t text-center"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Press{" "}
                <kbd
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 3,
                    padding: "1px 5px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Esc
                </kbd>{" "}
                or click outside to close
              </p>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <IDELayout />
    </ThemeProvider>
  );
}

export default App;
