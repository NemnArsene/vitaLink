import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          <div className="mx-auto max-w-[1600px] fade-up">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}