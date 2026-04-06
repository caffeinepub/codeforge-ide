/**
 * fileSystemService.ts
 * Wraps the File System Access API with graceful fallbacks.
 * - Open folder -> showDirectoryPicker (FSAA) or <input type=file webkitdirectory>
 * - Open file  -> showOpenFilePicker (FSAA) or <input type=file>
 * - Save file  -> FileSystemFileHandle.createWritable() or Blob download
 */

import type { FSNode } from "../features/filesystem/mockFileSystem";
import { getLanguageFromPath } from "../features/filesystem/mockFileSystem";

function generateId(): string {
  return `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export interface OpenedFile {
  node: FSNode;
  content: string;
  handle?: FileSystemFileHandle;
}

export interface OpenedDirectory {
  name: string;
  tree: FSNode[];
  handles: Map<string, FileSystemFileHandle>;
}

// --- Feature detection ---
export const hasFSAA = () =>
  typeof window !== "undefined" && "showDirectoryPicker" in window;
export const hasFSAAFile = () =>
  typeof window !== "undefined" && "showOpenFilePicker" in window;

// --- Open a single file ---
export async function openFileFromSystem(): Promise<OpenedFile[]> {
  if (hasFSAAFile()) {
    try {
      const handles = await (
        window as unknown as {
          showOpenFilePicker: (
            opts?: Record<string, unknown>,
          ) => Promise<FileSystemFileHandle[]>;
        }
      ).showOpenFilePicker({
        multiple: true,
      });
      const results: OpenedFile[] = [];
      for (const handle of handles) {
        const file = await handle.getFile();
        const content = await file.text();
        const node: FSNode = {
          id: generateId(),
          name: file.name,
          path: file.name,
          type: "file",
          language: getLanguageFromPath(file.name),
          content,
        };
        results.push({ node, content, handle });
      }
      return results;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return [];
      throw e;
    }
  }

  // Fallback: <input type=file>
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      const results: OpenedFile[] = [];
      for (const file of files) {
        const content = await file.text();
        const node: FSNode = {
          id: generateId(),
          name: file.name,
          path: file.name,
          type: "file",
          language: getLanguageFromPath(file.name),
          content,
        };
        results.push({ node, content });
      }
      resolve(results);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}

// --- Recursively read a FileSystemDirectoryHandle ---
async function readDirHandle(
  dirHandle: FileSystemDirectoryHandle,
  parentPath: string,
  handles: Map<string, FileSystemFileHandle>,
  IGNORE = new Set([
    "node_modules",
    ".git",
    ".cache",
    "dist",
    ".next",
    "__pycache__",
  ]),
): Promise<FSNode[]> {
  const nodes: FSNode[] = [];
  // @ts-ignore - entries() is available but not always typed
  for await (const [name, handle] of dirHandle.entries()) {
    if (IGNORE.has(name)) continue;
    const path = parentPath ? `${parentPath}/${name}` : name;
    if (handle.kind === "file") {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const content = await file.text().catch(() => "");
      handles.set(path, fileHandle);
      nodes.push({
        id: generateId(),
        name,
        path,
        type: "file",
        language: getLanguageFromPath(name),
        content,
      });
    } else if (handle.kind === "directory") {
      const dirH = handle as FileSystemDirectoryHandle;
      const children = await readDirHandle(dirH, path, handles, IGNORE);
      nodes.push({
        id: generateId(),
        name,
        path,
        type: "folder",
        children,
        isExpanded: false,
      });
    }
  }
  // Sort: folders first, then files, alphabetically
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return nodes;
}

// --- Open a directory ---
export async function openDirectoryFromSystem(): Promise<OpenedDirectory | null> {
  if (hasFSAA()) {
    try {
      const dirHandle = await (
        window as unknown as {
          showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();
      const handles = new Map<string, FileSystemFileHandle>();
      const tree = await readDirHandle(dirHandle, "", handles);
      return { name: dirHandle.name, tree, handles };
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return null;
      throw e;
    }
  }

  // Fallback: <input type=file webkitdirectory>
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    (input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory =
      true;
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        resolve(null);
        return;
      }
      const handles = new Map<string, FileSystemFileHandle>();
      // Build tree from file paths
      const root: FSNode[] = [];
      const dirMap = new Map<string, FSNode>();

      // Sort files by path for deterministic order
      files.sort((a, b) =>
        a.webkitRelativePath.localeCompare(b.webkitRelativePath),
      );
      const rootName = files[0].webkitRelativePath.split("/")[0];

      for (const file of files) {
        const parts = file.webkitRelativePath.split("/").slice(1); // strip root folder
        if (parts.length === 0) continue;
        const content = await file.text().catch(() => "");
        const fileName = parts[parts.length - 1];
        const relativePath = parts.join("/");

        // Ensure parent dirs exist
        let parentArr = root;
        for (let i = 0; i < parts.length - 1; i++) {
          const dirPath = parts.slice(0, i + 1).join("/");
          if (!dirMap.has(dirPath)) {
            const dirNode: FSNode = {
              id: generateId(),
              name: parts[i],
              path: dirPath,
              type: "folder",
              children: [],
              isExpanded: false,
            };
            parentArr.push(dirNode);
            dirMap.set(dirPath, dirNode);
          }
          parentArr = dirMap.get(dirPath)!.children!;
        }

        parentArr.push({
          id: generateId(),
          name: fileName,
          path: relativePath,
          type: "file",
          language: getLanguageFromPath(fileName),
          content,
        });
      }

      resolve({ name: rootName, tree: root, handles });
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

// --- Save a file to system ---
export async function saveFileToSystem(
  fileName: string,
  content: string,
  handle?: FileSystemFileHandle,
): Promise<FileSystemFileHandle | null> {
  if (handle) {
    try {
      // @ts-ignore
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return handle;
    } catch (e) {
      console.error("Save via handle failed:", e);
    }
  }

  if (hasFSAAFile()) {
    try {
      const newHandle = await (
        window as unknown as {
          showSaveFilePicker: (
            opts?: Record<string, unknown>,
          ) => Promise<FileSystemFileHandle>;
        }
      ).showSaveFilePicker({
        suggestedName: fileName,
      });
      // @ts-ignore
      const writable = await newHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return newHandle;
    } catch (e) {
      if ((e as DOMException).name !== "AbortError") {
        // Fall through to blob download
      } else {
        return null;
      }
    }
  }

  // Fallback: blob download
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return null;
}
