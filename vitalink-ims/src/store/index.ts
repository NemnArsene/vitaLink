import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role, AppSettings, Notification } from "../types";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
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

// Sample user for demo
const sampleUser: User = {
  id: "USR-0001",
  email: "sophie.morel@medisure.fr",
  fullName: "Sophie Morel",
  role: "ROLE_DIRECTOR",
  department: "Direction",
  active: true,
  lastLogin: new Date().toISOString(),
  permissions: ["*"],
  createdAt: "2023-01-15T08:00:00Z",
};

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
      currentUser: sampleUser,
      isAuthenticated: true,
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
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