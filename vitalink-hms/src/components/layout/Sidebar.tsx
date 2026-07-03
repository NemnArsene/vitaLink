import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Stethoscope, Activity, Receipt, Banknote,
  UserCog, Settings, LogOut, Menu, ChevronLeft, Heart, ShieldCheck, ListChecks, FlaskConical, Thermometer, Wallet,
  FileText, Tag, BarChart3, MessageSquare, ScrollText
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/utils/cn";

const NAV_GROUPS = [
  {
    title: "Accueil",
    items: [
      { to: "/", label: "Tableau de bord", icon: LayoutDashboard, perm: null },
      { to: "/patients", label: "Patients", icon: Users, perm: "patient.read" as const },
      { to: "/triage", label: "Triage", icon: ListChecks, perm: "triage.read" as const },
    ]
  },
  {
    title: "Médical",
    items: [
      { to: "/consultations", label: "Consultations", icon: Stethoscope, perm: "consultation.read" as const },
      { to: "/ordonnances", label: "Ordonnances", icon: FileText, perm: "consultation.write" as const },
      { to: "/laboratory", label: "Laboratoire", icon: FlaskConical, perm: "laboratory.read" as const },
      { to: "/nursing", label: "Soins infirmiers", icon: Thermometer, perm: "nursing.read" as const },
      { to: "/acts", label: "Actes & Examens", icon: Activity, perm: "patient.read" as const },
    ]
  },
  {
    title: "Finance",
    items: [
      { to: "/cashier", label: "Caisse", icon: Wallet, perm: "billing.write" as const },
      { to: "/billing", label: "Facturation", icon: Receipt, perm: "billing.read" as const },
      { to: "/refunds", label: "Remboursements", icon: Banknote, perm: "billing.refund" as const },
      { to: "/insurance", label: "Assurances", icon: ShieldCheck, perm: "billing.read" as const },
      { to: "/tarifs", label: "Tarifs", icon: Tag, perm: "settings.manage" as const },
    ]
  },
  {
    title: "Collaboration",
    items: [
      { to: "/messages", label: "Messages", icon: MessageSquare, perm: null },
      { to: "/written-reports", label: "Rapports écrits", icon: FileText, perm: null },
    ]
  },
  {
    title: "Administration",
    items: [
      { to: "/personnel", label: "Personnel", icon: UserCog, perm: "user.manage" as const },
      { to: "/users", label: "Utilisateurs", icon: ShieldCheck, perm: "user.manage" as const },
      { to: "/reports", label: "Rapports", icon: BarChart3, perm: "report.view" as const },
      { to: "/audit", label: "Audit", icon: ScrollText, perm: "audit.read.extended" as const },
      { to: "/settings", label: "Paramètres", icon: Settings, perm: "settings.manage" as const },
    ]
  }
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
        collapsed ? "w-[72px]" : "w-64"
      )}
      style={{ background: "var(--surface)" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            <Heart className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">MediCore</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">HMS Platform</div>
            </div>
          )}
        </div>
        <button onClick={toggle} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          // Filtrer les items selon les permissions
          const visibleItems = group.items.filter(item => !item.perm || can(item.perm));
          
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-6">
              {!collapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {group.title}
                </div>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map(item => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                          collapsed && "justify-center"
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-emerald-500" />
                          )}
                          <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-emerald-600 dark:text-emerald-400")} />
                          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[var(--border)] shrink-0">
        {user && (
          <div className={cn("flex items-center gap-3 p-2 rounded-lg transition-colors", !collapsed && "hover:bg-slate-50 dark:hover:bg-slate-900")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white shadow-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user.firstName} {user.lastName}</div>
                <div className="text-[10px] truncate font-medium text-slate-500">
                  {user.role.replace("ROLE_", "").replace(/_/g, " ")}
                </div>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={() => { logout(); nav("/login"); }} 
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" 
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}