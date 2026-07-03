import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Sun, Moon, Menu, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, useAuthStore, useSettingsStore } from "../../store";
import { useNotifications } from "../../hooks/useApi";
import { Avatar } from "../ui/States";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AuthService } from "../../services";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const user = useAuthStore((s) => s.currentUser);
  const { data: notifications = [] } = useNotifications();
  const markAsRead = useSettingsStore((s) => s.markAsRead);
  const markAllAsRead = useSettingsStore((s) => s.markAllAsRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {}
    logout();
    localStorage.removeItem("medisure-auth");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Rechercher un assuré, contrat, demande..."
              className="h-9 w-72 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-800"
              aria-label="Recherche globale"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* API Status pill */}
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 md:flex dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          API Gateway OK
        </div>

        <button
          onClick={toggleDarkMode}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
          aria-label="Basculer mode sombre"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} aria-hidden />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-40 w-96 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-medium text-brand-600 hover:underline">
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-12 text-center text-sm text-slate-500">Aucune notification</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={cn(
                            "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50",
                            !n.read && "bg-brand-50/40 dark:bg-brand-950/20"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                            n.type === "error" && "bg-rose-500",
                            n.type === "warning" && "bg-amber-500",
                            n.type === "success" && "bg-emerald-500",
                            n.type === "info" && "bg-cyan-500"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Avatar name={user?.fullName || "User"} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500">{user?.department}</p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
          </button>

          <AnimatePresence>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} aria-hidden />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-40 w-64 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar name={user?.fullName || "User"} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge variant="brand" dot>{user?.role.replace("ROLE_", "").replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}