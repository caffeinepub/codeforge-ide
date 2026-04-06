import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "user" | "guest";

interface AuthStore {
  isLoggedIn: boolean;
  principal: string | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  login: (principal: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      principal: null,
      role: "guest",
      isAdmin: false,
      isLoading: false,
      login: (principal, role) =>
        set({
          isLoggedIn: true,
          principal,
          role,
          isAdmin: role === "admin",
        }),
      logout: () =>
        set({
          isLoggedIn: false,
          principal: null,
          role: "guest",
          isAdmin: false,
        }),
      setRole: (role) => set({ role, isAdmin: role === "admin" }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "codeveda-auth" },
  ),
);
