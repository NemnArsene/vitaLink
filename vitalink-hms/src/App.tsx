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
import Triage from "@/pages/Triage";
import Laboratory from "@/pages/Laboratory";
import Nursing from "@/pages/Nursing";
import Cashier from "@/pages/Cashier";
import Personnel from "@/pages/Personnel";
import Tarifs from "@/pages/Tarifs";
import Ordonnances from "@/pages/Ordonnances";
import WrittenReports from "@/pages/WrittenReports";
import Reports from "@/pages/Reports";
import Messages from "@/pages/Messages";
import AuditLog from "@/pages/AuditLog";
import Pharmacie from "@/pages/Pharmacie";

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
        <Route path="triage" element={<Triage />} />
        <Route path="laboratory" element={<Laboratory />} />
        <Route path="nursing" element={<Nursing />} />
        <Route path="cashier" element={<Cashier />} />
        <Route path="personnel" element={<Personnel />} />
        <Route path="tarifs" element={<Tarifs />} />
        <Route path="ordonnances" element={<Ordonnances />} />
        <Route path="reports" element={<Reports />} />
        <Route path="written-reports" element={<WrittenReports />} />
        <Route path="messages" element={<Messages />} />
        <Route path="users" element={<Users />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="pharmacie" element={<Pharmacie />} />
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