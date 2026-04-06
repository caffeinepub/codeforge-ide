import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  default_branch: string;
}

export interface ConnectedRepo {
  owner: string;
  name: string;
  url: string;
  branch: string;
}

export interface PullRequest {
  number: number;
  title: string;
  state: string;
  url: string;
}

interface GithubStore {
  token: string | null;
  username: string | null;
  connectedRepo: ConnectedRepo | null;
  repos: GithubRepo[];
  branches: string[];
  prs: PullRequest[];
  isLoading: boolean;
  error: string | null;
  setToken: (token: string) => void;
  disconnect: () => void;
  setConnectedRepo: (repo: ConnectedRepo | null) => void;
  setRepos: (repos: GithubRepo[]) => void;
  setBranches: (branches: string[]) => void;
  setPRs: (prs: PullRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUsername: (username: string | null) => void;
}

export const useGithubStore = create<GithubStore>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      connectedRepo: null,
      repos: [],
      branches: [],
      prs: [],
      isLoading: false,
      error: null,
      setToken: (token) => set({ token }),
      setUsername: (username) => set({ username }),
      disconnect: () =>
        set({
          token: null,
          username: null,
          connectedRepo: null,
          repos: [],
          branches: [],
          prs: [],
          error: null,
        }),
      setConnectedRepo: (repo) => set({ connectedRepo: repo }),
      setRepos: (repos) => set({ repos }),
      setBranches: (branches) => set({ branches }),
      setPRs: (prs) => set({ prs }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    { name: "codeveda-github" },
  ),
);
