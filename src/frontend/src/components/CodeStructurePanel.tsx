import {
  ChevronDown,
  ChevronRight,
  FileCode,
  Layout,
  Variable,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useEditorStore } from "../stores/editorStore";

interface StructureItem {
  id: string;
  name: string;
  type: "function" | "class" | "variable" | "constant" | "interface" | "type";
  line: number;
}

function parseStructure(content: string): StructureItem[] {
  const items: StructureItem[] = [];
  const lines = content.split("\n");

  const patterns: {
    regex: RegExp;
    type: StructureItem["type"];
    nameGroup: number;
  }[] = [
    {
      regex: /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
      type: "function",
      nameGroup: 1,
    },
    {
      regex: /^\s*(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/,
      type: "class",
      nameGroup: 1,
    },
    {
      regex: /^\s*(?:export\s+)?const\s+(\w+)\s*[:=]/,
      type: "constant",
      nameGroup: 1,
    },
    {
      regex: /^\s*(?:export\s+)?let\s+(\w+)\s*[:=]/,
      type: "variable",
      nameGroup: 1,
    },
    {
      regex: /^\s*(?:export\s+)?interface\s+(\w+)/,
      type: "interface",
      nameGroup: 1,
    },
    {
      regex: /^\s*(?:export\s+)?type\s+(\w+)\s*=/,
      type: "type",
      nameGroup: 1,
    },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { regex, type, nameGroup } of patterns) {
      const match = line.match(regex);
      const name = match?.[nameGroup];
      if (name) {
        if (!items.find((x) => x.name === name && x.type === type)) {
          items.push({ id: `${type}-${i}-${name}`, name, type, line: i + 1 });
        }
        break;
      }
    }
  }

  return items;
}

const TYPE_CONFIG: Record<
  StructureItem["type"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  class: {
    label: "Classes",
    color: "#e06c75",
    icon: <FileCode size={12} />,
  },
  function: {
    label: "Functions",
    color: "#61afef",
    icon: <Layout size={12} />,
  },
  interface: {
    label: "Interfaces",
    color: "#4ec9b0",
    icon: <FileCode size={12} />,
  },
  type: {
    label: "Types",
    color: "#c678dd",
    icon: <FileCode size={12} />,
  },
  constant: {
    label: "Constants",
    color: "#f7c948",
    icon: <Variable size={12} />,
  },
  variable: {
    label: "Variables",
    color: "#98c379",
    icon: <Variable size={12} />,
  },
};

const TYPE_ORDER: StructureItem["type"][] = [
  "class",
  "function",
  "interface",
  "type",
  "constant",
  "variable",
];

export const CodeStructurePanel: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  const structure = useMemo(() => {
    if (!activeFile) return [];
    return parseStructure(activeFile.content);
  }, [activeFile]);

  const grouped = useMemo(() => {
    const map: Partial<Record<StructureItem["type"], StructureItem[]>> = {};
    for (const item of structure) {
      if (!map[item.type]) map[item.type] = [];
      map[item.type]!.push(item);
    }
    return map;
  }, [structure]);

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-panel)" }}
      >
        <div className="flex items-center gap-2">
          <Layout size={14} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Code Structure
          </span>
        </div>
        {activeFile && (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {structure.length} symbols
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!activeFile ? (
          <div className="p-6 text-center" data-ocid="structure.empty_state">
            <Layout
              size={20}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Open a file to see its structure
            </p>
          </div>
        ) : structure.length === 0 ? (
          <div className="p-6 text-center" data-ocid="structure.empty_state">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No symbols found in {activeFile.name}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {activeFile && (
              <div
                className="px-3 py-1.5 text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {activeFile.name}
              </div>
            )}
            {TYPE_ORDER.map((type) => {
              const items = grouped[type];
              if (!items || items.length === 0) return null;
              const cfg = TYPE_CONFIG[type];
              const isCollapsed = collapsed.has(type);
              return (
                <div key={type}>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 w-full px-3 py-1 hover:bg-[var(--hover-item)] transition-colors"
                    onClick={() => toggleCollapse(type)}
                    data-ocid={`structure.${type}.toggle`}
                  >
                    {isCollapsed ? (
                      <ChevronRight
                        size={11}
                        style={{ color: "var(--text-muted)" }}
                      />
                    ) : (
                      <ChevronDown
                        size={11}
                        style={{ color: "var(--text-muted)" }}
                      />
                    )}
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      className="ml-auto text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {items.length}
                    </span>
                  </button>
                  {!isCollapsed &&
                    items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 w-full px-6 py-1 hover:bg-[var(--hover-item)] transition-colors cursor-pointer"
                        data-ocid={`structure.item.${idx + 1}`}
                        title={`Line ${item.line}`}
                      >
                        <span style={{ color: cfg.color, flexShrink: 0 }}>
                          {cfg.icon}
                        </span>
                        <span
                          className="text-xs flex-1 truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="text-[10px] flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        >
                          L{item.line}
                        </span>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
