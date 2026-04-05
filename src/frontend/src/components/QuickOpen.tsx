import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FileIcon } from "../features/filesystem/FileIcon";
import {
  FILE_CONTENTS,
  getLanguageFromPath,
} from "../features/filesystem/mockFileSystem";
import type { FSNode } from "../features/filesystem/mockFileSystem";
import { useEditorStore } from "../stores/editorStore";
import { useFilesystemStore } from "../stores/filesystemStore";

function findAllFiles(
  nodes: FSNode[],
): Array<{ id: string; name: string; path: string; language: string }> {
  const files: Array<{
    id: string;
    name: string;
    path: string;
    language: string;
  }> = [];
  for (const node of nodes) {
    if (node.type === "file") {
      files.push({
        id: node.id,
        name: node.name,
        path: node.path,
        language: node.language ?? getLanguageFromPath(node.path),
      });
    } else if (node.children) {
      files.push(...findAllFiles(node.children));
    }
  }
  return files;
}

export const QuickOpen: React.FC = () => {
  const { showQuickOpen, setShowQuickOpen, openFile } = useEditorStore();
  const { fileTree } = useFilesystemStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = findAllFiles(fileTree);

  const filtered = query.trim()
    ? allFiles.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.path.toLowerCase().includes(query.toLowerCase()),
      )
    : allFiles;

  useEffect(() => {
    if (showQuickOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showQuickOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowQuickOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filtered[selectedIndex]) {
      const file = filtered[selectedIndex];
      openFile({
        id: file.id,
        name: file.name,
        path: file.path,
        content: FILE_CONTENTS[file.path] ?? `// ${file.name}\n`,
        language: file.language,
        isDirty: false,
      });
      setShowQuickOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {showQuickOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowQuickOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
            }}
          />
          <motion.div
            className="relative w-full max-w-xl rounded-lg shadow-2xl overflow-hidden border border-[var(--border)]"
            style={{ background: "var(--bg-sidebar)" }}
            initial={{ scale: 0.97, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -12, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="quickopen.modal"
          >
            <input
              ref={inputRef}
              className="w-full px-4 py-3 text-sm outline-none bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] border-b border-[var(--border)]"
              placeholder="Go to file..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              data-ocid="quickopen.search_input"
            />
            <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
              {filtered.map((file, i) => (
                <button
                  type="button"
                  key={file.id}
                  className={`flex items-center gap-3 w-full px-4 py-2 cursor-pointer transition-colors text-left ${
                    i === selectedIndex
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-primary)] hover:bg-[var(--hover-item)]"
                  }`}
                  onClick={() => {
                    openFile({
                      id: file.id,
                      name: file.name,
                      path: file.path,
                      content: FILE_CONTENTS[file.path] ?? `// ${file.name}\n`,
                      language: file.language,
                      isDirty: false,
                    });
                    setShowQuickOpen(false);
                  }}
                  data-ocid={`quickopen.item.${i + 1}`}
                >
                  <FileIcon name={file.name} size={14} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{file.name}</div>
                    <div
                      className="text-[10px] truncate"
                      style={{
                        color:
                          i === selectedIndex
                            ? "rgba(255,255,255,0.7)"
                            : "var(--text-muted)",
                      }}
                    >
                      {file.path}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
