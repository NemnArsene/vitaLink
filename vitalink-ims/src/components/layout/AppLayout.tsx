import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, MobileOverlay } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useUIStore } from "../../store";

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-40 lg:hidden"
          >
            <Sidebar onClose={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {mobileOpen && <MobileOverlay />}

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-[72px]"}`}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}