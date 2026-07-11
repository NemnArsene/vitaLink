import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsuredsService, PoliciesService, HospitalsService, ClaimsService, ReportsService, InvoicesService } from "../services";
import { useAuthStore } from "../store";
import type { Insured, Contract, Guarantee, Hospital, Notification, ReimbursementClaim, DashboardKPI, ChartDataPoint, ActivityLog } from "../types";

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
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoices", id] as const,
  users: ["users"] as const,
  activity: ["activity"] as const,
  notifications: ["notifications"] as const,
  kpis: ["kpis"] as const,
  charts: ["charts"] as const,
};

// ============= Insureds (already on real API) =============

export function useInsureds() {
  return useQuery({
    queryKey: QK.insureds,
    queryFn: InsuredsService.list,
  });
}

export function useInsured(id: string) {
  return useQuery({
    queryKey: QK.insured(id),
    queryFn: () => InsuredsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: InsuredsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
    onError: (err: any) => {
      console.error("Create insured error:", err.response?.data);
      import("sonner").then(({ toast }) => {
        const details = err.response?.data?.details;
        const msg = details ? (Array.isArray(details) ? details.join(", ") : String(details)) : err.response?.data?.message || err.message;
        toast.error(`Erreur validation : ${msg}`);
      });
    },
  });
}

export function useUpdateInsured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Insured> }) => InsuredsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.insureds }),
    onError: (err: any) => {
      console.error("Update insured error:", err.response?.data);
      import("sonner").then(({ toast }) => {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Erreur mise à jour : ${msg}`);
      });
    },
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

// ============= Contracts (via Policies API) =============

export function useContracts() {
  return useQuery({
    queryKey: QK.contracts,
    queryFn: PoliciesService.list,
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: QK.contract(id),
    queryFn: () => PoliciesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: PoliciesService.create,
    onSuccess: (newContract) => {
      qc.setQueryData<Contract[]>(QK.contracts, (old) =>
        old ? [...old, newContract as Contract] : [newContract as Contract]
      );
      qc.invalidateQueries({ queryKey: QK.contracts });
    },
    onError: (err: any) => {
      console.error("Create contract error:", err.response?.data);
      import("sonner").then(({ toast }) => {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Erreur création contrat : ${msg}`);
      }).catch(console.error);
    },
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) => PoliciesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: PoliciesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contracts }),
  });
}

// ============= Guarantees =============
// No separate endpoint in API; data comes embedded in policies.
// We keep a curated list for reference.

let guaranteesCache: Guarantee[] | null = null;
const INITIAL_GUARANTEES: Guarantee[] = [
  { id: "grt-001", code: "HOSP", name: "Hospitalisation", description: "Prise en charge des frais d'hospitalisation, chirurgie et soins intensifs", type: "hospitalization", ceiling: 5000000, usedAmount: 1250000, copayPercent: 10, waitingDays: 30, exclusions: ["Chirurgie esthétique", "Traitements expérimentaux"], included: true, icon: "Building2" },
  { id: "grt-002", code: "CONS", name: "Consultations", description: "Consultations généralistes et spécialistes en ville et à l'hôpital", type: "consultation", ceiling: 500000, usedAmount: 180000, copayPercent: 20, waitingDays: 0, exclusions: ["Médecine non conventionnelle"], included: true, icon: "Stethoscope" },
  { id: "grt-003", code: "PHARM", name: "Pharmacie", description: "Médicaments prescrits remboursables sur ordonnance", type: "pharmacy", ceiling: 300000, usedAmount: 95000, copayPercent: 15, waitingDays: 0, exclusions: ["Médicaments en vente libre", "Compléments alimentaires"], included: true, icon: "Pill" },
  { id: "grt-004", code: "DENT", name: "Dentaire", description: "Soins dentaires, prothèses et orthodontie", type: "dental", ceiling: 400000, usedAmount: 60000, copayPercent: 25, waitingDays: 90, exclusions: ["Orthodontie esthétique", "Blanchiment"], included: true, icon: "Smile" },
  { id: "grt-005", code: "OPT", name: "Optique", description: "Lunettes, lentilles et chirurgie réfractive", type: "optical", ceiling: 250000, usedAmount: 120000, copayPercent: 30, waitingDays: 60, exclusions: ["Lentilles cosmétiques"], included: true, icon: "Glasses" },
  { id: "grt-006", code: "MAT", name: "Maternité", description: "Suivi de grossesse, accouchement et soins néonatals", type: "maternity", ceiling: 2000000, usedAmount: 0, copayPercent: 0, waitingDays: 270, exclusions: ["Fécondation in vitro"], included: true, icon: "Baby" },
  { id: "grt-007", code: "LAB", name: "Analyses", description: "Analyses de laboratoire et tests diagnostiques", type: "laboratory", ceiling: 200000, usedAmount: 45000, copayPercent: 10, waitingDays: 0, exclusions: [], included: true, icon: "TestTube" },
  { id: "grt-008", code: "IMG", name: "Imagerie", description: "Radiologie, échographie, scanner et IRM", type: "imaging", ceiling: 600000, usedAmount: 210000, copayPercent: 15, waitingDays: 0, exclusions: ["Imagerie à but esthétique"], included: true, icon: "ScanLine" },
];

export function useGuarantees() {
  return useQuery({
    queryKey: QK.guarantees,
    queryFn: async () => {
      if (!guaranteesCache) guaranteesCache = [...INITIAL_GUARANTEES];
      return guaranteesCache;
    },
    staleTime: Infinity,
  });
}

export function useCreateGuarantee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Guarantee, "id"> & { id?: string }) => {
      const newGuarantee: Guarantee = { ...data, id: data.id || `grt-${Date.now()}` } as Guarantee;
      return newGuarantee;
    },
    onSuccess: (result) => {
      qc.setQueryData<Guarantee[]>(QK.guarantees, (old) => {
        const list = old || INITIAL_GUARANTEES;
        if (!guaranteesCache) guaranteesCache = [...list];
        guaranteesCache.push(result);
        return [...guaranteesCache];
      });
    },
  });
}

export function useUpdateGuarantee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Guarantee> }) => ({ id, data }),
    onSuccess: ({ id, data }) => {
      qc.setQueryData<Guarantee[]>(QK.guarantees, (old) => {
        const list = old || INITIAL_GUARANTEES;
        if (!guaranteesCache) guaranteesCache = [...list];
        const idx = guaranteesCache.findIndex((g) => g.id === id);
        if (idx >= 0) guaranteesCache[idx] = { ...guaranteesCache[idx], ...data };
        return [...guaranteesCache];
      });
    },
  });
}

export function useDeleteGuarantee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => id,
    onSuccess: (id) => {
      qc.setQueryData<Guarantee[]>(QK.guarantees, (old) => {
        const list = old || INITIAL_GUARANTEES;
        if (!guaranteesCache) guaranteesCache = [...list];
        guaranteesCache = guaranteesCache.filter((g) => g.id !== id);
        return [...guaranteesCache];
      });
    },
  });
}

// ============= Hospitals (via Partner Hospitals API) =============

export function useHospitals() {
  return useQuery({
    queryKey: QK.hospitals,
    queryFn: HospitalsService.list,
  });
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: QK.hospital(id),
    queryFn: () => HospitalsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: HospitalsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.hospitals }),
    onError: (err: any) => {
      console.error("Create hospital error:", err.response?.data);
      import("sonner").then(({ toast }) => {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Erreur création hôpital : ${msg}`);
      });
    },
  });
}

export function useDeleteHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: HospitalsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.hospitals }),
    onError: (err: any) => {
      console.error("Delete hospital error:", err.response?.data);
      import("sonner").then(({ toast }) => {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Erreur suppression hôpital : ${msg}`);
      });
    },
  });
}

export function useUpdateHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Hospital> }) => HospitalsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.hospitals }),
  });
}

// ============= Conventions =============
// Embedded in hospital data; no separate endpoint.

export function useConventions() {
  return useQuery({
    queryKey: QK.conventions,
    queryFn: async () => {
      const { HospitalsService } = await import("../services");
      const hospitals = await HospitalsService.list();
      return hospitals.filter((h: any) => h.conventionId).map((h: any) => ({
        id: h.conventionId || `conv-${h.id}`,
        reference: `CONV-${h.code}`,
        hospitalId: h.id,
        startDate: h.joinDate,
        endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
        discountRate: h.pricingDiscount || 0,
        paymentTerms: "30 jours fin de mois",
        status: h.active ? "active" : "pending" as const,
        documentsCount: 0,
      }));
    },
  });
}

// ============= Claims (via Claims Processing API) =============

export function useClaims() {
  return useQuery({
    queryKey: QK.claims,
    queryFn: ClaimsService.list,
  });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: QK.claim(id),
    queryFn: () => ClaimsService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReimbursementClaim> }) => {
      if (data.status === "approved") return ClaimsService.approve(id);
      if (data.status === "rejected") return ClaimsService.reject(id, { rejectionReason: data.rejectionReason || "Rejeté" });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.claims }),
  });
}

export function useProcessClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: "approve" | "reject" | "analyze" | "pay"; comment?: string }) => {
      switch (action) {
        case "approve":
          return ClaimsService.approve(id, { notes: comment });
        case "reject":
          return ClaimsService.reject(id, { rejectionReason: comment || "Rejeté" });
        case "analyze":
          return ClaimsService.analyze(id, { notes: comment });
        case "pay":
          return ClaimsService.pay(id, { notes: comment });
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.claims });
      qc.invalidateQueries({ queryKey: QK.kpis });
    },
  });
}

export function useDisputeClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, description }: { id: string; reason: string; description?: string }) => {
      return ClaimsService.dispute(id, { reason, description });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.claims });
      qc.invalidateQueries({ queryKey: QK.kpis });
    },
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resolution, montantApprouve, notes }: { id: string; resolution: "approved" | "rejected"; montantApprouve?: number; notes?: string }) => {
      return ClaimsService.resolveDispute(id, { resolution, montantApprouve, notes });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.claims });
      qc.invalidateQueries({ queryKey: QK.kpis });
    },
  });
}

// ============= Invoices =============

export function useInvoices() {
  return useQuery({
    queryKey: QK.invoices,
    queryFn: InvoicesService.list,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: QK.invoice(id),
    queryFn: () => InvoicesService.getById(id),
    enabled: !!id,
  });
}

// ============= Users =============
// No user list API; derived from auth.

export function useUsers() {
  return useQuery({
    queryKey: QK.users,
    queryFn: async () => {
      const user = useAuthStore.getState().currentUser;
      if (!user) return [];
      return [{
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        active: true,
        lastLogin: new Date().toISOString(),
        permissions: ["*"],
        createdAt: "2023-01-15T08:00:00Z",
      }];
    },
  });
}

// ============= Activity =============
// Derived from claims history and webhook events.

export function useActivity() {
  const { data: claims = [] } = useClaims();
  return useQuery({
    queryKey: QK.activity,
    queryFn: async () => {
      const logs: ActivityLog[] = [];
      claims.forEach((c: ReimbursementClaim) => {
        const statusLabels: Record<string, string> = {
          received: "a été soumise",
          under_review: "a été mise en révision",
          approved: "a été approuvée",
          rejected: "a été rejetée",
          paid: "a été remboursée",
        };
        logs.push({
          id: `act-${c.id}-created`,
          timestamp: c.submissionDate,
          actor: "Système",
          action: `Nouvelle demande ${c.reference} reçue`,
          module: "claims",
          severity: "info",
        });
        if (c.status !== "received") {
          logs.push({
            id: `act-${c.id}-status`,
            timestamp: new Date().toISOString(),
            actor: c.assignedTo || "Agent",
            action: `La demande ${c.reference} ${statusLabels[c.status] || `a changé de statut (${c.status})`}`,
            module: "claims",
            severity: c.status === "rejected" ? "error" : c.status === "paid" ? "success" : "info",
          });
        }
      });
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
    },
  });
}

// ============= Notifications =============
// Derived from claims.

export function useNotifications() {
  const { data: claims = [] } = useClaims();
  return useQuery({
    queryKey: QK.notifications,
    queryFn: async () => {
      const notifs: Notification[] = [];
      const pending = claims.filter((c: ReimbursementClaim) => c.status === "received" || c.status === "under_review");
      if (pending.length > 0) {
        notifs.push({
          id: "notif-pending",
          title: "Demandes en attente",
          message: `${pending.length} demandes de remboursement nécessitent votre attention`,
          type: "info",
          read: false,
          timestamp: new Date().toISOString(),
          module: "claims",
        });
      }
      const rejected = claims.filter((c: ReimbursementClaim) => c.status === "rejected");
      if (rejected.length > 0) {
        notifs.push({
          id: "notif-rejected",
          title: "Demandes rejetées",
          message: `${rejected.length} demandes ont été rejetées`,
          type: "warning",
          read: false,
          timestamp: new Date().toISOString(),
          module: "claims",
        });
      }
      return notifs;
    },
  });
}

// ============= Dashboard KPIs (via Reports API) =============

export function useKPIs() {
  return useQuery({
    queryKey: QK.kpis,
    queryFn: ReportsService.getDashboardKpis,
    staleTime: 30000,
  });
}

export function useCharts() {
  const { data: claims = [] } = useClaims();
  const { data: hospitals = [] } = useHospitals();
  return useQuery({
    queryKey: QK.charts,
    queryFn: () => ReportsService.getCharts(claims, hospitals),
    staleTime: 30000,
  });
}
