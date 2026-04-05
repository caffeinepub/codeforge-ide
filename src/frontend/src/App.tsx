import { Bot } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ActivityBar } from "./components/ActivityBar";
import { BottomPanel } from "./components/BottomPanel";
import { CommandPalette } from "./components/CommandPalette";
import { MenuBar } from "./components/MenuBar";
import { NotificationToast } from "./components/NotificationToast";
import { QuickOpen } from "./components/QuickOpen";
import { ResizeHandle } from "./components/ResizeHandle";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { SplitEditor } from "./features/editor/SplitEditor";
import { useEditorShortcuts } from "./features/editor/useEditorShortcuts";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { useEditorStore } from "./stores/editorStore";

type ActivityTab = "explorer" | "search" | "extensions" | "settings" | "ai";

const MIN_SIDEBAR_WIDTH = 150;
const MAX_SIDEBAR_WIDTH = 520;
const DEFAULT_SIDEBAR_WIDTH = 280;
const DEFAULT_BOTTOM_HEIGHT = 200;

function IDELayout() {
  useEditorShortcuts();

  const { setShowSettings } = useEditorStore();

  const [activePanel, setActivePanel] = useState<ActivityTab>("explorer");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(
    DEFAULT_BOTTOM_HEIGHT,
  );
  const [aiPanelVisible, setAiPanelVisible] = useState(false);

  // Ctrl+B -> toggle sidebar
  useEffect(() => {
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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleActivityChange = (panel: ActivityTab) => {
    if (panel === "settings") {
      setShowSettings(true);
      return;
    }
    if (panel === "ai") {
      setAiPanelVisible((v) => !v);
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

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100vh",
        width: "100vw",
        background: "var(--bg-editor)",
      }}
    >
      {/* Menu Bar */}
      <MenuBar
        sidebarVisible={sidebarVisible}
        bottomPanelVisible={bottomPanelVisible}
        onToggleSidebar={() => setSidebarVisible((v) => !v)}
        onToggleBottomPanel={() => setBottomPanelVisible((v) => !v)}
      />

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar
          activePanel={activePanel}
          onPanelChange={handleActivityChange}
        />

        {/* Sidebar */}
        {sidebarVisible && (
          <>
            <Sidebar
              activePanel={activePanel === "search" ? "search" : "explorer"}
              width={sidebarWidth}
            />
            <ResizeHandle
              direction="horizontal"
              onResize={handleSidebarResize}
            />
          </>
        )}

        {/* Editor area + bottom panel */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Split Editor */}
          <div className="flex flex-1 overflow-hidden">
            <SplitEditor />
          </div>

          {/* Bottom Panel */}
          <BottomPanel
            visible={bottomPanelVisible}
            height={bottomPanelHeight}
            onHeightChange={setBottomPanelHeight}
            onToggle={() => setBottomPanelVisible(false)}
          />
        </div>

        {/* AI Assistant Panel (Phase 2 stub) */}
        {aiPanelVisible && (
          <div
            className="flex flex-col border-l border-[var(--border)] overflow-hidden flex-shrink-0"
            style={{ width: 300, background: "var(--bg-sidebar)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <Bot size={14} style={{ color: "var(--accent)" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                AI Assistant
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              {/* TODO Phase 2: AI chat integration */}
              <div>
                <div className="text-2xl mb-3">🤖</div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Coming in Phase 2
                </p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  AI-powered code completion, chat, and refactoring tools will
                  be available here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Overlays */}
      <CommandPalette />
      <QuickOpen />
      <SettingsPanel />
      <NotificationToast />
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
