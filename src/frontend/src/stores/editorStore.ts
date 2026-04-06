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
  showCommandPalette: boolean;
  showQuickOpen: boolean;
  showSettings: boolean;
  pinnedTabs: Set<string>;
  tabColors: Record<string, string>;
  openFile: (file: FileTab) => void;
  closeFile: (id: string) => void;
  closeOtherFiles: (id: string) => void;
  closeFilesToRight: (id: string) => void;
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
  pinTab: (id: string) => void;
  unpinTab: (id: string) => void;
  setTabColor: (id: string, color: string | null) => void;
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
  pinnedTabs: new Set<string>(),
  tabColors: {},

  openFile: (file) =>
    set((state) => {
      const existing = state.openFiles.find((f) => f.id === file.id);
      if (existing) return { activeFileId: file.id };
      return { openFiles: [...state.openFiles, file], activeFileId: file.id };
    }),

  closeFile: (id) =>
    set((state) => {
      if (state.pinnedTabs.has(id)) return state;
      const idx = state.openFiles.findIndex((f) => f.id === id);
      const newFiles = state.openFiles.filter((f) => f.id !== id);
      let newActiveId = state.activeFileId;
      if (state.activeFileId === id) {
        if (newFiles.length === 0) newActiveId = null;
        else if (idx > 0) newActiveId = newFiles[idx - 1].id;
        else newActiveId = newFiles[0].id;
      }
      const newColors = { ...state.tabColors };
      delete newColors[id];
      return {
        openFiles: newFiles,
        activeFileId: newActiveId,
        tabColors: newColors,
      };
    }),

  closeOtherFiles: (id) =>
    set((state) => {
      const newFiles = state.openFiles.filter(
        (f) => f.id === id || state.pinnedTabs.has(f.id),
      );
      const newColors: Record<string, string> = {};
      for (const f of newFiles) {
        if (state.tabColors[f.id]) newColors[f.id] = state.tabColors[f.id];
      }
      return { openFiles: newFiles, activeFileId: id, tabColors: newColors };
    }),

  closeFilesToRight: (id) =>
    set((state) => {
      const idx = state.openFiles.findIndex((f) => f.id === id);
      if (idx === -1) return state;
      const newFiles = state.openFiles.filter(
        (f, i) => i <= idx || state.pinnedTabs.has(f.id),
      );
      const newColors: Record<string, string> = {};
      for (const f of newFiles) {
        if (state.tabColors[f.id]) newColors[f.id] = state.tabColors[f.id];
      }
      return { openFiles: newFiles, tabColors: newColors };
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

  pinTab: (id) =>
    set((state) => {
      const next = new Set(state.pinnedTabs);
      next.add(id);
      return { pinnedTabs: next };
    }),
  unpinTab: (id) =>
    set((state) => {
      const next = new Set(state.pinnedTabs);
      next.delete(id);
      return { pinnedTabs: next };
    }),

  setTabColor: (id, color) =>
    set((state) => {
      const next = { ...state.tabColors };
      if (color === null) delete next[id];
      else next[id] = color;
      return { tabColors: next };
    }),
}));
