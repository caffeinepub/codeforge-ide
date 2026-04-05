import { Search, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useMemo } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useFilesystemStore } from "../../stores/filesystemStore";
import { FileIcon } from "./FileIcon";
import { FILE_CONTENTS } from "./mockFileSystem";
import { getLanguageFromPath } from "./mockFileSystem";
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
  const { openFile } = useEditorStore();
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
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(lowerQuery)) {
          found.push({
            filePath: path,
            fileName,
            fileId,
            language,
            lineNumber: i + 1,
            lineContent: line.trim(),
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
      const key = r.filePath;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
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
      <div className="px-3 py-2">
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
            onChange={(e) => setQuery(e.target.value)}
            data-ocid="search.search_input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
            >
              <X size={11} />
            </button>
          )}
        </div>
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
