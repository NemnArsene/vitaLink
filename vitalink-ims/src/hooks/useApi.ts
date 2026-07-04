import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsuredsService } from "../services";
import type {
  Insured,
  Contract,
  Guarantee,
  Hospital,
  Notification,
  ReimbursementClaim,
  DashboardKPI,
  ChartDataPoint,
  ActivityLog,
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
    queryFn: InsuredsService.list,
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
    queryFn: () => InsuredsService.getById(id),
    enabled: !!id,
    select: mapInsured,
  });
}

export function useCreateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: InsuredsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

export function useUpdateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Insured> }) =>
      InsuredsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
  });
}

export function useDeleteInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: InsuredsService.remove,
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

// ============= Dashboard mock data =============

const MOCK_KPIS: DashboardKPI[] = [
  { label: "Demandes reçues", value: 2847, format: "number", change: 12.5, trend: "up", icon: "FileText", color: "brand" },
  { label: "Montant total remboursé", value: 48500000, format: "currency", change: 8.3, trend: "up", icon: "Wallet", color: "emerald" },
  { label: "Assurés actifs", value: 15342, format: "number", change: 3.2, trend: "up", icon: "Users", color: "violet" },
  { label: "Taux d'approbation", value: 78.5, format: "percent", change: 4.1, trend: "up", icon: "CheckCircle2", color: "emerald" },
  { label: "Délai moyen traitement", value: 4.2, format: "number", change: 12.8, trend: "down", icon: "Timer", color: "amber" },
  { label: "Demandes en attente", value: 342, format: "number", change: 5.7, trend: "up", icon: "Clock", color: "amber" },
  { label: "Hôpitaux partenaires", value: 48, format: "number", change: 2.0, trend: "up", icon: "Building2", color: "cyan" },
  { label: "Économies réalisées", value: 6200000, format: "currency", change: 7.2, trend: "up", icon: "TrendingUp", color: "rose" },
];

const MOCK_CLAIMS: ReimbursementClaim[] = [
  { id: "cl-001", reference: "CLAIM-2026-001", insuredId: "ins-001", contractId: "POL-2026-001234", hospitalId: "hosp-001", submissionDate: new Date(Date.now() - 3600000 * 2).toISOString(), treatmentDate: new Date(Date.now() - 86400000 * 3).toISOString(), medicalAct: "Consultation générale", medicalActCode: "CSG001", description: "Consultation générale de routine", claimedAmount: 25000, approvedAmount: 20000, copayAmount: 5000, status: "approved", priority: "normal", documents: [], processingDays: 2, slaDeadline: new Date(Date.now() + 86400000 * 5).toISOString(), history: [] },
  { id: "cl-002", reference: "CLAIM-2026-002", insuredId: "ins-002", contractId: "POL-2026-001235", hospitalId: "hosp-002", submissionDate: new Date(Date.now() - 3600000 * 5).toISOString(), treatmentDate: new Date(Date.now() - 86400000 * 4).toISOString(), medicalAct: "Analyse sanguine", medicalActCode: "LAB001", description: "Bilan sanguin complet", claimedAmount: 18000, approvedAmount: 0, copayAmount: 0, status: "under_review", priority: "normal", documents: [], processingDays: 1, slaDeadline: new Date(Date.now() + 86400000 * 7).toISOString(), history: [] },
  { id: "cl-003", reference: "CLAIM-2026-003", insuredId: "ins-001", contractId: "POL-2026-001234", hospitalId: "hosp-001", submissionDate: new Date(Date.now() - 86400000 * 2).toISOString(), treatmentDate: new Date(Date.now() - 86400000 * 5).toISOString(), medicalAct: "Radio thoracique", medicalActCode: "IMG002", description: "Radiographie pulmonaire", claimedAmount: 35000, approvedAmount: 31500, copayAmount: 3500, status: "paid", priority: "normal", documents: [], processingDays: 1, slaDeadline: new Date(Date.now() + 86400000 * 3).toISOString(), history: [] },
  { id: "cl-004", reference: "CLAIM-2026-004", insuredId: "ins-003", contractId: "POL-2026-001236", hospitalId: "hosp-003", submissionDate: new Date(Date.now() - 7200000).toISOString(), treatmentDate: new Date(Date.now() - 86400000).toISOString(), medicalAct: "Hospitalisation", medicalActCode: "HOSP001", description: "Hospitalisation 5 jours", claimedAmount: 250000, approvedAmount: 0, copayAmount: 0, status: "received", priority: "high", documents: [], processingDays: 0, slaDeadline: new Date(Date.now() + 86400000 * 10).toISOString(), history: [] },
  { id: "cl-005", reference: "CLAIM-2026-005", insuredId: "ins-002", contractId: "POL-2026-001235", hospitalId: "hosp-002", submissionDate: new Date(Date.now() - 86400000 * 3).toISOString(), treatmentDate: new Date(Date.now() - 86400000 * 6).toISOString(), medicalAct: "Médicaments prescrits", medicalActCode: "PHAR001", description: "Antibiotiques prescrits", claimedAmount: 12500, approvedAmount: 0, copayAmount: 0, status: "rejected", priority: "low", rejectionReason: "Hors liste des médicaments remboursables", documents: [], processingDays: 1, slaDeadline: new Date(Date.now() + 86400000 * 2).toISOString(), history: [] },
];

const MOCK_HOSPITALS: Hospital[] = [
  { id: "hosp-001", name: "Hôpital Général de Dakar", code: "HGD", type: "public", tier: 1, address: "Avenue Nelson Mandela", city: "Dakar", postalCode: "10000", phone: "+221 33 825 10 10", email: "contact@hgd.sn", director: "Pr. Fall", bedCapacity: 350, specialties: ["Médecine générale", "Chirurgie", "Pédiatrie"], conventionId: "conv-001", conventionStatus: "active", pricingDiscount: 15, rating: 4.2, totalClaims: 1240, averageProcessingDays: 3, joinDate: "2020-01-01", active: true },
  { id: "hosp-002", name: "Clinique de la Madeleine", code: "CM", type: "clinic", tier: 2, address: "Rue 5 x Rue 8", city: "Dakar", postalCode: "10001", phone: "+221 33 889 50 00", email: "contact@cm.sn", director: "Dr. Diop", bedCapacity: 120, specialties: ["Cardiologie", "Radiologie"], conventionId: "conv-002", conventionStatus: "active", pricingDiscount: 10, rating: 4.5, totalClaims: 890, averageProcessingDays: 2, joinDate: "2021-06-15", active: true },
  { id: "hosp-003", name: "Hôpital Principal de Dakar", code: "HPD", type: "public", tier: 1, address: "Avenue Cheikh Anta Diop", city: "Dakar", postalCode: "10002", phone: "+221 33 821 15 15", email: "contact@hpd.sn", director: "Pr. Ndiaye", bedCapacity: 250, specialties: ["Urgences", "Traumatologie", "Neurologie"], conventionId: "conv-003", conventionStatus: "active", pricingDiscount: 12, rating: 4.0, totalClaims: 760, averageProcessingDays: 4, joinDate: "2019-11-01", active: true },
];

const MOCK_ACTIVITY: ActivityLog[] = [
  { id: "act-001", timestamp: new Date(Date.now() - 600000).toISOString(), actor: "Dr. Mbaye", action: "a approuvé la demande cl-001", module: "claims", severity: "success" },
  { id: "act-002", timestamp: new Date(Date.now() - 1800000).toISOString(), actor: "Agent Diallo", action: "a rejeté la demande cl-005", module: "claims", severity: "error" },
  { id: "act-003", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Système", action: "nouvelle demande reçue de HGD", module: "gateway", severity: "info" },
  { id: "act-004", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "Agent Kone", action: "a mis en révision la demande cl-002", module: "claims", severity: "warning" },
  { id: "act-005", timestamp: new Date(Date.now() - 86400000).toISOString(), actor: "Système", action: "synchronisation Gateway terminée", module: "gateway", severity: "success" },
  { id: "act-006", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), actor: "Agent Ndiaye", action: "a effectué le paiement de cl-003", module: "claims", severity: "success" },
  { id: "act-007", timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), actor: "Dr. Seck", action: "a mis à jour le plafond de INS-001", module: "insureds", severity: "info" },
];

const MOCK_CHARTS = {
  monthlyClaims: [
    { date: "Jan", value: 180 }, { date: "Fév", value: 220 }, { date: "Mar", value: 190 },
    { date: "Avr", value: 260 }, { date: "Mai", value: 310 }, { date: "Juin", value: 280 },
    { date: "Juil", value: 340 }, { date: "Aoû", value: 290 }, { date: "Sep", value: 370 },
    { date: "Oct", value: 410 }, { date: "Nov", value: 390 }, { date: "Déc", value: 350 },
  ] as ChartDataPoint[],
  claimsByStatus: [
    { date: "Reçue", category: "received", value: 89 },
    { date: "En révision", category: "under_review", value: 145 },
    { date: "Approuvée", category: "approved", value: 623 },
    { date: "Rejetée", category: "rejected", value: 87 },
    { date: "Remboursée", category: "paid", value: 412 },
  ] as ChartDataPoint[],
  revenueEvolution: [
    { date: "Jan", value: 3200000 }, { date: "Fév", value: 4100000 }, { date: "Mar", value: 3800000 },
    { date: "Avr", value: 5200000 }, { date: "Mai", value: 6100000 }, { date: "Juin", value: 5800000 },
    { date: "Juil", value: 6900000 }, { date: "Aoû", value: 5500000 }, { date: "Sep", value: 7300000 },
    { date: "Oct", value: 8200000 }, { date: "Nov", value: 7800000 }, { date: "Déc", value: 8500000 },
  ] as ChartDataPoint[],
  hospitalRanking: [
    { date: "Hôpital Général de Dakar", value: 1240 },
    { date: "Clinique de la Madeleine", value: 890 },
    { date: "Hôpital Principal de Dakar", value: 760 },
    { date: "Centre Hospitalier Fann", value: 540 },
    { date: "Hôpital Militaire Ouakam", value: 380 },
  ] as ChartDataPoint[],
  claimsByType: [
    { date: "Consultations", value: 420 },
    { date: "Hospitalisations", value: 180 },
    { date: "Pharmacie", value: 310 },
    { date: "Radiologie", value: 95 },
    { date: "Laboratoire", value: 150 },
  ] as ChartDataPoint[],
};

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
    queryFn: async () => MOCK_HOSPITALS as Hospital[],
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
    queryFn: async () => MOCK_CLAIMS as ReimbursementClaim[],
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
    queryFn: async () => MOCK_ACTIVITY as ActivityLog[],
  });
}

// ============= Notifications =============
export function useNotifications() {
  return useQuery({
    queryKey: QK.notifications,
    queryFn: async () => [] as Notification[],
  });
}

// ============= Dashboard =============
export function useKPIs() {
  return useQuery({
    queryKey: QK.kpis,
    queryFn: async () => MOCK_KPIS,
  });
}

export function useCharts() {
  return useQuery({
    queryKey: QK.charts,
    queryFn: async () => MOCK_CHARTS,
  });
}
