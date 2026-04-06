import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Filter,
  ListTodo,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useEditorStore } from "../stores/editorStore";

type TodoTag = "TODO" | "FIXME" | "HACK" | "NOTE" | "XXX";

interface TodoItem {
  id: string;
  file: string;
  fileId: string;
  line: number;
  type: TodoTag;
  text: string;
}

const TAG_PATTERNS: { type: TodoTag; regex: RegExp }[] = [
  { type: "TODO", regex: /\/\/\s*TODO:?\s*(.*)/i },
  { type: "FIXME", regex: /\/\/\s*FIXME:?\s*(.*)/i },
  { type: "HACK", regex: /\/\/\s*HACK:?\s*(.*)/i },
  { type: "NOTE", regex: /\/\/\s*NOTE:?\s*(.*)/i },
  { type: "XXX", regex: /\/\/\s*XXX:?\s*(.*)/i },
];

const TAG_COLORS: Record<TodoTag, string> = {
  TODO: "var(--info)",
  FIXME: "var(--error)",
  HACK: "var(--warning)",
  NOTE: "#98c379",
  XXX: "#c678dd",
};

function parseTodosFromFile(
  content: string,
  filename: string,
  fileId: string,
): TodoItem[] {
  const items: TodoItem[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { type, regex } of TAG_PATTERNS) {
      const match = line.match(regex);
      if (match) {
        items.push({
          id: `${fileId}-${type}-${i}`,
          file: filename,
          fileId,
          line: i + 1,
          type,
          text: match[1]?.trim() ?? "",
        });
        break;
      }
    }
  }
  return items;
}

export const TodoPanel: React.FC = () => {
  const { openFiles, setActiveFile } = useEditorStore();
  const [activeFilter, setActiveFilter] = useState<TodoTag | "all">("all");
  const [sortByFile, setSortByFile] = useState(true);

  const allTodos = useMemo(() => {
    const items: TodoItem[] = [];
    for (const file of openFiles) {
      items.push(...parseTodosFromFile(file.content, file.name, file.id));
    }
    return items;
  }, [openFiles]);

  const filtered = useMemo(() => {
    const items =
      activeFilter === "all"
        ? allTodos
        : allTodos.filter((t) => t.type === activeFilter);
    if (sortByFile) {
      return [...items].sort((a, b) => a.file.localeCompare(b.file));
    }
    return items;
  }, [allTodos, activeFilter, sortByFile]);

  const grouped = useMemo(() => {
    const map: Record<string, TodoItem[]> = {};
    for (const item of filtered) {
      if (!map[item.file]) map[item.file] = [];
      map[item.file].push(item);
    }
    return map;
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Partial<Record<TodoTag, number>> = {};
    for (const item of allTodos) {
      c[item.type] = (c[item.type] ?? 0) + 1;
    }
    return c;
  }, [allTodos]);

  const navigateTo = (item: TodoItem) => {
    setActiveFile(item.fileId);
  };

  const TAGS: TodoTag[] = ["TODO", "FIXME", "HACK", "NOTE", "XXX"];

  return (
    <div
      className="flex-1 overflow-hidden flex flex-col"
      style={{ background: "var(--bg-panel)" }}
    >
      {/* Filter bar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--border)] flex-shrink-0 flex-wrap"
        style={{ background: "var(--bg-tab-bar)" }}
      >
        <Filter size={10} style={{ color: "var(--text-muted)" }} />
        <button
          type="button"
          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
            activeFilter === "all"
              ? "bg-[var(--hover-item)] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          onClick={() => setActiveFilter("all")}
          data-ocid="todo.filter.tab"
        >
          All ({allTodos.length})
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
              activeFilter === tag
                ? "bg-[var(--hover-item)]"
                : "hover:bg-[var(--hover-item)]"
            }`}
            style={{
              color:
                activeFilter === tag ? TAG_COLORS[tag] : "var(--text-muted)",
            }}
            onClick={() => setActiveFilter(activeFilter === tag ? "all" : tag)}
            data-ocid="todo.filter.tab"
          >
            {tag} {counts[tag] ? `(${counts[tag]})` : ""}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
          style={{ color: "var(--text-muted)" }}
          onClick={() => setSortByFile((v) => !v)}
          title="Sort by file name"
        >
          Sort: {sortByFile ? "File" : "Type"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {openFiles.length === 0 ? (
          <div className="p-6 text-center" data-ocid="todo.empty_state">
            <ListTodo
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Open files to see TODO / FIXME comments
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center" data-ocid="todo.empty_state">
            <CheckCircle
              size={20}
              className="mx-auto mb-2"
              style={{ color: "#4ec9b0" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No {activeFilter !== "all" ? activeFilter : ""} items found
            </p>
          </div>
        ) : (
          <div className="p-1">
            {Object.entries(grouped).map(([filename, items]) => (
              <div key={filename} className="mb-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 sticky top-0 z-10"
                  style={{ background: "var(--bg-panel)" }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {filename}
                  </span>
                  <span
                    className="text-[10px] px-1 rounded"
                    style={{
                      background: "var(--bg-input)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {items.length}
                  </span>
                </div>
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex items-start gap-2 w-full px-3 py-1.5 rounded hover:bg-[var(--hover-item)] cursor-pointer transition-colors text-left"
                    onClick={() => navigateTo(item)}
                    data-ocid={`todo.item.${i + 1}`}
                  >
                    {item.type === "FIXME" || item.type === "XXX" ? (
                      <AlertTriangle
                        size={12}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: TAG_COLORS[item.type] }}
                      />
                    ) : item.type === "HACK" ? (
                      <AlertCircle
                        size={12}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: TAG_COLORS[item.type] }}
                      />
                    ) : (
                      <CheckCircle
                        size={12}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: TAG_COLORS[item.type] }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-bold px-1 rounded"
                          style={{
                            background: `${TAG_COLORS[item.type]}22`,
                            color: TAG_COLORS[item.type],
                          }}
                        >
                          {item.type}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Line {item.line}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.text || `(${item.type} comment)`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
