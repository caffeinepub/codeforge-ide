import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ListTodo,
  X,
} from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { useEditorStore } from "../stores/editorStore";

interface TodoItem {
  id: string;
  file: string;
  line: number;
  type: "TODO" | "FIXME";
  text: string;
}

function parseTodos(content: string, filename: string): TodoItem[] {
  const items: TodoItem[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const todoMatch = line.match(/\/\/\s*TODO:\s*(.+)/);
    const fixmeMatch = line.match(/\/\/\s*FIXME:\s*(.+)/);
    if (todoMatch) {
      items.push({
        id: `${filename}-todo-${i}`,
        file: filename,
        line: i + 1,
        type: "TODO",
        text: todoMatch[1].trim(),
      });
    } else if (fixmeMatch) {
      items.push({
        id: `${filename}-fixme-${i}`,
        file: filename,
        line: i + 1,
        type: "FIXME",
        text: fixmeMatch[1].trim(),
      });
    }
  }
  return items;
}

export const TodoPanel: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const todos = useMemo(() => {
    if (!activeFile) return [];
    return parseTodos(activeFile.content, activeFile.name);
  }, [activeFile]);

  const todoCount = todos.filter((t) => t.type === "TODO").length;
  const fixmeCount = todos.filter((t) => t.type === "FIXME").length;

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: "var(--bg-panel)" }}
    >
      {!activeFile ? (
        <div className="p-6 text-center" data-ocid="todo.empty_state">
          <ListTodo
            size={20}
            className="mx-auto mb-2"
            style={{ color: "var(--text-muted)" }}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Open a file to see TODOs
          </p>
        </div>
      ) : todos.length === 0 ? (
        <div className="p-6 text-center" data-ocid="todo.empty_state">
          <CheckCircle
            size={20}
            className="mx-auto mb-2"
            style={{ color: "#4ec9b0" }}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No TODOs in {activeFile.name}
          </p>
        </div>
      ) : (
        <div className="p-2">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-1">
            <span
              className="text-[10px] flex items-center gap-1"
              style={{ color: "var(--info)" }}
            >
              <AlertCircle size={10} /> {todoCount} TODO
            </span>
            <span
              className="text-[10px] flex items-center gap-1"
              style={{ color: "var(--error)" }}
            >
              <AlertTriangle size={10} /> {fixmeCount} FIXME
            </span>
          </div>
          {todos.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-2 px-3 py-1.5 rounded hover:bg-[var(--hover-item)] cursor-pointer transition-colors"
              data-ocid={`todo.item.${i + 1}`}
            >
              {item.type === "FIXME" ? (
                <AlertTriangle
                  size={12}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--error)" }}
                />
              ) : (
                <AlertCircle
                  size={12}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--info)" }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-bold px-1 rounded"
                    style={{
                      background:
                        item.type === "FIXME"
                          ? "var(--error)22"
                          : "var(--info)22",
                      color:
                        item.type === "FIXME" ? "var(--error)" : "var(--info)",
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
                  {item.text}
                </p>
              </div>
              <X
                size={10}
                className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
