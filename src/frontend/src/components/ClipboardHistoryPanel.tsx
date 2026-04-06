import { Button } from "@/components/ui/button";
import { Clipboard, Clock, Copy, Trash2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "codeveda_clipboard";
const MAX_ITEMS = 10;

export interface ClipboardEntry {
  id: string;
  text: string;
  timestamp: number;
}

export function addToClipboardHistory(text: string) {
  if (!text.trim()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: ClipboardEntry[] = raw ? JSON.parse(raw) : [];
    // Deduplicate
    const filtered = history.filter((h) => h.text !== text);
    const newEntry: ClipboardEntry = {
      id: `clip_${Date.now()}`,
      text,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
}

function loadHistory(): ClipboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

interface ClipboardHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPaste?: (text: string) => void;
}

export const ClipboardHistoryPanel: React.FC<ClipboardHistoryPanelProps> = ({
  isOpen,
  onClose,
  onPaste,
}) => {
  const [history, setHistory] = useState<ClipboardEntry[]>(loadHistory);

  useEffect(() => {
    if (!isOpen) return;
    setHistory(loadHistory());
  }, [isOpen]);

  const handleDelete = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handlePaste = (text: string) => {
    if (onPaste) {
      onPaste(text);
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center pt-20"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: "var(--bg-sidebar)",
          border: "1px solid var(--border)",
          width: 480,
          maxHeight: 440,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        data-ocid="clipboard.panel"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-[var(--border)]"
          style={{ background: "var(--bg-panel)" }}
        >
          <div className="flex items-center gap-2">
            <Clipboard size={14} style={{ color: "var(--accent)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Clipboard History
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: "var(--bg-input)",
                color: "var(--text-muted)",
              }}
            >
              Ctrl+Shift+V
            </span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] gap-1"
                style={{ color: "var(--error)" }}
                onClick={handleClearAll}
                data-ocid="clipboard.delete_button"
              >
                <Trash2 size={10} /> Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
              data-ocid="clipboard.close_button"
            >
              <X size={12} />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center" data-ocid="clipboard.empty_state">
              <Copy
                size={20}
                className="mx-auto mb-2"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                No clipboard history yet. Copy text in the editor to populate.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {history.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 px-3 py-2 rounded-md group transition-colors hover:bg-[var(--hover-item)] cursor-pointer"
                  style={{ background: "var(--bg-input)" }}
                  onClick={() => handlePaste(entry.text)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handlePaste(entry.text)
                  }
                  data-ocid={`clipboard.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-mono truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {entry.text.slice(0, 60)}
                      {entry.text.length > 60 && "..."}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={9} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex-shrink-0 p-1 rounded hover:bg-[var(--error)]20 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.id);
                    }}
                    data-ocid="clipboard.delete_button"
                    aria-label="Remove from history"
                  >
                    <X size={10} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="px-4 py-2 flex-shrink-0 border-t border-[var(--border)] text-center"
          style={{ background: "var(--bg-panel)" }}
        >
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Click an item to paste · Last {MAX_ITEMS} copied items saved
          </p>
        </div>
      </div>
    </div>
  );
};
