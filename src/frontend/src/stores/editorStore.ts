import { create } from "zustand";

export interface FileTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  cursorPosition?: { lineNumber: number; column: number };
}

interface EditorStore {
  openFiles: FileTab[];
  activeFileId: string | null;
  splitMode: boolean;
  splitDirection: "horizontal" | "vertical";
  secondPaneActiveFileId: string | null;
  secondPaneFiles: FileTab[];
  // UI state
  showCommandPalette: boolean;
  showQuickOpen: boolean;
  showSettings: boolean;
  // Actions
  openFile: (file: FileTab) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  markFileDirty: (id: string, dirty: boolean) => void;
  setSplitMode: (mode: boolean, direction?: "horizontal" | "vertical") => void;
  setSecondPaneActiveFile: (id: string | null) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  setCursorPosition: (
    id: string,
    pos: { lineNumber: number; column: number },
  ) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowQuickOpen: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  renameFile: (id: string, newName: string, newPath: string) => void;
  createFile: (file: FileTab) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  openFiles: [],
  activeFileId: null,
  splitMode: false,
  splitDirection: "horizontal",
  secondPaneActiveFileId: null,
  secondPaneFiles: [],
  showCommandPalette: false,
  showQuickOpen: false,
  showSettings: false,

  openFile: (file) =>
    set((state) => {
      const existing = state.openFiles.find((f) => f.id === file.id);
      if (existing) {
        return { activeFileId: file.id };
      }
      return {
        openFiles: [...state.openFiles, file],
        activeFileId: file.id,
      };
    }),

  closeFile: (id) =>
    set((state) => {
      const idx = state.openFiles.findIndex((f) => f.id === id);
      const newFiles = state.openFiles.filter((f) => f.id !== id);
      let newActiveId = state.activeFileId;
      if (state.activeFileId === id) {
        if (newFiles.length === 0) {
          newActiveId = null;
        } else if (idx > 0) {
          newActiveId = newFiles[idx - 1].id;
        } else {
          newActiveId = newFiles[0].id;
        }
      }
      return { openFiles: newFiles, activeFileId: newActiveId };
    }),

  setActiveFile: (id) => set({ activeFileId: id }),

  updateFileContent: (id, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === id ? { ...f, content, isDirty: true } : f,
      ),
    })),

  markFileDirty: (id, dirty) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === id ? { ...f, isDirty: dirty } : f,
      ),
    })),

  setSplitMode: (mode, direction = "horizontal") =>
    set({ splitMode: mode, splitDirection: direction }),

  setSecondPaneActiveFile: (id) => set({ secondPaneActiveFileId: id }),

  reorderTabs: (fromIndex, toIndex) =>
    set((state) => {
      const files = [...state.openFiles];
      const [moved] = files.splice(fromIndex, 1);
      files.splice(toIndex, 0, moved);
      return { openFiles: files };
    }),

  setCursorPosition: (id, pos) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === id ? { ...f, cursorPosition: pos } : f,
      ),
    })),

  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setShowQuickOpen: (show) => set({ showQuickOpen: show }),
  setShowSettings: (show) => set({ showSettings: show }),

  renameFile: (id, newName, newPath) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.id === id ? { ...f, name: newName, path: newPath } : f,
      ),
    })),

  createFile: (file) =>
    set((state) => ({
      openFiles: [...state.openFiles, file],
      activeFileId: file.id,
    })),
}));
