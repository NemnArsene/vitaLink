import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, Permission } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";
import { AuthService, isStandaloneMode } from "@/services";

export type Theme = "light" | "dark";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  service: string;
  avatar?: string;
  token?: string;
  coreToken?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  theme: Theme;
  sidebarCollapsed: boolean;
  login: (user: AuthUser) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
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
      loginWithCredentials: async (email: string, password: string) => {
        try {
          const result = await AuthService.login(email, password);
          const roleMap: Record<string, Role> = {
            admin_hopital: "ROLE_ADMIN_HOSPITAL",
            medecin: "ROLE_DOCTOR",
            agent_accueil: "ROLE_RECEPTIONIST",
            infirmiere_triage: "ROLE_TRIAGE",
            laborantin: "ROLE_LABORATORY",
            infirmier_soins: "ROLE_NURSE",
            responsable_facturation: "ROLE_BILLING",
            directeur_hopital: "ROLE_DIRECTOR",
            pharmacien: "ROLE_PHARMACIST",
            // Keep uppercase mappings as fallback
            ADMIN_HOPITAL: "ROLE_ADMIN_HOSPITAL",
            MEDECIN: "ROLE_DOCTOR",
            RECEPTIONIST: "ROLE_RECEPTIONIST",
            TRIAGE: "ROLE_TRIAGE",
            LABORATORY: "ROLE_LABORATORY",
            CASHIER: "ROLE_CASHIER",
            NURSE: "ROLE_NURSE",
            BILLING: "ROLE_BILLING",
            DIRECTOR: "ROLE_DIRECTOR",
          };
          const rawRole = result.user.role || "";
          const apiUser: AuthUser = {
            id: result.user.id,
            firstName: result.user.prenom || result.user.email.split("@")[0],
            lastName: result.user.nom || "",
            email: result.user.email,
            role: roleMap[rawRole] || roleMap[rawRole.toUpperCase()] || ("ROLE_" + rawRole.toUpperCase()) as Role,
            service: result.user.service || "Général",
            token: result.accessToken,
          };

          // En mode gateway, on récupère aussi un token pour le core API
          if (!isStandaloneMode) {
            try {
              const { data } = await (await import("@/services/http")).coreHttpClient.post("/auth/login", { email, password });
              apiUser.coreToken = data.data.accessToken;
            } catch {
              console.warn("Impossible d'obtenir un token core API, les appels backend pourraient échouer");
            }
          }

          set({ user: apiUser, isAuthenticated: true });
        } catch {
          throw new Error("Échec de connexion");
        }
      },
      logout: async () => {
        try {
          await AuthService.logout();
        } catch (e) {
          console.error("Erreur lors de la déconnexion:", e);
        }
        set({ user: null, isAuthenticated: false });
      },
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
