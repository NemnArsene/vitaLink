import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Receipt, Banknote, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/billing", label: "Factures", icon: Receipt },
  { to: "/refunds", label: "Rembours.", icon: Banknote },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] glass">
      <div className="grid grid-cols-5">
        {ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition",
              isActive ? "text-[var(--primary)]" : ""
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}