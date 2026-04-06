import {
  Check,
  Clipboard,
  Cloud,
  Loader2,
  Plus,
  Scissors,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  addCodeSnippet,
  deleteSnippet as deleteCloudSnippet,
  fetchAllSnippets,
} from "../services/backendService";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSnippetsStore } from "../stores/snippetsStore";

const LANG_COLORS: Record<string, string> = {
  tsx: "#61dafb",
  ts: "#3178c6",
  js: "#f7df1e",
  css: "#264de4",
  html: "#e34c26",
  mo: "#7b2db0",
};

export const SnippetsPanel: React.FC = () => {
  const { snippets, addSnippet, removeSnippet } = useSnippetsStore();
  const { addNotification } = useNotificationStore();
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLang, setNewLang] = useState("ts");
  const [newCode, setNewCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingCloud, setSavingCloud] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isLoadedRef = useRef(false);

  // Load snippets from backend on mount, merge (backend takes priority for same name)
  // biome-ignore lint/correctness/useExhaustiveDependencies: addSnippet is stable
  useEffect(() => {
    if (!actor || !isLoggedIn || isLoadedRef.current) return;
    isLoadedRef.current = true;
    fetchAllSnippets(actor).then((cloudSnippets) => {
      for (const cs of cloudSnippets) {
        const existing = snippets.find((s) => s.title === cs.name);
        if (!existing) {
          addSnippet({
            title: cs.name,
            language: cs.language,
            code: cs.code,
            isCustom: true,
          });
        }
      }
    });
  }, [actor, isLoggedIn]);

  const filtered = snippets.filter(
    (s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.language.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInsert = async (snippet: (typeof snippets)[0]) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
      addNotification({
        message: `"${snippet.title}" copied to clipboard`,
        type: "success",
      });
    } catch {
      addNotification({ message: "Clipboard access denied", type: "error" });
    }
  };

  const handleAddSnippet = async () => {
    if (!newTitle.trim() || !newCode.trim()) {
      addNotification({
        message: "Title and code are required",
        type: "warning",
      });
      return;
    }
    addSnippet({
      title: newTitle,
      language: newLang,
      code: newCode,
      isCustom: true,
    });

    // Sync to cloud
    if (actor && isLoggedIn) {
      setSavingCloud(true);
      const ok = await addCodeSnippet(actor, {
        name: newTitle,
        language: newLang,
        code: newCode,
        description: "",
        tags: [],
      });
      setSavingCloud(false);
      if (ok) {
        toast.success("☁ Snippet saved to cloud");
      }
    }

    setNewTitle("");
    setNewCode("");
    setShowAdd(false);
    addNotification({ message: "Snippet added", type: "success" });
  };

  const handleDelete = async (snippet: (typeof snippets)[0]) => {
    setDeletingId(snippet.id);
    removeSnippet(snippet.id);

    if (actor && isLoggedIn && snippet.isCustom) {
      await deleteCloudSnippet(actor, snippet.title);
    }
    setDeletingId(null);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
          >
            Snippets
          </span>
          {isLoggedIn && (
            <span
              className="flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded"
              style={{
                background: "rgba(0,122,204,0.1)",
                color: "var(--accent)",
                border: "1px solid rgba(0,122,204,0.2)",
              }}
            >
              <Cloud size={8} /> Cloud
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
          title="Add Custom Snippet"
          data-ocid="snippets.open_modal_button"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[var(--border)] flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded border border-[var(--border)] px-2 py-1"
          style={{ background: "var(--bg-input)" }}
        >
          <Search size={11} style={{ color: "var(--text-muted)" }} />
          <input
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
            placeholder="Filter snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="snippets.search_input"
          />
        </div>
      </div>

      {/* Add Snippet Form */}
      {showAdd && (
        <div
          className="p-3 border-b border-[var(--border)] flex-shrink-0 space-y-2"
          style={{ background: "var(--bg-activity)" }}
          data-ocid="snippets.modal"
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              New Snippet
            </span>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              data-ocid="snippets.close_button"
            >
              <X size={12} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          <input
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1.5 outline-none focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
            placeholder="Snippet title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            data-ocid="snippets.input"
          />
          <select
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1.5 outline-none"
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            data-ocid="snippets.select"
          >
            {["ts", "tsx", "js", "jsx", "css", "html", "mo"].map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <textarea
            rows={4}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1.5 outline-none resize-none focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
            placeholder="// Paste your snippet code here"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            data-ocid="snippets.textarea"
          />
          <button
            type="button"
            onClick={handleAddSnippet}
            disabled={savingCloud}
            className="w-full py-1.5 text-xs rounded font-medium flex items-center justify-center gap-1.5 disabled:opacity-70"
            style={{ background: "var(--accent)", color: "white" }}
            data-ocid="snippets.submit_button"
          >
            {savingCloud ? (
              <>
                <Loader2 size={11} className="animate-spin" /> Saving...
              </>
            ) : (
              "Add Snippet"
            )}
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center" data-ocid="snippets.empty_state">
            <Scissors
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No snippets found
            </p>
          </div>
        ) : (
          filtered.map((snippet, i) => (
            <div
              key={snippet.id}
              className="px-3 py-2.5 border-b border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors"
              data-ocid={`snippets.item.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {snippet.title}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: "var(--bg-activity)",
                      color: LANG_COLORS[snippet.language] ?? "var(--accent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {snippet.language}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {snippet.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDelete(snippet)}
                      disabled={deletingId === snippet.id}
                      className="p-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
                      title="Delete"
                      data-ocid={`snippets.delete_button.${i + 1}`}
                    >
                      {deletingId === snippet.id ? (
                        <Loader2
                          size={10}
                          className="animate-spin"
                          style={{ color: "var(--error)" }}
                        />
                      ) : (
                        <Trash2 size={10} style={{ color: "var(--error)" }} />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleInsert(snippet)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors"
                    style={{
                      background: "var(--bg-activity)",
                      color:
                        copiedId === snippet.id
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                    data-ocid={`snippets.secondary_button.${i + 1}`}
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <Check size={9} /> Copied
                      </>
                    ) : (
                      <>
                        <Clipboard size={9} /> Insert
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre
                className="text-[10px] overflow-x-auto rounded p-1.5 line-clamp-2"
                style={{
                  background: "var(--bg-activity)",
                  color: "var(--text-muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                  border: "1px solid var(--border)",
                }}
              >
                {snippet.code}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
