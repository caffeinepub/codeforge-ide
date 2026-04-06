import { create } from "zustand";

export type FileStatus = "M" | "U" | "D";

export interface GitFile {
  id: string;
  name: string;
  path: string;
  status: FileStatus;
  staged: boolean;
}

interface GitStore {
  branch: string;
  files: GitFile[];
  commitMessage: string;
  stageFile: (id: string) => void;
  unstageFile: (id: string) => void;
  stageAll: () => void;
  unstageAll: () => void;
  setCommitMessage: (msg: string) => void;
  commit: () => void;
  setBranch: (branch: string) => void;
}

const INITIAL_FILES: GitFile[] = [
  { id: "g1", name: "App.tsx", path: "src/App.tsx", status: "M", staged: true },
  {
    id: "g2",
    name: "auth.ts",
    path: "src/hooks/auth.ts",
    status: "U",
    staged: false,
  },
  {
    id: "g3",
    name: "styles.css",
    path: "src/styles.css",
    status: "D",
    staged: false,
  },
  {
    id: "g4",
    name: "utils.ts",
    path: "src/lib/utils.ts",
    status: "M",
    staged: false,
  },
];

export const useGitStore = create<GitStore>((set) => ({
  branch: "main",
  files: INITIAL_FILES,
  commitMessage: "",
  stageFile: (id) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, staged: true } : f)),
    })),
  unstageFile: (id) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, staged: false } : f,
      ),
    })),
  stageAll: () =>
    set((state) => ({
      files: state.files.map((f) => ({ ...f, staged: true })),
    })),
  unstageAll: () =>
    set((state) => ({
      files: state.files.map((f) => ({ ...f, staged: false })),
    })),
  setCommitMessage: (msg) => set({ commitMessage: msg }),
  commit: () =>
    set((state) => ({
      files: state.files.filter((f) => !f.staged),
      commitMessage: "",
    })),
  setBranch: (branch) => set({ branch }),
}));
