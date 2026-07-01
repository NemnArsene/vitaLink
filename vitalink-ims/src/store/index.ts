import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role, AppSettings, Notification } from "../types";
import { AuthAPI } from "../api/http-client";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
  hasPermission: (permission: string) => boolean;
}

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  toggleDarkMode: () => void;
}

interface SettingsState {
  settings: AppSettings;
  notifications: Notification[];
  unreadCount: number;
  updateSettings: (s: Partial<AppSettings>) => void;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const defaultSettings: AppSettings = {
  reimbursementDelayDays: 5,
  autoApprovalThreshold: 150,
  copayDefault: 20,
  slaUrgentHours: 24,
  slaNormalHours: 72,
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  security: {
    sessionTimeout: 60,
    mfaRequired: true,
    passwordRotationDays: 90,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      token: null,
      login: (user, token) => set({ currentUser: user, isAuthenticated: true, token }),
      loginWithCredentials: async (email: string, password: string) => {
        const result = await AuthAPI.login(email, password);
        const user: User = {
          id: result.user.id,
          email: result.user.email,
          fullName: `${result.user.prenom} ${result.user.nom}`,
          role: `ROLE_${result.user.role}` as Role,
          department: result.user.role,
          active: true,
          lastLogin: new Date().toISOString(),
          permissions: ["*"],
          createdAt: "2023-01-15T08:00:00Z",
        };
        set({ currentUser: user, isAuthenticated: true, token: result.accessToken });
      },
      logout: () => set({ currentUser: null, isAuthenticated: false, token: null }),
      switchRole: (role) => {
        const user = get().currentUser;
        if (user) {
          set({ currentUser: { ...user, role } });
        }
      },
      hasPermission: (permission: string) => {
        const user = get().currentUser;
        if (!user) return false;
        if (user.permissions.includes("*")) return true;
        return user.permissions.includes(permission);
      },
    }),
    { name: "medisure-auth" }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebar: (open) => set({ sidebarOpen: open }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "medisure-ui" }
  )
);

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: defaultSettings,
  notifications: [],
  unreadCount: 0,
  updateSettings: (s) =>
    set((state) => ({ settings: { ...state.settings, ...s } })),
  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + (n.read ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
