import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types";

export function usePermission() {
  const hasPermission = useAuthStore(s => s.hasPermission);
  const user = useAuthStore(s => s.user);
  return {
    user,
    can: (p: Permission) => hasPermission(p),
    is: (...roles: string[]) => !!user && roles.includes(user.role),
    isAdmin: user?.role === "ROLE_ADMIN_HOSPITAL",
    isDirector: user?.role === "ROLE_DIRECTOR",
    isDoctor: user?.role === "ROLE_DOCTOR",
    isNurse: user?.role === "ROLE_NURSE",
    isBilling: user?.role === "ROLE_BILLING",
  };
}