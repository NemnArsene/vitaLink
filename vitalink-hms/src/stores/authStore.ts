import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, Permission } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";

export type Theme = "light" | "dark";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  service: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  theme: Theme;
  sidebarCollapsed: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  hasPermission: (p: Permission) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      theme: "light",
      sidebarCollapsed: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      hasPermission: (p) => {
        const u = get().user;
        if (!u) return false;
        return ROLE_PERMISSIONS[u.role]?.includes(p) ?? false;
      },
    }),
    { name: "hms-auth" }
  )
);