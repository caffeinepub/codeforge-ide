import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  installs: string;
  category: string;
  isInstalled: boolean;
}

const ALL_EXTENSIONS: Extension[] = [
  {
    id: "ext-prettier",
    name: "Prettier",
    description: "Opinionated code formatter supporting many languages",
    author: "Prettier",
    installs: "28.4M",
    category: "Formatter",
    isInstalled: true,
  },
  {
    id: "ext-eslint",
    name: "ESLint",
    description: "Integrates ESLint JavaScript into VS Code",
    author: "Microsoft",
    installs: "25.1M",
    category: "Linter",
    isInstalled: true,
  },
  {
    id: "ext-gitlense",
    name: "GitLens",
    description: "Git supercharged — inline blame, history, and more",
    author: "GitKraken",
    installs: "19.8M",
    category: "Git",
    isInstalled: false,
  },
  {
    id: "ext-tailwind",
    name: "Tailwind CSS IntelliSense",
    description: "Autocomplete and linting for Tailwind CSS classes",
    author: "Tailwind Labs",
    installs: "12.2M",
    category: "IntelliSense",
    isInstalled: false,
  },
  {
    id: "ext-copilot",
    name: "GitHub Copilot",
    description: "AI-powered code suggestions from GitHub",
    author: "GitHub",
    installs: "18.5M",
    category: "AI",
    isInstalled: false,
  },
  {
    id: "ext-rest",
    name: "REST Client",
    description: "Send HTTP requests and view responses directly in editor",
    author: "Huachao Mao",
    installs: "5.6M",
    category: "Utility",
    isInstalled: false,
  },
  {
    id: "ext-docker",
    name: "Docker",
    description: "Build, manage and deploy containerised applications",
    author: "Microsoft",
    installs: "8.1M",
    category: "DevOps",
    isInstalled: false,
  },
  {
    id: "ext-motoko",
    name: "Motoko",
    description: "Language support for the Motoko ICP smart contract language",
    author: "DFINITY Foundation",
    installs: "142K",
    category: "Language",
    isInstalled: true,
  },
];

interface ExtensionsStore {
  extensions: Extension[];
  installExtension: (id: string) => void;
  uninstallExtension: (id: string) => void;
}

export const useExtensionsStore = create<ExtensionsStore>()(
  persist(
    (set) => ({
      extensions: ALL_EXTENSIONS,
      installExtension: (id) =>
        set((state) => ({
          extensions: state.extensions.map((e) =>
            e.id === id ? { ...e, isInstalled: true } : e,
          ),
        })),
      uninstallExtension: (id) =>
        set((state) => ({
          extensions: state.extensions.map((e) =>
            e.id === id ? { ...e, isInstalled: false } : e,
          ),
        })),
    }),
    { name: "codeveda-extensions" },
  ),
);
