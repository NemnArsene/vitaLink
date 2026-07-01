import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsuredsAPI } from "../api/http-client";
import type {
  Insured,
  Contract,
  Guarantee,
  Hospital,
  ReimbursementClaim,
} from "../types";

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

export function useInsureds() {
  return useQuery({
    queryKey: QK.insureds,
    queryFn: InsuredsAPI.list,
    select: (data: any) => {
      if (!data) return [];
      const raw = Array.isArray(data) ? data : data.data || data.results || [];
      return raw.map(mapInsured);
    },
  });
}

export function useInsured(id: string) {
  return useQuery({
    queryKey: QK.insured(id),
    queryFn: () => InsuredsAPI.get(id),
    enabled: !!id,
    select: mapInsured,
  });
}

export function useCreateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: InsuredsAPI.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

export function useUpdateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Insured> }) =>
      InsuredsAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

export function useDeleteInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: InsuredsAPI.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

function mapInsured(raw: any): Insured {
  return {
    id: raw._id || raw.id,
    matricule: raw.insuredNumber || raw.matricule || "",
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    email: raw.email || "",
    phone: raw.phone || "",
    birthDate: raw.dateOfBirth || raw.birthDate || new Date().toISOString(),
    gender: raw.gender || "M",
    maritalStatus: raw.maritalStatus || "single",
    address: typeof raw.address === "object" ? raw.address?.street || "" : raw.address || "",
    city: typeof raw.address === "object" ? raw.address?.city || "" : raw.city || "",
    postalCode: typeof raw.address === "object" ? raw.address?.zipCode || "" : raw.postalCode || "",
    socialSecurityNumber: raw.socialSecurityNumber || raw.insuranceCardNumber || "",
    contractId: raw.policyId || raw.contractId || "",
    joinDate: raw.dateAffiliation || raw.joinDate || new Date().toISOString(),
    status: raw.statut === "actif" ? "active" : raw.statut === "inactif" ? "terminated" : raw.statut === "suspendu" ? "suspended" : raw.status || "pending",
    dependents: raw.dependents || 0,
    totalReimbursements: raw.totalReimbursements || 0,
    riskScore: raw.riskScore || 10,
  } as Insured;
}

// ============= Contracts =============
export function useContracts() {
  return useQuery({
    queryKey: QK.contracts,
    queryFn: async () => [] as Contract[],
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => data,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contract> }) => data,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {},
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

// ============= Guarantees =============
export function useGuarantees() {
  return useQuery({
    queryKey: QK.guarantees,
    queryFn: async () => [] as Guarantee[],
  });
}

export function useUpdateGuarantee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Guarantee> }) => data,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.guarantees }),
  });
}

// ============= Hospitals =============
export function useHospitals() {
  return useQuery({
    queryKey: QK.hospitals,
    queryFn: async () => [] as Hospital[],
  });
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: QK.hospital(id),
    queryFn: async () => null,
    enabled: !!id,
  });
}

export function useUpdateHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Hospital> }) => data,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.hospitals }),
  });
}

// ============= Conventions =============
export function useConventions() {
  return useQuery({
    queryKey: QK.conventions,
    queryFn: async () => [],
  });
}

// ============= Claims =============
export function useClaims() {
  return useQuery({
    queryKey: QK.claims,
    queryFn: async () => [] as ReimbursementClaim[],
  });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: QK.claim(id),
    queryFn: async () => null,
    enabled: !!id,
  });
}

export function useUpdateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReimbursementClaim> }) => data,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.claims }),
  });
}

export function useProcessClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: "approve" | "reject" | "dispute" | "pay"; comment?: string }) => {},
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.claims }),
  });
}

// ============= Users =============
export function useUsers() {
  return useQuery({
    queryKey: QK.users,
    queryFn: async () => [],
  });
}

// ============= Activity =============
export function useActivity() {
  return useQuery({
    queryKey: QK.activity,
    queryFn: async () => [],
  });
}

// ============= Notifications =============
export function useNotifications() {
  return useQuery({
    queryKey: QK.notifications,
    queryFn: async () => [],
  });
}

// ============= Dashboard =============
export function useKPIs() {
  return useQuery({
    queryKey: QK.kpis,
    queryFn: async () => [],
  });
}

export function useCharts() {
  return useQuery({
    queryKey: QK.charts,
    queryFn: async () => ({}),
  });
}
