import { coreHttpClient, gatewayHttpClient, isStandaloneMode } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.invoices)) return res.invoices;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function mapRefund(raw: any) {
  const total = raw.montantTotal ?? raw.total ?? 0;
  const insuranceCover = raw.montantRembourse ?? raw.insuranceCover ?? 0;
  return {
    id: raw._id ?? raw.id,
    reference: `RMB-${(raw.invoiceNumber ?? raw.number ?? "").replace("INV-", "")}`,
    invoiceNumber: raw.invoiceNumber ?? raw.number,
    patientName: raw.patientName ?? "",
    patientId: raw.patientId ?? "",
    insuranceCompany: raw.providerName ?? raw.insuranceCompany ?? "N/A",
    amount: insuranceCover,
    insuranceClaimId: raw.insuranceClaimId,
    rejectionReason: raw.rejectionReason ?? (raw.notes?.startsWith("Réclamation rejetée") ? raw.notes : undefined),
    status: raw.statut === "soumise" ? "SUBMITTED"
          : raw.statut === "en_attente" ? "PENDING"
          : raw.statut === "approuvee" ? "PROCESSING"
          : raw.statut === "payee" || raw.statut === "remboursee" ? "PAID"
          : raw.statut === "rejetee" ? "REJECTED"
          : raw.status === "SUBMITTED" ? "SUBMITTED"
          : raw.status ?? "SUBMITTED",
    submittedAt: raw.submittedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
}

export const RefundsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/billing/invoices");
    const invoices = asArray(data.data);
    return invoices
      .filter((i: any) => {
        const s = i.statut ?? i.status;
        return s && s !== "brouillon" && s !== "ISSUED";
      })
      .map(mapRefund);
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/billing/invoices/${id}`);
    return data.data ? mapRefund(data.data) : null;
  },
  
  submitRefund: async (invoiceId: string, insuranceData?: { insuranceCompany?: string; insuranceNumber?: string }) => {
    if (insuranceData) {
      await coreHttpClient.put(`/billing/invoices/${invoiceId}`, {
        insuranceProvider: insuranceData.insuranceCompany,
        insuranceCardNumber: insuranceData.insuranceNumber,
      });
    }
    const { data } = await coreHttpClient.post(`/billing/invoices/${invoiceId}/submit`);
    return data.data;
  },

  dispute: async (payload: { id: string; invoiceId: string; reason: string }) => {
    const { id, invoiceId, reason } = payload;
    if (isStandaloneMode) {
      const { data } = await coreHttpClient.patch(`/billing/invoices/${invoiceId}/status`, { statut: 'rejetee' });
      return data.data;
    }
    const { data } = await gatewayHttpClient.put(`/claims-processing/${id}/dispute`, { reason, description: reason });
    return data.data;
  }
};
