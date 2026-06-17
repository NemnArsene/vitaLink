import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";

import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Consultations from "@/pages/Consultations";
import Acts from "@/pages/Acts";
import Billing from "@/pages/Billing";
import Refunds from "@/pages/Refunds";
import Insurance from "@/pages/Insurance";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuthenticated);
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

function ThemedApp() {
  useTheme();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="acts" element={<Acts />} />
        <Route path="billing" element={<Billing />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="insurance" element={<Insurance />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemedApp />
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
}