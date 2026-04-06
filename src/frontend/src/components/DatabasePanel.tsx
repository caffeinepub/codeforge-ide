import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Key,
  Play,
  Table,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

const MOCK_TABLES = [
  {
    name: "users",
    columns: [
      { name: "id", type: "TEXT", pk: true },
      { name: "principal", type: "TEXT", pk: false },
      { name: "username", type: "TEXT", pk: false },
      { name: "email", type: "TEXT", pk: false },
      { name: "created_at", type: "TIMESTAMP", pk: false },
      { name: "is_admin", type: "BOOL", pk: false },
    ],
    rows: [
      {
        id: "usr_1",
        principal: "2vxsx-fae...",
        username: "alice",
        email: "alice@example.com",
        created_at: "2025-01-15",
        is_admin: true,
      },
      {
        id: "usr_2",
        principal: "rrkah-fqaaa...",
        username: "bob",
        email: "bob@example.com",
        created_at: "2025-02-03",
        is_admin: false,
      },
      {
        id: "usr_3",
        principal: "aaaaa-bbbbb...",
        username: "carol",
        email: "carol@dev.io",
        created_at: "2025-03-12",
        is_admin: false,
      },
    ],
  },
  {
    name: "projects",
    columns: [
      { name: "id", type: "TEXT", pk: true },
      { name: "owner_id", type: "TEXT", pk: false },
      { name: "name", type: "TEXT", pk: false },
      { name: "language", type: "TEXT", pk: false },
      { name: "is_public", type: "BOOL", pk: false },
      { name: "stars", type: "INT", pk: false },
    ],
    rows: [
      {
        id: "proj_1",
        owner_id: "usr_1",
        name: "codeveda-ai",
        language: "TypeScript",
        is_public: true,
        stars: 42,
      },
      {
        id: "proj_2",
        owner_id: "usr_2",
        name: "motoko-dex",
        language: "Motoko",
        is_public: true,
        stars: 17,
      },
      {
        id: "proj_3",
        owner_id: "usr_1",
        name: "private-notes",
        language: "Rust",
        is_public: false,
        stars: 0,
      },
    ],
  },
  {
    name: "files",
    columns: [
      { name: "id", type: "TEXT", pk: true },
      { name: "project_id", type: "TEXT", pk: false },
      { name: "path", type: "TEXT", pk: false },
      { name: "content", type: "TEXT", pk: false },
      { name: "updated_at", type: "TIMESTAMP", pk: false },
    ],
    rows: [
      {
        id: "file_1",
        project_id: "proj_1",
        path: "src/App.tsx",
        content: "import React...",
        updated_at: "2025-04-06",
      },
      {
        id: "file_2",
        project_id: "proj_1",
        path: "src/index.css",
        content: ":root { ...",
        updated_at: "2025-04-05",
      },
    ],
  },
  {
    name: "settings",
    columns: [
      { name: "user_id", type: "TEXT", pk: true },
      { name: "theme", type: "TEXT", pk: false },
      { name: "font_size", type: "INT", pk: false },
      { name: "tab_size", type: "INT", pk: false },
      { name: "vim_mode", type: "BOOL", pk: false },
    ],
    rows: [
      {
        user_id: "usr_1",
        theme: "dark",
        font_size: 14,
        tab_size: 2,
        vim_mode: false,
      },
      {
        user_id: "usr_2",
        theme: "monokai",
        font_size: 13,
        tab_size: 4,
        vim_mode: true,
      },
    ],
  },
];

const typeColor = (t: string) => {
  if (t === "TEXT") return "#61afef";
  if (t === "INT") return "#f7c948";
  if (t === "BOOL") return "#98c379";
  if (t === "TIMESTAMP") return "#c678dd";
  return "#abb2bf";
};

export const DatabasePanel: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState("users");
  const [expandedTables, setExpandedTables] = useState<Set<string>>(
    new Set(["users"]),
  );
  const [query, setQuery] = useState(
    "SELECT * FROM users WHERE is_admin = true;",
  );
  const [queryResult, setQueryResult] = useState<{
    cols: string[];
    rows: Record<string, string>[];
  } | null>(null);
  const [queryError, setQueryError] = useState("");

  const table = MOCK_TABLES.find((t) => t.name === selectedTable);

  const toggleExpand = (name: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const runQuery = () => {
    setQueryError("");
    const q = query.trim().toLowerCase();
    const selectMatch = q.match(/select\s+.+\s+from\s+(\w+)/);
    if (!selectMatch) {
      setQueryError("Only SELECT queries are supported in this demo.");
      setQueryResult(null);
      return;
    }
    const tName = selectMatch[1];
    const t2 = MOCK_TABLES.find((x) => x.name === tName);
    if (!t2) {
      setQueryError(`Table '${tName}' not found.`);
      setQueryResult(null);
      return;
    }
    setQueryResult({
      cols: t2.columns.map((c) => c.name),
      rows: t2.rows as unknown as Record<string, string>[],
    });
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-panel)" }}
      >
        <Database size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Database
        </span>
        <Badge
          variant="outline"
          className="ml-auto text-[9px] px-1.5 py-0"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          ICP Canister
        </Badge>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: table list */}
        <div
          className="flex flex-col flex-shrink-0 border-r border-[var(--border)] overflow-y-auto"
          style={{ width: 140, background: "var(--bg-sidebar)" }}
        >
          <div
            className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            Tables
          </div>
          {MOCK_TABLES.map((t) => (
            <div key={t.name}>
              <button
                type="button"
                className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-left transition-colors ${
                  selectedTable === t.name
                    ? "bg-[var(--hover-item)]"
                    : "hover:bg-[var(--hover-item)]"
                }`}
                onClick={() => {
                  setSelectedTable(t.name);
                  toggleExpand(t.name);
                }}
                data-ocid={"database.table.button"}
              >
                {expandedTables.has(t.name) ? (
                  <ChevronDown
                    size={10}
                    style={{ color: "var(--text-muted)" }}
                  />
                ) : (
                  <ChevronRight
                    size={10}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
                <Table
                  size={11}
                  style={{
                    color:
                      selectedTable === t.name
                        ? "var(--accent)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  className="text-[11px] truncate"
                  style={{
                    color:
                      selectedTable === t.name
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                  }}
                >
                  {t.name}
                </span>
              </button>
              {expandedTables.has(t.name) &&
                t.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-1 px-5 py-0.5"
                  >
                    {col.pk && (
                      <Key
                        size={8}
                        style={{ color: "#f7c948", flexShrink: 0 }}
                      />
                    )}
                    <span
                      className="text-[10px] truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {col.name}
                    </span>
                    <span
                      className="ml-auto text-[9px] flex-shrink-0"
                      style={{ color: typeColor(col.type) }}
                    >
                      {col.type}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Tabs
            defaultValue="data"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList
              className="flex-shrink-0 rounded-none border-b border-[var(--border)] justify-start px-2 h-8 gap-0"
              style={{ background: "var(--bg-tab-bar)" }}
            >
              <TabsTrigger
                value="data"
                className="text-[11px] h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent)]"
                data-ocid="database.data.tab"
              >
                Data
              </TabsTrigger>
              <TabsTrigger
                value="schema"
                className="text-[11px] h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent)]"
                data-ocid="database.schema.tab"
              >
                Schema
              </TabsTrigger>
              <TabsTrigger
                value="query"
                className="text-[11px] h-7 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent)]"
                data-ocid="database.query.tab"
              >
                Query Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="overflow-x-auto">
                  {table && (
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr
                          style={{
                            background: "var(--bg-panel)",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {table.columns.map((col) => (
                            <th
                              key={col.name}
                              className="px-3 py-1.5 text-left font-semibold whitespace-nowrap"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <div className="flex items-center gap-1">
                                {col.pk && (
                                  <Key size={9} style={{ color: "#f7c948" }} />
                                )}
                                {col.name}
                                <span
                                  className="ml-1 font-normal"
                                  style={{ color: typeColor(col.type) }}
                                >
                                  {col.type}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, i) => (
                          <tr
                            key={`row-${String(Object.values(row)[0])}-${i}`}
                            className="hover:bg-[var(--hover-item)] transition-colors"
                            style={{
                              borderBottom: "1px solid var(--border)",
                            }}
                            data-ocid={`database.row.${i + 1}`}
                          >
                            {table.columns.map((col) => (
                              <td
                                key={col.name}
                                className="px-3 py-1.5 whitespace-nowrap max-w-[160px] truncate"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {String(row[col.name] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="schema"
              className="flex-1 overflow-auto m-0 p-3"
            >
              {table && (
                <div>
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {table.name}
                  </p>
                  <div className="space-y-1">
                    {table.columns.map((col) => (
                      <div
                        key={col.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded"
                        style={{ background: "var(--bg-input)" }}
                      >
                        {col.pk && (
                          <Key size={10} style={{ color: "#f7c948" }} />
                        )}
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {col.name}
                        </span>
                        <span
                          className="ml-auto text-[10px] font-mono"
                          style={{ color: typeColor(col.type) }}
                        >
                          {col.type}
                        </span>
                        {col.pk && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0"
                            style={{
                              color: "#f7c948",
                              borderColor: "#f7c94844",
                            }}
                          >
                            PK
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="query"
              className="flex flex-col flex-1 overflow-hidden m-0 p-3 gap-2"
            >
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM users;"
                className="font-mono text-xs resize-none"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  minHeight: 80,
                  maxHeight: 120,
                }}
                data-ocid="database.query.textarea"
              />
              <Button
                size="sm"
                className="self-start text-xs h-7 gap-1"
                style={{ background: "var(--accent)", color: "#fff" }}
                onClick={runQuery}
                data-ocid="database.query.primary_button"
              >
                <Play size={11} /> Run Query
              </Button>
              {queryError && (
                <p
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    color: "var(--error)",
                    background: "rgba(220,38,38,0.08)",
                  }}
                  data-ocid="database.error_state"
                >
                  {queryError}
                </p>
              )}
              {queryResult && (
                <div className="flex-1 overflow-auto">
                  <p
                    className="text-[10px] mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {queryResult.rows.length} row(s) returned
                  </p>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {queryResult.cols.map((c) => (
                          <th
                            key={c}
                            className="px-2 py-1 text-left font-semibold"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, i) => (
                        <tr
                          key={`qrow-${String(Object.values(row)[0])}-${i}`}
                          className="hover:bg-[var(--hover-item)] transition-colors"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          {queryResult.cols.map((c) => (
                            <td
                              key={c}
                              className="px-2 py-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {String(row[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
