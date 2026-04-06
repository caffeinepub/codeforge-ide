import { Replace, Search, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useMemo } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useFilesystemStore } from "../../stores/filesystemStore";
import { FileIcon } from "./FileIcon";
import { FILE_CONTENTS, getLanguageFromPath } from "./mockFileSystem";
import type { FSNode } from "./mockFileSystem";

interface SearchResult {
  filePath: string;
  fileName: string;
  fileId: string;
  language: string;
  lineNumber: number;
  lineContent: string;
}

function findNodeIdByPath(path: string, nodes: FSNode[]): string | null {
  for (const node of nodes) {
    if (node.path === path) return node.id;
    if (node.children) {
      const found = findNodeIdByPath(path, node.children);
      if (found) return found;
    }
  }
  return null;
}

export const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceVisible, setReplaceVisible] = useState(false);
  const [replaceMsg, setReplaceMsg] = useState<string | null>(null);
  const { openFile, openFiles, updateFileContent } = useEditorStore();
  const { fileTree } = useFilesystemStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    const found: SearchResult[] = [];

    for (const [path, content] of Object.entries(FILE_CONTENTS)) {
      const lines = content.split("\n");
      const fileName = path.split("/").pop() ?? path;
      const fileId = findNodeIdByPath(path, fileTree) ?? path;
      const language = getLanguageFromPath(path);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerQuery)) {
          found.push({
            filePath: path,
            fileName,
            fileId,
            language,
            lineNumber: i + 1,
            lineContent: lines[i].trim(),
          });
          if (found.length >= 200) break;
        }
      }
      if (found.length >= 200) break;
    }
    return found;
  }, [query, fileTree]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
      if (!map.has(r.filePath)) map.set(r.filePath, []);
      map.get(r.filePath)!.push(r);
    }
    return map;
  }, [results]);

  const handleResultClick = (result: SearchResult) => {
    const content = FILE_CONTENTS[result.filePath] ?? "";
    openFile({
      id: result.fileId,
      name: result.fileName,
      path: result.filePath,
      content,
      language: result.language,
      isDirty: false,
    });
  };

  const handleReplaceAll = () => {
    if (!query.trim() || query.length < 2) return;
    let totalOccurrences = 0;
    let filesAffected = 0;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");

    for (const file of openFiles) {
      const matches = (file.content.match(regex) || []).length;
      if (matches > 0) {
        const newContent = file.content.replace(regex, replaceText);
        updateFileContent(file.id, newContent);
        totalOccurrences += matches;
        filesAffected++;
      }
    }

    if (totalOccurrences > 0) {
      setReplaceMsg(
        `Replaced ${totalOccurrences} occurrence${totalOccurrences !== 1 ? "s" : ""} in ${filesAffected} file${filesAffected !== 1 ? "s" : ""}`,
      );
    } else {
      setReplaceMsg("No occurrences found in open files");
    }
    setTimeout(() => setReplaceMsg(null), 4000);
  };

  const highlight = (text: string, q: string) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-[var(--accent)] text-white rounded-none px-0">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 space-y-1.5">
        {/* Search input */}
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--icon-inactive)]"
          />
          <input
            ref={inputRef}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] text-xs rounded px-6 py-1.5 outline-none focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
            placeholder="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setReplaceMsg(null);
            }}
            data-ocid="search.search_input"
          />
          <button
            type="button"
            onClick={() => setReplaceVisible((v) => !v)}
            className={`absolute right-6 top-1/2 -translate-y-1/2 transition-colors ${replaceVisible ? "text-[var(--accent)]" : "text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"}`}
            title="Toggle Replace"
          >
            <Replace size={11} />
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setReplaceMsg(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Replace input */}
        {replaceVisible && (
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <input
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] text-xs rounded px-2 py-1.5 outline-none focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
                placeholder="Replace with"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                data-ocid="search.replace_input"
              />
            </div>
            <button
              type="button"
              className="px-2 py-1 text-[10px] font-medium rounded transition-colors flex-shrink-0"
              style={{
                background:
                  query.length >= 2 ? "var(--accent)" : "var(--bg-input)",
                color: query.length >= 2 ? "#fff" : "var(--text-muted)",
              }}
              onClick={handleReplaceAll}
              disabled={query.length < 2}
              data-ocid="search.replace_all.button"
            >
              Replace All
            </button>
          </div>
        )}

        {replaceMsg && (
          <p
            className="text-[10px] px-1"
            style={{
              color: replaceMsg.startsWith("No")
                ? "var(--text-muted)"
                : "#22c55e",
            }}
          >
            {replaceMsg}
          </p>
        )}

        {query.length > 0 && query.length < 2 && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Type at least 2 characters
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-[var(--text-muted)]">No results found</p>
          </div>
        )}

        {Array.from(grouped.entries()).map(([filePath, fileResults]) => (
          <div key={filePath} data-ocid="search.item.1">
            <div className="flex items-center gap-2 px-3 py-1 sticky top-0 bg-[var(--bg-sidebar)] border-b border-[var(--border)]">
              <FileIcon name={fileResults[0].fileName} size={12} />
              <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                {fileResults[0].fileName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate flex-1">
                {filePath}
              </span>
              <span className="text-[10px] text-[var(--accent)] ml-auto flex-shrink-0">
                {fileResults.length}
              </span>
            </div>
            {fileResults.map((result) => (
              <button
                type="button"
                key={`${result.filePath}-${result.lineNumber}`}
                className="flex items-start gap-2 px-4 py-1 cursor-pointer hover:bg-[var(--hover-item)] w-full text-left"
                onClick={() => handleResultClick(result)}
              >
                <span className="text-[10px] text-[var(--text-muted)] w-8 text-right flex-shrink-0 pt-0.5">
                  {result.lineNumber}
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-mono truncate">
                  {highlight(result.lineContent, query)}
                </span>
              </button>
            ))}
          </div>
        ))}

        {results.length >= 200 && (
          <p className="text-[10px] text-[var(--text-muted)] text-center py-2">
            Showing first 200 results
          </p>
        )}
      </div>
    </div>
  );
};
