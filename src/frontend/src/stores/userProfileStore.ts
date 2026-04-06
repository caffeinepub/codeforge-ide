import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ActivityEntry {
  action: string;
  timestamp: string;
  file?: string;
}

interface UserProfileStore {
  displayName: string;
  avatarColor: string;
  bio: string;
  preferredLanguage: string;
  activityLog: ActivityEntry[];
  addActivity: (action: string, file?: string) => void;
  updateProfile: (
    displayName: string,
    bio: string,
    avatarColor: string,
  ) => void;
  setPreferredLanguage: (lang: string) => void;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      displayName: "Developer",
      avatarColor: "#007acc",
      bio: "",
      preferredLanguage: "typescript",
      activityLog: [
        {
          action: "Opened App.tsx",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          file: "src/App.tsx",
        },
        {
          action: "Committed: initial setup",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          action: "Opened main.mo",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          file: "backend/main.mo",
        },
        {
          action: "Installed dependencies",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          action: "Created project",
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
      ],
      addActivity: (action, file) =>
        set((state) => ({
          activityLog: [
            { action, timestamp: new Date().toISOString(), file },
            ...state.activityLog,
          ].slice(0, 100),
        })),
      updateProfile: (displayName, bio, avatarColor) =>
        set({ displayName, bio, avatarColor }),
      setPreferredLanguage: (lang) => set({ preferredLanguage: lang }),
    }),
    { name: "codeveda-profile" },
  ),
);
