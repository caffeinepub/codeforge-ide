import {
  Bot,
  ChevronDown,
  ClipboardCopy,
  Download,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAIStore } from "../stores/aiStore";
import type { AIMessage } from "../stores/aiStore";
import { useEditorStore } from "../stores/editorStore";

// --- Response generator ---

function generateAIResponse(
  message: string,
  activeFile: string | null,
): string {
  const lower = message.toLowerCase();

  if (lower.includes("test") || lower.includes("unit test")) {
    const fname = activeFile ?? "myModule";
    return `Here's a Jest unit test template for **${fname}**:\n\n\`\`\`typescript\nimport { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n\ndescribe('${fname.replace(/\.[^.]+$/, "")}', () => {\n  it('renders without crashing', () => {\n    expect(true).toBe(true);\n  });\n\n  it('handles user interaction', () => {\n    expect(true).toBe(true);\n  });\n});\n\`\`\`\n\nRun tests with: \`npx jest --watchAll\``;
  }

  if (lower.includes("docs") || lower.includes("documentation")) {
    return `JSDoc comment template for **${activeFile ?? "your function"}**:\n\n\`\`\`typescript\n/**\n * Brief description of what this function does.\n *\n * @param {string} paramName - Description of the parameter\n * @param {number} [optionalParam=0] - Optional parameter\n * @returns {Promise<Result>} Description of the return value\n * @throws {Error} When validation fails\n *\n * @example\n * const result = await myFunction('value', 42);\n */\nexport async function myFunction(\n  paramName: string,\n  optionalParam = 0\n): Promise<Result> {\n  // implementation\n}\n\`\`\`\n\nGenerate docs automatically with TypeDoc: \`npx typedoc --out docs src/\``;
  }

  if (lower.includes("review") || lower.includes("code review")) {
    return `## Code Review — ${activeFile ?? "Current File"}\n\n**Summary:**\nThe code follows a reasonable structure. A few areas could benefit from improvement in error handling and type safety.\n\n**Issues:**\n1. Missing error boundary around async operations\n2. Untyped \`any\` usages reduce type safety\n3. No loading state for async calls\n4. Consider extracting repeated logic into a custom hook\n\n**Suggestions:**\n\`\`\`typescript\ntry {\n  const data = await fetchData();\n  setResult(data);\n} catch (error) {\n  setError(error instanceof Error ? error.message : 'Unknown error');\n} finally {\n  setLoading(false);\n}\n\`\`\`\n\n**Score: 7/10** — Good structure, needs better error handling.`;
  }

  if (lower.includes("architecture") || lower.includes("design")) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: contains backtick chars
    return `## React Architecture\n\n\`\`\`\nApp.tsx\n├── Context / Theme\n├── Router\n└── Layout\n    ├── Sidebar (panels)\n    ├── EditorPane (Monaco)\n    └── BottomPanel (terminal)\n\nState (Zustand stores):\n  editorStore  githubStore\n  aiStore      filesystemStore\n\`\`\`\n\n**Recommended patterns:**\n- **Zustand** for global state (avoid prop drilling)\n- **React Query** for async data fetching\n- **Compound components** for complex UI\n- **Custom hooks** for reusable logic`;
  }

  if (lower.includes("voice")) {
    return `Voice coding is coming soon! For now, type your prompt and I'll generate the code.\n\nIn the meantime, try these quick actions:\n- **Tab completion** with Ctrl+Space\n- **Quick prompts** using the chips below\n- **Command palette** with Ctrl+Shift+P`;
  }

  if (lower.includes("explain")) {
    return `I'll explain this code for you.\n\nThe file **${activeFile || "current file"}** uses a component-based architecture. Here's what's happening:\n\n\`\`\`typescript\n// The main logic handles state transitions\n// and event-driven updates\n\`\`\`\n\nThis pattern ensures **separation of concerns** — the UI logic stays clean while data flows unidirectionally.\n1. State is initialized once\n2. Actions trigger state updates\n3. Re-renders reflect the new state\n\nLet me know if you'd like a deeper dive into any part!`;
  }

  if (
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("error")
  ) {
    return `I spotted a few potential issues to investigate.\n\n**Common fixes:**\n\n\`\`\`typescript\n// Before (likely issue)\nconst value = data.item.name; // may throw if item is undefined\n\n// After (safe access)\nconst value = data?.item?.name ?? 'default';\n\`\`\`\n\n**Also check:**\n- Missing \`await\` on async calls\n- Unhandled Promise rejections\n- Type mismatches (\`string | undefined\` assigned to \`string\`)\n\nShare the specific error message for a more precise fix!`;
  }

  if (
    lower.includes("generate") ||
    lower.includes("create") ||
    lower.includes("write")
  ) {
    return `Here's a generated snippet for you:\n\n\`\`\`typescript\nimport { useState, useCallback } from 'react';\n\nexport function useAsync<T>(asyncFn: () => Promise<T>) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<Error | null>(null);\n\n  const execute = useCallback(async () => {\n    setLoading(true);\n    try {\n      const result = await asyncFn();\n      setData(result);\n    } catch (e) {\n      setError(e instanceof Error ? e : new Error(String(e)));\n    } finally {\n      setLoading(false);\n    }\n  }, [asyncFn]);\n\n  return { data, loading, error, execute };\n}\n\`\`\`\n\nCopy this into your project and adapt to your use case!`;
  }

  if (lower.includes("refactor")) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: contains backtick chars
    return `Here are refactoring suggestions for cleaner code:\n\n**1. Extract repeated logic into custom hooks**\n\`\`\`typescript\nconst { data, loading } = useAsync(() => actor?.getData());\n\`\`\`\n\n**2. Use composition over deep prop drilling**\n\`\`\`tsx\n<Provider value={context}>\n  <Consumer />\n</Provider>\n\`\`\`\n\n**3. Memoize expensive computations**\n\`\`\`typescript\nconst processed = useMemo(() => data.map(transform), [data]);\n\`\`\``;
  }

  if (lower.includes("typescript") || lower.includes("type")) {
    return `TypeScript tips:\n\n\`\`\`typescript\n// Discriminated unions\ntype Result<T> =\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: string };\n\n// Utility types\ntype PartialUser = Partial<User>;\ntype ReadonlyConfig = Readonly<Config>;\n\`\`\`\n\n**Enable strict mode** in tsconfig for maximum safety!`;
  }

  if (
    lower.includes("icp") ||
    lower.includes("motoko") ||
    lower.includes("canister")
  ) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: contains backtick chars
    return `ICP / Motoko assistance:\n\n\`\`\`motoko\nactor MyCanister {\n  stable var counter : Nat = 0;\n\n  public func increment() : async Nat {\n    counter += 1;\n    counter\n  };\n\n  public query func get() : async Nat {\n    counter\n  };\n}\n\`\`\`\n\n**Frontend call pattern:**\n\`\`\`typescript\nconst { actor } = useActor();\nconst result = await actor?.increment();\n\`\`\`\n\nUse **query** calls for reads (fast), **update** calls for writes.`;
  }

  return `I'm your **CodeVeda AI Assistant**. I can help you with:\n\n- Explain — "Explain this function"\n- Fix bugs — "Fix the error in my code"\n- Generate — "Generate a React hook"\n- Refactor — "Refactor this component"\n- Architecture — "Design this system"\n- Docs — "Generate documentation"\n- Tests — "Write unit tests"\n- Review — "Code review"\n- ICP/Motoko — "Write a Motoko actor"\n\nCurrently viewing: **${activeFile || "No file open"}**`;
}

// --- Conversation sessions ---

interface Session {
  id: string;
  name: string;
  messages: AIMessage[];
}

function createSession(index: number): Session {
  return {
    id: `session_${Date.now()}_${index}`,
    name: `Session ${index}`,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your **CodeVeda AI Assistant**. I can help you explain code, fix bugs, generate snippets, and more. What would you like to work on?",
        timestamp: Date.now(),
      },
    ],
  };
}

// --- Message renderer ---

function renderMessage(
  content: string,
  onCopy: (text: string) => void,
  onInsert?: (code: string) => void,
) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      return (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static rendering
          key={i}
          style={{ position: "relative", margin: "6px 0" }}
        >
          <pre
            style={{
              background: "var(--bg-activity)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "8px 12px",
              paddingTop: lang ? 28 : 8,
              overflowX: "auto",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-primary)",
            }}
          >
            {lang && (
              <span
                style={{
                  display: "block",
                  color: "var(--text-muted)",
                  fontSize: 9,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  position: "absolute",
                  top: 8,
                  left: 12,
                }}
              >
                {lang}
              </span>
            )}
            {code}
          </pre>
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              display: "flex",
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => onCopy(code)}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text-muted)",
                fontSize: 9,
                padding: "2px 6px",
                cursor: "pointer",
              }}
            >
              Copy
            </button>
            {onInsert && (
              <button
                type="button"
                onClick={() => onInsert(code)}
                style={{
                  background: "rgba(0,122,204,0.15)",
                  border: "1px solid rgba(0,122,204,0.3)",
                  borderRadius: 3,
                  color: "var(--accent)",
                  fontSize: 9,
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                Insert
              </button>
            )}
          </div>
        </div>
      );
    }
    const bolds = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: static rendering
        key={i}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {bolds.map((b, j) =>
          b.startsWith("**") && b.endsWith("**") ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: static rendering
            <strong key={j}>{b.slice(2, -2)}</strong>
          ) : (
            b
          ),
        )}
      </span>
    );
  });
}

// --- Quick prompts ---

const QUICK_PROMPTS = [
  { label: "Explain", prompt: "Explain this code" },
  { label: "Fix Bug", prompt: "Fix the bug in this code" },
  { label: "Refactor", prompt: "Refactor this code" },
  { label: "Tests", prompt: "Write unit tests for this" },
  { label: "Review", prompt: "Code review" },
  { label: "Docs", prompt: "Generate documentation" },
  { label: "ICP", prompt: "Write a Motoko canister" },
];

const MODELS = ["GPT-4o", "Claude 3.5", "CodeLlama"];

// --- Streaming text component ---

interface StreamingTextProps {
  content: string;
  onDone?: () => void;
}

const StreamingText: React.FC<StreamingTextProps> = ({ content, onDone }) => {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on content change
  useEffect(() => {
    idxRef.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (idxRef.current < content.length) {
        idxRef.current += 1;
        setDisplayed(content.slice(0, idxRef.current));
      } else {
        clearInterval(interval);
        onDone?.();
      }
    }, 15);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return <>{displayed}</>;
};

// --- Main component ---

interface AIAssistantPanelProps {
  onClose: () => void;
  width?: number;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  width = 320,
}) => {
  const { isTyping, setTyping } = useAIStore();
  const { openFiles, activeFileId, updateFileContent } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const [sessions, setSessions] = useState<Session[]>(() => [createSession(1)]);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => sessions[0].id,
  );
  const [input, setInput] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [pendingContent, setPendingContent] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [showModelMenu, setShowModelMenu] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];
  const messages = activeSession?.messages ?? [];

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping, streamingMsgId]);

  // Ctrl+Shift+A to focus input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const updateSessionMessages = (
    sessionId: string,
    updater: (msgs: AIMessage[]) => AIMessage[],
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages: updater(s.messages) } : s,
      ),
    );
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleInsert = (code: string) => {
    if (!activeFileId) return;
    const file = openFiles.find((f) => f.id === activeFileId);
    if (!file) return;
    updateFileContent(activeFileId, `${file.content}\n${code}`);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const displayContent = activeFile
      ? `[Context: ${activeFile.name}]\n${text}`
      : text;

    updateSessionMessages(activeSession.id, (msgs) => [
      ...msgs,
      {
        id: `msg_${Date.now().toString(36)}_u`,
        role: "user" as const,
        content: displayContent,
        timestamp: Date.now(),
      },
    ]);
    setInput("");
    setTyping(true);

    const fileName = activeFile?.name ?? null;
    setTimeout(
      () => {
        const response = generateAIResponse(text, fileName);
        const assistantMsgId = `msg_${Date.now().toString(36)}_a`;
        updateSessionMessages(activeSession.id, (msgs) => [
          ...msgs,
          {
            id: assistantMsgId,
            role: "assistant" as const,
            content: response,
            timestamp: Date.now(),
          },
        ]);
        setTyping(false);
        setStreamingMsgId(assistantMsgId);
        setPendingContent(response);
      },
      600 + Math.random() * 800,
    );
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleNewSession = () => {
    const newSession = createSession(sessions.length + 1);
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const handleClearSession = () => {
    const idx = sessions.findIndex((s) => s.id === activeSession.id);
    const fresh = createSession(idx + 1);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id ? { ...fresh, id: s.id, name: s.name } : s,
      ),
    );
  };

  const handleExport = () => {
    const md = messages
      .map((m) => `**${m.role === "user" ? "You" : "AI"}:**\n${m.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(md).then(() => {
      setCopiedCode("exported");
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  return (
    <motion.div
      className="flex flex-col border-l border-[var(--border)] flex-shrink-0 overflow-hidden"
      style={{ width, background: "var(--bg-sidebar)" }}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      data-ocid="ai.panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-activity)", minHeight: 40 }}
      >
        <div className="flex items-center gap-1.5">
          <Bot size={13} style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            AI Chat
          </span>
          {/* Model selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelMenu((v) => !v)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] transition-colors hover:bg-[var(--hover-item)]"
              style={{
                background: "rgba(0,122,204,0.1)",
                border: "1px solid rgba(0,122,204,0.25)",
                color: "var(--accent)",
              }}
              data-ocid="ai.select"
            >
              <Sparkles size={8} />
              {selectedModel}
              <ChevronDown size={8} />
            </button>
            {showModelMenu && (
              <div
                className="absolute top-full left-0 mt-1 rounded shadow-lg z-50 py-1"
                style={{
                  background: "var(--bg-activity)",
                  border: "1px solid var(--border)",
                  minWidth: 110,
                }}
              >
                {MODELS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedModel(m);
                      setShowModelMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[var(--hover-item)] transition-colors"
                    style={{
                      color:
                        m === selectedModel
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {m === selectedModel ? "✓ " : "  "}
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleExport}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
            title="Export conversation as Markdown"
            data-ocid="ai.save_button"
          >
            <Download size={11} />
          </button>
          <button
            type="button"
            onClick={handleClearSession}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
            title="Clear session"
            data-ocid="ai.delete_button"
          >
            <Trash2 size={11} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)] transition-colors"
            data-ocid="ai.close_button"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Session selector */}
      <div
        className="flex items-center gap-1 px-2 py-1 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-editor)", minHeight: 30 }}
      >
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSessionId(s.id)}
              className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] transition-colors"
              style={{
                background:
                  s.id === activeSessionId
                    ? "rgba(0,122,204,0.15)"
                    : "var(--bg-activity)",
                border:
                  s.id === activeSessionId
                    ? "1px solid rgba(0,122,204,0.3)"
                    : "1px solid var(--border)",
                color:
                  s.id === activeSessionId
                    ? "var(--accent)"
                    : "var(--text-muted)",
              }}
              data-ocid="ai.session.tab"
            >
              {s.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleNewSession}
          className="flex-shrink-0 p-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
          title="New session"
          data-ocid="ai.open_modal_button"
        >
          <Plus size={11} style={{ color: "var(--accent)" }} />
        </button>
      </div>

      {/* File context badge */}
      {activeFile && (
        <div
          className="px-3 py-1 flex-shrink-0"
          style={{ background: "var(--bg-editor)" }}
        >
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: "rgba(0,122,204,0.1)",
              border: "1px solid rgba(0,122,204,0.25)",
              color: "var(--accent)",
            }}
          >
            <span>📄</span>
            <span>{activeFile.name}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot
              size={32}
              style={{ color: "var(--text-muted)", margin: "0 auto 8px" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ask me anything about your code
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className="max-w-[92%] rounded text-xs ai-message"
                style={{
                  background:
                    msg.role === "user"
                      ? "var(--accent)"
                      : "var(--bg-activity)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  padding: "8px 10px",
                  lineHeight: 1.6,
                }}
              >
                {msg.id === streamingMsgId ? (
                  <StreamingText
                    content={pendingContent}
                    onDone={() => setStreamingMsgId(null)}
                  />
                ) : (
                  renderMessage(
                    msg.content,
                    handleCopyCode,
                    msg.role === "assistant" ? handleInsert : undefined,
                  )
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded px-3 py-2 text-xs"
              style={{
                background: "var(--bg-activity)",
                color: "var(--text-muted)",
              }}
            >
              <span className="inline-flex gap-1">
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0ms" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "150ms" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "300ms" }}
                >
                  .
                </span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Copy / Export toast */}
      {copiedCode !== null && (
        <div
          className="mx-3 mb-1 px-2 py-1 rounded text-[10px] text-center flex items-center justify-center gap-1"
          style={{
            background: "#22c55e22",
            color: "#22c55e",
            border: "1px solid #22c55e44",
          }}
          data-ocid="ai.success_state"
        >
          <ClipboardCopy size={10} />
          {copiedCode === "exported"
            ? "Conversation exported!"
            : "Copied to clipboard!"}
        </div>
      )}

      {/* Quick action chips */}
      <div
        className="px-2 pt-1.5 pb-1 flex gap-1 flex-wrap border-t border-[var(--border)]"
        style={{ background: "var(--bg-activity)" }}
      >
        {QUICK_PROMPTS.map((qp) => (
          <button
            type="button"
            key={qp.label}
            onClick={() => handleQuickPrompt(qp.prompt)}
            className="flex items-center px-1.5 py-0.5 rounded-full text-[9px] transition-colors hover:bg-[var(--hover-item)]"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            data-ocid={`ai.${qp.label.toLowerCase().replace(" ", "-")}.button`}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="p-2 flex-shrink-0"
        style={{ background: "var(--bg-activity)" }}
      >
        <div
          className="flex items-end gap-2 rounded border border-[var(--border)] overflow-hidden"
          style={{ background: "var(--bg-input)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI... (Enter to send)"
            rows={2}
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none resize-none p-2"
            style={{ fontFamily: "inherit", lineHeight: 1.5 }}
            data-ocid="ai.textarea"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 m-1 rounded transition-colors disabled:opacity-40"
            style={{ background: "var(--accent)", color: "#fff" }}
            data-ocid="ai.submit_button"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
