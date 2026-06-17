import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../mocks/api";
import type {
  Insured,
  Contract,
  Guarantee,
  Hospital,
  ReimbursementClaim,
} from "../types";

// Query keys
export const QK = {
  insureds: ["insureds"] as const,
  insured: (id: string) => ["insureds", id] as const,
  contracts: ["contracts"] as const,
  contract: (id: string) => ["contracts", id] as const,
  guarantees: ["guarantees"] as const,
  hospitals: ["hospitals"] as const,
  hospital: (id: string) => ["hospitals", id] as const,
  conventions: ["conventions"] as const,
  claims: ["claims"] as const,
  claim: (id: string) => ["claims", id] as const,
  users: ["users"] as const,
  activity: ["activity"] as const,
  notifications: ["notifications"] as const,
  kpis: ["kpis"] as const,
  charts: ["charts"] as const,
};

// ============= Insureds =============
export function useInsureds() {
  return useQuery({
    queryKey: QK.insureds,
    queryFn: api.insureds.list,
  });
}

export function useInsured(id: string) {
  return useQuery({
    queryKey: QK.insured(id),
    queryFn: () => api.insureds.get(id),
    enabled: !!id,
  });
}

export function useCreateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.insureds.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

export function useUpdateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Insured> }) =>
      api.insureds.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

export function useDeleteInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.insureds.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

// ============= Contracts =============
export function useContracts() {
  return useQuery({ queryKey: QK.contracts, queryFn: api.contracts.list });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.contracts.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) =>
      api.contracts.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.contracts.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

// ============= Guarantees =============
export function useGuarantees() {
  return useQuery({ queryKey: QK.guarantees, queryFn: api.guarantees.list });
}

export function useUpdateGuarantee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Guarantee> }) =>
      api.guarantees.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.guarantees }),
  });
}

// ============= Hospitals =============
export function useHospitals() {
  return useQuery({ queryKey: QK.hospitals, queryFn: api.hospitals.list });
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: QK.hospital(id),
    queryFn: () => api.hospitals.get(id),
    enabled: !!id,
  });
}

export function useUpdateHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Hospital> }) =>
      api.hospitals.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.hospitals }),
  });
}

// ============= Conventions =============
export function useConventions() {
  return useQuery({ queryKey: QK.conventions, queryFn: api.conventions.list });
}

// ============= Claims =============
export function useClaims() {
  return useQuery({ queryKey: QK.claims, queryFn: api.claims.list });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: QK.claim(id),
    queryFn: () => api.claims.get(id),
    enabled: !!id,
  });
}

export function useUpdateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReimbursementClaim> }) =>
      api.claims.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.claims }),
  });
}

export function useProcessClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, comment }: { id: string; action: "approve" | "reject" | "dispute" | "pay"; comment?: string }) =>
      api.claims.process(id, action, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.claims }),
  });
}

// ============= Users =============
export function useUsers() {
  return useQuery({ queryKey: QK.users, queryFn: api.users.list });
}

// ============= Activity =============
export function useActivity() {
  return useQuery({ queryKey: QK.activity, queryFn: api.activity.list });
}

// ============= Notifications =============
export function useNotifications() {
  return useQuery({ queryKey: QK.notifications, queryFn: api.notifications.list });
}

// ============= Dashboard =============
export function useKPIs() {
  return useQuery({ queryKey: QK.kpis, queryFn: api.dashboard.kpis });
}

export function useCharts() {
  return useQuery({ queryKey: QK.charts, queryFn: api.dashboard.charts });
}