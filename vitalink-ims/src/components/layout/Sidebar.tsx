import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { useUIStore, useAuthStore } from "../../store";
import {
  LayoutDashboard, Users, FileText, ShieldCheck, Building2,
  Receipt, BarChart3, UserCog, KeyRound, Settings, Activity, X, ChevronLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, section: "Pilotage" },
  { to: "/insureds", label: "Assurés", icon: Users, section: "Pilotage" },
  { to: "/contracts", label: "Contrats", icon: FileText, section: "Pilotage" },
  { to: "/guarantees", label: "Garanties", icon: ShieldCheck, section: "Pilotage" },
  { to: "/hospitals", label: "Réseau Hôpitaux", icon: Building2, section: "Réseau" },
  { to: "/claims", label: "Remboursements", icon: Receipt, badge: "12", section: "Réseau" },
  { to: "/reports", label: "Reporting", icon: BarChart3, section: "Analyse" },
  { to: "/activity", label: "Activité", icon: Activity, section: "Analyse" },
  { to: "/users", label: "Utilisateurs", icon: UserCog, section: "Administration" },
  { to: "/rbac", label: "RBAC", icon: KeyRound, section: "Administration" },
  { to: "/settings", label: "Paramètres", icon: Settings, section: "Administration" },
];

const sectionOrder = ["Pilotage", "Réseau", "Analyse", "Administration"];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.currentUser);

  const grouped = sectionOrder.map((section) => ({
    section,
    items: navItems.filter((i) => i.section === section),
  }));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out",
        "dark:border-slate-800 dark:bg-slate-950",
        sidebarOpen ? "w-64" : "w-[72px]"
      )}
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">MediSure</p>
                <p className="text-[10px] font-medium text-slate-500">Assurance Santé</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {sidebarOpen ? (
          <button
            onClick={toggleSidebar}
            className="hidden shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:block dark:hover:bg-slate-800"
            aria-label="Réduire la barre latérale"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {grouped.map((group) => (
          <div key={group.section} className="mb-6">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                >
                  {group.section}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                      !sidebarOpen && "justify-center"
                    )
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-brand-600"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brand-600 dark:text-brand-400")} />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            className="flex-1 truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {sidebarOpen && item.badge && (
                        <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                      {!sidebarOpen && item.badge && (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        {user && (
          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900",
              !sidebarOpen && "justify-center"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white">
              {user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{user.role.replace("ROLE_", "").replace(/_/g, " ")}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>
        )}
      </div>
    </aside>
  );
}

export function MobileOverlay() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  if (!sidebarOpen) return null;
  return <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" aria-hidden />;
}