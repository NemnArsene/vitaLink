import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Stethoscope, Activity, Receipt, Banknote,
  UserCog, Settings, LogOut, Menu, ChevronLeft, Heart, ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/Avatar";

const NAV = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, perm: null },
  { to: "/patients", label: "Patients", icon: Users, perm: "patient.read" as const },
  { to: "/consultations", label: "Consultations", icon: Stethoscope, perm: "consultation.read" as const },
  { to: "/acts", label: "Actes médicaux", icon: Activity, perm: "patient.read" as const },
  { to: "/billing", label: "Facturation", icon: Receipt, perm: "billing.read" as const },
  { to: "/refunds", label: "Remboursements", icon: Banknote, perm: "billing.refund" as const },
  { to: "/insurance", label: "Assurances", icon: ShieldCheck, perm: "billing.read" as const },
  { to: "/users", label: "Utilisateurs", icon: UserCog, perm: "user.manage" as const },
  { to: "/settings", label: "Paramètres", icon: Settings, perm: "settings.manage" as const },
];

export function Sidebar() {
  const user = useAuthStore(s => s.user);
  const collapsed = useAuthStore(s => s.sidebarCollapsed);
  const toggle = useAuthStore(s => s.toggleSidebar);
  const logout = useAuthStore(s => s.logout);
  const { can } = usePermission();
  const nav = useNavigate();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-[var(--border)]",
        collapsed ? "w-[68px]" : "w-64"
      )}
      style={{ background: "var(--surface)" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #0d9488 0%, #6366f1 100%)" }}>
            <Heart className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">MediCore</div>
              <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>HMS Platform</div>
            </div>
          )}
        </div>
        <button onClick={toggle} className="p-1 rounded-md hover:bg-[var(--surface-2)]">
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {NAV.map(item => {
            if (item.perm && !can(item.perm)) return null;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-[var(--primary-50)] text-[var(--primary-700)]"
                        : "hover:bg-[var(--surface-2)]",
                      collapsed && "justify-center"
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[var(--border)]">
        {user && (
          <div className={cn("flex items-center gap-3 p-2 rounded-lg", !collapsed && "bg-[var(--surface-2)]")}>
            <Avatar name={`${user.firstName} ${user.lastName}`} />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</div>
                <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                  {user.role.replace("ROLE_", "")}
                </div>
              </div>
            )}
            {!collapsed && (
              <button onClick={() => { logout(); nav("/login"); }} className="p-1.5 rounded-md hover:bg-[var(--surface)]" title="Déconnexion">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}