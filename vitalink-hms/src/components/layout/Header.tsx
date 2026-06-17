import { Search, Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

export function Header() {
  const user = useAuthStore(s => s.user);
  const toggle = useAuthStore(s => s.toggleSidebar);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border)] flex items-center px-4 lg:px-6 gap-3 glass">
      <button onClick={toggle} className="lg:hidden btn btn-ghost h-9 w-9 p-0" aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un patient, dossier, facture..."
          className="input pl-9 h-10"
        />
        <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono rounded border border-[var(--border)]" style={{ color: "var(--text-muted)" }}>
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative btn btn-ghost h-9 w-9 p-0" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[var(--surface)]" />
        </button>
        {user && (
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-[var(--border)]">
            <Badge variant="primary">{user.service}</Badge>
          </div>
        )}
      </div>
    </header>
  );
}