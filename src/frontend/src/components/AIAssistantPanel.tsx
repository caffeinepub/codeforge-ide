import { Bot, Send, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAIStore } from "../stores/aiStore";
import { useEditorStore } from "../stores/editorStore";

function generateAIResponse(
  message: string,
  activeFile: string | null,
): string {
  const lower = message.toLowerCase();

  if (lower.includes("explain")) {
    return `I'll explain this code for you.

The file **${activeFile || "current file"}** uses a component-based architecture. Here's what's happening:

\`\`\`typescript
// The main logic handles state transitions
// and event-driven updates
\`\`\`

This pattern ensures **separation of concerns** — the UI logic stays clean while data flows unidirectionally. It uses the React state pattern where:
1. State is initialized once
2. Actions trigger state updates  
3. Re-renders reflect the new state

Let me know if you'd like a deeper dive into any part!`;
  }

  if (
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("error")
  ) {
    return `I spotted a few potential issues to investigate.

**Common fixes for this type of code:**

\`\`\`typescript
// Before (likely issue)
const value = data.item.name; // may throw if item is undefined

// After (safe access)
const value = data?.item?.name ?? 'default';
\`\`\`

**Also check:**
- Missing \`await\` on async calls
- Unhandled Promise rejections  
- Type mismatches (\`string | undefined\` assigned to \`string\`)

Share the specific error message for a more precise fix!`;
  }

  if (
    lower.includes("generate") ||
    lower.includes("create") ||
    lower.includes("write")
  ) {
    return `Here's a generated snippet for you:

\`\`\`typescript
import { useState, useCallback } from 'react';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const result = await asyncFn();
      setData(result);
      options.onSuccess?.(result);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, loading, error, execute };
}
\`\`\`

Copy this into your project and adapt to your use case!`;
  }

  if (lower.includes("refactor")) {
    return `Here are refactoring suggestions for cleaner code:

**1. Extract repeated logic into custom hooks**
\`\`\`typescript
// Instead of duplicating fetch logic across components
const { data, loading } = useAsync(() => actor?.getData());
\`\`\`

**2. Use composition over deep prop drilling**
\`\`\`tsx
<Provider value={context}>
  <Consumer />
</Provider>
\`\`\`

**3. Memoize expensive computations**
\`\`\`typescript
const processed = useMemo(() => (
  data.map(transform).filter(validate)
), [data]);
\`\`\`

Want me to apply any of these patterns to your specific code?`;
  }

  if (lower.includes("typescript") || lower.includes("type")) {
    return `TypeScript tips for your codebase:

\`\`\`typescript
// Use discriminated unions for better type safety
type Result<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Utility types are your friend
type PartialUser = Partial<User>;
type ReadonlyConfig = Readonly<Config>;
type UserKeys = keyof User;
\`\`\`

**Enable strict mode** in tsconfig for maximum safety:
\`\`\`json
{ "compilerOptions": { "strict": true } }
\`\`\`

This catches \`null\` and \`undefined\` issues at compile time!`;
  }

  if (
    lower.includes("icp") ||
    lower.includes("motoko") ||
    lower.includes("canister")
  ) {
    return `ICP / Motoko assistance:

\`\`\`motoko
// Basic actor pattern in Motoko
actor MyCanister {
  stable var counter : Nat = 0;
  
  public func increment() : async Nat {
    counter += 1;
    counter
  };
  
  public query func get() : async Nat {
    counter
  };
}
\`\`\`

**Frontend call pattern:**
\`\`\`typescript
const { actor } = useActor();
const result = await actor?.increment();
\`\`\`

\u{1F4A1} Use **query** calls for reads (fast, no consensus), **update** calls for writes.`;
  }

  return `I'm your **CodeVeda AI Assistant**. I can help you with:

- \u{1F50D} **Explain** — "Explain this function"
- \u{1F41B} **Fix bugs** — "Fix the error in my code"
- \u2728 **Generate** — "Generate a React hook"
- \u{1F527} **Refactor** — "Refactor this component"
- \u{1F3D7}\uFE0F **TypeScript** — "TypeScript type for this data"
- \u26D3\uFE0F **ICP/Motoko** — "Write a Motoko actor"

Currently viewing: **${activeFile || "No file open"}**

What would you like to work on?`;
}

const QUICK_PROMPTS = [
  { label: "Explain", emoji: "\uD83D\uDD0D", prompt: "Explain this code" },
  {
    label: "Fix Bug",
    emoji: "\uD83D\uDC1B",
    prompt: "Fix the bug in this code",
  },
  { label: "Refactor", emoji: "\u2728", prompt: "Refactor this code" },
  {
    label: "Generate",
    emoji: "\u26A1",
    prompt: "Generate a TypeScript utility function",
  },
  { label: "ICP/Motoko", emoji: "\u26D3", prompt: "Write a Motoko canister" },
];

function renderMessage(content: string, onCopy: (text: string) => void) {
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
          <button
            type="button"
            onClick={() => onCopy(code)}
            style={{
              position: "absolute",
              top: 6,
              right: 8,
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

interface AIAssistantPanelProps {
  onClose: () => void;
  width?: number;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  width = 320,
}) => {
  const { messages, isTyping, addMessage, setTyping, clearMessages } =
    useAIStore();
  const { openFiles, activeFileId } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const [input, setInput] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesLength = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages or typing changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesLength, isTyping]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage({ role: "user", content: text });
    setInput("");
    setTyping(true);
    const fileName = activeFile?.name ?? null;
    setTimeout(
      () => {
        const response = generateAIResponse(text, fileName);
        addMessage({ role: "assistant", content: response });
        setTyping(false);
      },
      600 + Math.random() * 800,
    );
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
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
        className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-activity)" }}
      >
        <div className="flex items-center gap-2">
          <Bot size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            AI Assistant
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
              title="Clear chat"
              data-ocid="ai.delete_button"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
            data-ocid="ai.close_button"
          >
            <X size={12} />
          </button>
        </div>
      </div>

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
                className="max-w-[90%] rounded text-xs ai-message"
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
                {renderMessage(msg.content, handleCopyCode)}
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

      {/* Copy toast */}
      {copiedCode !== null && (
        <div
          className="mx-3 mb-1 px-2 py-1 rounded text-[10px] text-center"
          style={{
            background: "#22c55e22",
            color: "#22c55e",
            border: "1px solid #22c55e44",
          }}
        >
          Copied to clipboard!
        </div>
      )}

      {/* Quick action chips */}
      <div
        className="px-3 pt-2 flex gap-1.5 flex-wrap border-t border-[var(--border)]"
        style={{ background: "var(--bg-activity)" }}
      >
        {QUICK_PROMPTS.map((qp) => (
          <button
            type="button"
            key={qp.label}
            onClick={() => handleQuickPrompt(qp.prompt)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-colors hover:bg-[var(--hover-item)]"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            data-ocid={`ai.${qp.label.toLowerCase().replace(" ", "-")}.button`}
          >
            <span>{qp.emoji}</span>
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="p-3 flex-shrink-0"
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
