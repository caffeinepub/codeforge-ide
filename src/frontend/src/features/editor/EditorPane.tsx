import type * as Monaco from "monaco-editor";
import type React from "react";
import { useCallback, useRef } from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import { useEditorStore } from "../../stores/editorStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useThemeStore } from "../../stores/themeStore";
import { getMonacoTheme } from "../theme/themeConfig";
import { Breadcrumbs } from "./Breadcrumbs";
import { EditorTabs } from "./EditorTabs";
import { MonacoEditorCDN } from "./MonacoEditorCDN";
import { WelcomeTab } from "./WelcomeTab";

interface EditorPaneProps {
  isPrimary?: boolean;
}

const TOUCH_KEYS: { label: string; text: string }[] = [
  { label: "\u21E4 Tab", text: "\t" },
  { label: "{ }", text: "{}" },
  { label: "[ ]", text: "[]" },
  { label: "( )", text: "()" },
  { label: '" "', text: '""' },
  { label: "' '", text: "''" },
  { label: ";", text: ";" },
  { label: "Del", text: "__DEL__" },
  { label: "Enter", text: "\n" },
];

export const EditorPane: React.FC<EditorPaneProps> = ({ isPrimary = true }) => {
  const {
    openFiles,
    activeFileId,
    secondPaneActiveFileId,
    updateFileContent,
    setCursorPosition,
    setActiveFile,
    setSecondPaneActiveFile,
  } = useEditorStore();

  const { settings, updateSettings } = useSettingsStore();
  const { theme } = useThemeStore();
  const isMobile = useIsMobile();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const effectiveActiveId = isPrimary ? activeFileId : secondPaneActiveFileId;
  const activeFile = openFiles.find((f) => f.id === effectiveActiveId);

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      editor.onDidChangeCursorPosition((e) => {
        if (effectiveActiveId) {
          setCursorPosition(effectiveActiveId, {
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          });
        }
      });
    },
    [effectiveActiveId, setCursorPosition],
  );

  const handleTabSelect = (id: string) => {
    if (isPrimary) setActiveFile(id);
    else setSecondPaneActiveFile(id);
  };

  const monacoTheme = getMonacoTheme(theme);

  const toolbarBtn = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: 4,
    cursor: "pointer",
    border: "none",
    background: active ? "rgba(0,122,204,0.25)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-muted)",
    boxShadow: active ? "0 0 6px rgba(0,122,204,0.4)" : "none",
    transition: "all 0.15s",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  });

  const editorOptions: Record<string, unknown> = {
    fontSize: isMobile ? Math.max(14, settings.fontSize) : settings.fontSize,
    fontFamily: settings.fontFamily,
    fontLigatures: true,
    minimap: { enabled: isMobile ? false : settings.minimap },
    wordWrap: isMobile || settings.wordWrap ? "on" : "off",
    lineNumbers: settings.lineNumbers ? "on" : "off",
    tabSize: settings.tabSize,
    automaticLayout: true,
    bracketPairColorization: { enabled: settings.bracketPairColorization },
    stickyScroll: { enabled: settings.stickyScroll },
    folding: true,
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    cursorBlinking: "blink",
    smoothScrolling: true,
    mouseWheelZoom: !isMobile,
    contextmenu: true,
    padding: { top: 8, bottom: 8 },
    suggest: { showKeywords: true },
    quickSuggestions: !isMobile,
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
  };

  const handleTouchKey = (key: { label: string; text: string }) => {
    const editor = editorRef.current;
    if (!editor) return;
    // biome-ignore lint/suspicious/noExplicitAny: Monaco trigger API not in type stubs
    const e = editor as any;
    if (key.text === "__DEL__") {
      e.trigger("keyboard", "deleteLeft", null);
    } else {
      e.trigger("keyboard", "type", { text: key.text });
    }
    editor.focus();
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--bg-editor)" }}
    >
      <EditorTabs
        isPrimary={isPrimary}
        activeFileId={effectiveActiveId}
        onTabSelect={handleTabSelect}
      />

      {activeFile && <Breadcrumbs />}

      {activeFile && !isMobile && (
        <div
          className="flex items-center gap-1 px-2 border-b border-[var(--border)] flex-shrink-0"
          style={{ height: 28, background: "var(--bg-editor)" }}
        >
          <button
            type="button"
            style={toolbarBtn(settings.wordWrap)}
            onClick={() => updateSettings({ wordWrap: !settings.wordWrap })}
            title={`Word Wrap (${settings.wordWrap ? "On" : "Off"})`}
          >
            W
          </button>
          <button
            type="button"
            style={toolbarBtn(settings.minimap)}
            onClick={() => updateSettings({ minimap: !settings.minimap })}
            title={`Minimap (${settings.minimap ? "On" : "Off"})`}
          >
            M
          </button>
          <button
            type="button"
            style={toolbarBtn(settings.stickyScroll)}
            onClick={() =>
              updateSettings({ stickyScroll: !settings.stickyScroll })
            }
            title={`Sticky Scroll (${settings.stickyScroll ? "On" : "Off"})`}
          >
            S
          </button>
          <button
            type="button"
            style={toolbarBtn(settings.bracketPairColorization)}
            onClick={() =>
              updateSettings({
                bracketPairColorization: !settings.bracketPairColorization,
              })
            }
            title="Bracket Colorization"
          >
            {"{}"}
          </button>
          <div
            className="w-px h-4 mx-1"
            style={{ background: "var(--border)" }}
          />
          <button
            type="button"
            style={{ ...toolbarBtn(false), width: 18, height: 18, fontSize: 9 }}
            onClick={() =>
              updateSettings({ fontSize: Math.max(10, settings.fontSize - 1) })
            }
            title="Decrease font size"
          >
            -
          </button>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              minWidth: 22,
              textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {settings.fontSize}
          </span>
          <button
            type="button"
            style={{ ...toolbarBtn(false), width: 18, height: 18, fontSize: 9 }}
            onClick={() =>
              updateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })
            }
            title="Increase font size"
          >
            +
          </button>
        </div>
      )}

      {!activeFile ? (
        <WelcomeTab />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MonacoEditorCDN
              key={activeFile.id}
              height="100%"
              theme={monacoTheme}
              language={activeFile.language}
              value={activeFile.content}
              onChange={(val) => updateFileContent(activeFile.id, val ?? "")}
              onMount={handleEditorMount}
              options={editorOptions}
            />
          </div>
          {/* Mobile touch toolbar */}
          {isMobile && (
            <div
              className="flex-shrink-0 flex items-center overflow-x-auto border-t border-[var(--border)]"
              style={{
                height: 44,
                background: "var(--bg-activity)",
                gap: 2,
                padding: "0 4px",
              }}
              data-ocid="editor.mobile.toolbar.panel"
            >
              {TOUCH_KEYS.map((key) => (
                <button
                  key={key.label}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleTouchKey(key);
                  }}
                  className="flex-shrink-0 flex items-center justify-center rounded transition-colors active:opacity-60"
                  style={{
                    minWidth: 44,
                    height: 32,
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                  data-ocid={`editor.touch.${key.label.toLowerCase().replace(/[^a-z0-9]/g, "")}.button`}
                >
                  {key.label}
                </button>
              ))}
              {/* Arrow keys */}
              {(["\u2190", "\u2192"] as const).map((arrow) => (
                <button
                  key={arrow}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    const editor = editorRef.current;
                    if (!editor) return;
                    const action =
                      arrow === "\u2190" ? "cursorLeft" : "cursorRight";
                    // biome-ignore lint/suspicious/noExplicitAny: Monaco trigger not in stubs
                    (editor as any).trigger("keyboard", action, null);
                    editor.focus();
                  }}
                  className="flex-shrink-0 flex items-center justify-center rounded transition-colors active:opacity-60"
                  style={{
                    minWidth: 40,
                    height: 32,
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  data-ocid="editor.touch.arrow.button"
                >
                  {arrow}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
