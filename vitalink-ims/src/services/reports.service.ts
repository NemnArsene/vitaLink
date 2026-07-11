import { coreHttpClient, unwrap } from "./http";
import type { DashboardKPI, ChartDataPoint } from "../types";

const STATUS_COLORS: Record<string, string> = {
  received: "#f59e0b",
  under_review: "#06b6d4",
  approved: "#10b981",
  rejected: "#ef4444",
  disputed: "#f43f5e",
  paid: "#3b82f6",
};

function mapKpis(raw: any): DashboardKPI[] {
  const k = raw?.kpis || raw;
  const pending = (k.pendingClaims || 0) + (k.enRevision || 0);
  return [
    { label: "Demandes reçues", value: k.totalClaims || 0, format: "number", change: 0, trend: "up", icon: "FileText", color: "brand" },
    { label: "Montant total remboursé", value: k.totalApprovedAmount || 0, format: "currency", change: 0, trend: "up", icon: "Wallet", color: "emerald" },
    { label: "Assurés actifs", value: k.totalInsureds || 0, format: "number", change: 0, trend: "up", icon: "Users", color: "violet" },
    { label: "Taux d'approbation", value: k.approvalRate || 0, format: "percent", change: 0, trend: "up", icon: "CheckCircle2", color: "emerald" },
    { label: "Délai moyen traitement", value: 3, format: "number", change: 0, trend: "down", icon: "Timer", color: "amber" },
    { label: "Demandes en attente", value: pending, format: "number", change: 0, trend: "up", icon: "Clock", color: "amber" },
    { label: "Hôpitaux partenaires", value: k.totalHospitals || 0, format: "number", change: 0, trend: "up", icon: "Building2", color: "cyan" },
    { label: "Polices actives", value: k.activePolicies || 0, format: "number", change: 0, trend: "up", icon: "TrendingUp", color: "rose" },
  ];
}

function mapCharts(raw: any, claims: any[]) {
  const monthly = raw?.monthlyBreakdown || [];
  const monthlyClaims: ChartDataPoint[] = monthly.length > 0
    ? monthly.map((m: any) => ({ date: m._id, value: m.count || m.total || 0 }))
    : generateMonthlyFromClaims(claims);

  const received = claims.filter(c => c.status === "received").length;
  const review = claims.filter(c => c.status === "under_review").length;
  const approved = claims.filter(c => c.status === "approved").length;
  const rejected = claims.filter(c => c.status === "rejected").length;
  const paid = claims.filter(c => c.status === "paid").length;

  const claimsByStatus: ChartDataPoint[] = [
    { date: "Reçue", category: "received", value: received },
    { date: "En révision", category: "under_review", value: review },
    { date: "Approuvée", category: "approved", value: approved },
    { date: "Rejetée", category: "rejected", value: rejected },
    { date: "Remboursée", category: "paid", value: paid },
  ];

  return { monthlyClaims, claimsByStatus };
}

function generateMonthlyFromClaims(claims: any[]): ChartDataPoint[] {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = 0;
  }
  claims.forEach(c => {
    const d = new Date(c.submissionDate || c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (months[key] !== undefined) months[key]++;
  });
  return Object.entries(months).map(([date, value]) => {
    const parts = date.split("-");
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return { date: monthNames[parseInt(parts[1]) - 1] || date, value: value as number };
  });
}

function buildHospitalRanking(hospitals: any[]): ChartDataPoint[] {
  return (hospitals || [])
    .sort((a, b) => (b.totalClaims || 0) - (a.totalClaims || 0))
    .slice(0, 10)
    .map(h => ({ date: h.name, value: h.totalClaims || 0 }));
}

export const ReportsService = {
  getDashboardKpis: async () => {
    const { data } = await coreHttpClient.get("/reports/dashboard");
    return mapKpis(unwrap(data));
  },
  getCharts: async (claims: any[], hospitals: any[]) => {
    try {
      const { data } = await coreHttpClient.get("/reports/claims-overview");
      const charts = mapCharts(unwrap(data), claims);
      return {
        ...charts,
        revenueEvolution: [] as ChartDataPoint[],
        hospitalRanking: buildHospitalRanking(hospitals),
        claimsByType: [] as ChartDataPoint[],
      };
    } catch {
      return {
        monthlyClaims: generateMonthlyFromClaims(claims),
        claimsByStatus: [],
        revenueEvolution: [],
        hospitalRanking: buildHospitalRanking(hospitals),
        claimsByType: [],
      };
    }
  },
  getClaimsOverview: async () => {
    const { data } = await coreHttpClient.get("/reports/claims-overview");
    return unwrap(data);
  },
};
