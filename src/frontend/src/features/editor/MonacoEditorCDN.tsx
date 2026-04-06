import type * as MonacoNS from "monaco-editor";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface MonacoEditorCDNProps {
  height?: string;
  theme?: string;
  language?: string;
  value?: string;
  onChange?: (val: string | undefined) => void;
  onMount?: (editor: MonacoNS.editor.IStandaloneCodeEditor) => void;
  options?: Record<string, unknown>;
}

// Load Monaco from CDN once
let monacoLoadPromise: Promise<any> | null = null;

function loadMonaco(): Promise<any> {
  if (monacoLoadPromise) return monacoLoadPromise;

  monacoLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).monaco) {
      resolve((window as any).monaco);
      return;
    }

    // Set up require config for AMD loader
    (window as any).require = {
      paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
    };

    // Load AMD loader
    const loaderScript = document.createElement("script");
    loaderScript.src =
      "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js";
    loaderScript.onload = () => {
      (window as any).require(["vs/editor/editor.main"], (monaco: any) => {
        resolve(monaco);
      });
    };
    loaderScript.onerror = reject;
    document.head.appendChild(loaderScript);
  });

  return monacoLoadPromise;
}

export const MonacoEditorCDN: React.FC<MonacoEditorCDNProps> = ({
  height = "100%",
  theme,
  language,
  value,
  onChange,
  onMount,
  options = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store initial props in refs for use in the mount effect
  const initialValueRef = useRef(value);
  const initialLanguageRef = useRef(language);
  const initialThemeRef = useRef(theme);
  const initialOptionsRef = useRef(options);

  // Store callbacks in refs to avoid recreating the editor
  const onChangeRef = useRef(onChange);
  const onMountRef = useRef(onMount);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onMountRef.current = onMount;
  }, [onMount]);

  // Initialize editor once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once; prop changes handled by separate effects
  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    loadMonaco()
      .then((monaco) => {
        if (disposed || !containerRef.current) return;

        const editor = monaco.editor.create(containerRef.current, {
          value: initialValueRef.current ?? "",
          language: initialLanguageRef.current ?? "plaintext",
          theme: initialThemeRef.current ?? "vs-dark",
          automaticLayout: true,
          ...initialOptionsRef.current,
        });

        editorRef.current = editor;
        setLoading(false);

        editor.onDidChangeModelContent(() => {
          onChangeRef.current?.(editor.getValue());
        });

        onMountRef.current?.(editor as MonacoNS.editor.IStandaloneCodeEditor);
      })
      .catch((err) => {
        if (!disposed) {
          setError("Failed to load Monaco editor");
          setLoading(false);
          console.error("Monaco load error:", err);
        }
      });

    return () => {
      disposed = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Update value when it changes externally
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.getValue();
    if (current !== value) {
      // Preserve cursor position
      const position = editor.getPosition?.();
      editor.setValue(value ?? "");
      if (position) editor.setPosition?.(position);
    }
  }, [value]);

  // Update language
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;
    const model = editor.getModel?.();
    if (model && language) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  // Update theme
  useEffect(() => {
    const monaco = (window as any).monaco;
    if (!monaco || !theme) return;
    monaco.editor.setTheme(theme);
  }, [theme]);

  // Update options
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !options) return;
    editor.updateOptions(options);
  }, [options]);

  return (
    <div style={{ height, position: "relative", overflow: "hidden" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: 12,
          }}
        >
          Loading editor...
        </div>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e06c75",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}
      <div
        ref={containerRef}
        style={{ height: "100%", display: loading || error ? "none" : "block" }}
      />
    </div>
  );
};
