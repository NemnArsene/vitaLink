import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useUIStore } from "./store";
import { useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Insureds } from "./pages/Insureds";
import { Contracts } from "./pages/Contracts";
import { Guarantees } from "./pages/Guarantees";
import { Hospitals } from "./pages/Hospitals";
import { Claims } from "./pages/Claims";
import { Reports } from "./pages/Reports";
import { Users } from "./pages/Users";
import { RBAC } from "./pages/RBAC";
import { Settings } from "./pages/Settings";
import { Activity } from "./pages/Activity";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const darkMode = useUIStore((s) => s.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/insureds" element={<Insureds />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/guarantees" element={<Guarantees />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="/rbac" element={<RBAC />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/activity" element={<Activity />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}