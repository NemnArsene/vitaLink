import { coreHttpClient } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.invoices)) return res.invoices;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function mapInvoice(raw: any) {
  const total = raw.montantTotal ?? raw.total ?? 0;
  const insuranceCover = raw.montantRembourse ?? raw.insuranceCover ?? 0;
  return {
    id: raw._id ?? raw.id,
    number: raw.invoiceNumber ?? raw.number,
    patientName: raw.patientName ?? "",
    patientId: raw.patientMedicalRecordNumber ?? raw.patientId,
    issuedAt: raw.submittedAt ?? raw.createdAt ?? raw.dateActe ?? new Date().toISOString(),
    dueDate: raw.dueDate ?? raw.submittedAt ?? raw.createdAt ?? new Date().toISOString(),
    total,
    subtotal: total,
    insuranceCover,
    patientShare: total - insuranceCover,
    insuranceCompany: raw.providerName ?? raw.insuranceCompany ?? null,
    insuranceNumber: raw.insuranceCardNumber ?? raw.insuranceNumber ?? null,
    status: raw.statut === "brouillon" ? "ISSUED"
          : raw.statut === "soumise" ? "SUBMITTED"
          : raw.statut === "approuvee" ? "APPROVED"
          : raw.statut === "payee" ? "PAID"
          : raw.statut === "remboursee" ? "REIMBURSED"
          : raw.statut === "rejetee" ? "REJECTED"
          : raw.status ?? "ISSUED",
    lines: (raw.actes ?? raw.lines ?? []).map((a: any, i: number) => ({
      id: a._id ?? `line-${i}`,
      description: a.description ?? a.acte ?? a.label ?? "",
      quantity: a.quantity ?? 1,
      unitPrice: a.montant ?? a.unitPrice ?? a.basePrice ?? 0,
      total: a.montant ?? a.total ?? a.unitPrice ?? 0,
    })),
    insuranceClaimId: raw.insuranceClaimId,
    submittedAt: raw.submittedAt,
  };
}

export const BillingService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/billing/invoices");
    return asArray(data.data).map(mapInvoice);
  },
  
  listInvoices: async () => {
    const { data } = await coreHttpClient.get("/billing/invoices");
    return asArray(data.data);
  },
  
  getInvoice: async (id: string) => {
    const { data } = await coreHttpClient.get(`/billing/invoices/${id}`);
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/billing/invoices", dto);
    return data.data;
  },

  createInvoice: async (dto: any) => {
    const { data } = await coreHttpClient.post("/billing/invoices", dto);
    return data.data;
  },
  
  updateInvoice: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/billing/invoices/${id}`, dto);
    return data.data;
  },

  submitToInsurance: async (id: string) => {
    const { data } = await coreHttpClient.post(`/billing/invoices/${id}/submit`);
    return data.data;
  }
};
