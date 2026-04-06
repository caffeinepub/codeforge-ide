import { create } from "zustand";

export interface CenterNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
  read: boolean;
}

interface NotificationCenterStore {
  notifications: CenterNotification[];
  isOpen: boolean;
  addNotification: (
    n: Omit<CenterNotification, "id" | "timestamp" | "read">,
  ) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  setOpen: (open: boolean) => void;
  unreadCount: () => number;
}

export const useNotificationCenterStore = create<NotificationCenterStore>(
  (set, get) => ({
    isOpen: false,
    notifications: [
      {
        id: "n1",
        title: "Phase 2 Activated",
        message: "CodeVeda Phase 2 features are now live!",
        type: "success",
        timestamp: Date.now() - 60000,
        read: false,
      },
      {
        id: "n2",
        title: "AI Assistant Ready",
        message: "Ask me anything about your code.",
        type: "info",
        timestamp: Date.now() - 120000,
        read: false,
      },
      {
        id: "n3",
        title: "Extensions Loaded",
        message: "2 extensions are active: Prettier, ESLint.",
        type: "info",
        timestamp: Date.now() - 300000,
        read: true,
      },
    ],
    addNotification: (n) => {
      const id = `cn_${Date.now().toString(36)}`;
      set((state) => ({
        notifications: [
          { ...n, id, timestamp: Date.now(), read: false },
          ...state.notifications,
        ].slice(0, 20),
      }));
    },
    markRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      })),
    markAllRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),
    clearAll: () => set({ notifications: [] }),
    setOpen: (open) => set({ isOpen: open }),
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
  }),
);
