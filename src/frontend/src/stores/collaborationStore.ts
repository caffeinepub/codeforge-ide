import { create } from "zustand";
import type { CollabEvent, UserPresence } from "../backend.d.ts";

interface CollaborationStore {
  sessionId: string | null;
  isActive: boolean;
  onlineUsers: UserPresence[];
  feed: CollabEvent[];
  isLoading: boolean;
  error: string | null;

  startSession: (sessionId: string) => void;
  endSession: () => void;
  setOnlineUsers: (users: UserPresence[]) => void;
  addFeedEvent: (event: CollabEvent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  isActive: false,
  onlineUsers: [],
  feed: [],
  isLoading: false,
  error: null,
};

export const useCollaborationStore = create<CollaborationStore>((set) => ({
  ...initialState,

  startSession: (sessionId) => set({ sessionId, isActive: true, error: null }),

  endSession: () =>
    set({ sessionId: null, isActive: false, onlineUsers: [], feed: [] }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addFeedEvent: (event) =>
    set((state) => ({
      feed: [event, ...state.feed].slice(0, 10),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
