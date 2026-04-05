import MonacoEditor from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import type React from "react";
import { useCallback, useRef } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useThemeStore } from "../../stores/themeStore";
import { getMonacoTheme } from "../theme/themeConfig";
import { Breadcrumbs } from "./Breadcrumbs";
import { EditorTabs } from "./EditorTabs";
import { WelcomeTab } from "./WelcomeTab";

interface EditorPaneProps {
  isPrimary?: boolean;
}

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

  const { settings } = useSettingsStore();
  const { theme } = useThemeStore();
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

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--bg-editor)" }}
    >
      {/* Tab Bar */}
      <EditorTabs
        isPrimary={isPrimary}
        activeFileId={effectiveActiveId}
        onTabSelect={handleTabSelect}
      />

      {/* Breadcrumbs */}
      {activeFile && <Breadcrumbs />}

      {/* Editor area */}
      {!activeFile ? (
        <WelcomeTab />
      ) : (
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            key={activeFile.id}
            height="100%"
            theme={getMonacoTheme(theme)}
            language={activeFile.language}
            value={activeFile.content}
            onChange={(val) => updateFileContent(activeFile.id, val ?? "")}
            onMount={handleEditorMount}
            options={{
              fontSize: settings.fontSize,
              fontFamily: settings.fontFamily,
              fontLigatures: true,
              minimap: { enabled: settings.minimap },
              wordWrap: settings.wordWrap ? "on" : "off",
              lineNumbers: settings.lineNumbers ? "on" : "off",
              tabSize: settings.tabSize,
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              folding: true,
              scrollBeyondLastLine: false,
              renderLineHighlight: "all",
              cursorBlinking: "blink",
              smoothScrolling: true,
              mouseWheelZoom: true,
              contextmenu: true,
              padding: { top: 8, bottom: 8 },
              suggest: { showKeywords: true },
              quickSuggestions: true,
              autoIndent: "full",
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      )}
    </div>
  );
};
