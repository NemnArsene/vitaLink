import { Search, Bell, Menu, CheckCircle, AlertTriangle, Info, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";

const ICONS: Record<string, typeof Bell> = { success: CheckCircle, warning: AlertTriangle, info: Info, login: LogIn };

export function Header() {
  const user = useAuthStore(s => s.user);
  const toggle = useAuthStore(s => s.toggleSidebar);
  const [query, setQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications: notifs, unread, markAllRead, markRead } = useNotifications();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/patients?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border)] flex items-center px-4 lg:px-6 gap-3 glass">
      <button onClick={toggle} className="lg:hidden btn btn-ghost h-9 w-9 p-0" aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Rechercher un patient, dossier, facture..."
          className="input pl-9 h-10"
        />
        <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono rounded border border-[var(--border)]" style={{ color: "var(--text-muted)" }}>
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)} className="relative btn btn-ghost h-9 w-9 p-0" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[var(--surface)]" />}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden" style={{ maxHeight: 360 }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && <button className="text-xs" style={{ color: "var(--primary)" }} onClick={markAllRead}>Tout marquer lu</button>}
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                {notifs.length === 0 && <div className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>Aucune notification</div>}
                {notifs.map(n => {
                  const Icon = ICONS[n.type] || Info;
                  return (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--surface-2)] ${!n.read ? "bg-[var(--primary-50)]" : ""}`}
                      onClick={() => { markRead(n.id); setShowNotif(false); }}>
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === "success" ? "bg-green-50 text-green-600" : n.type === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs">{n.message}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{n.time}</div>
                      </div>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0 mt-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {user && (
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-[var(--border)]">
            <Badge variant="primary">{user.service}</Badge>
          </div>
        )}
      </div>
    </header>
  );
}
