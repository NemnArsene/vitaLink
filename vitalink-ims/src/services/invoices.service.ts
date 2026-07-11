import { coreHttpClient, unwrap } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

function mapInvoice(raw: any): any {
  return {
    id: raw._id || raw.id,
    invoiceId: raw.invoiceId || "",
    invoiceNumber: raw.invoiceNumber || "",
    patientId: raw.patientId || "",
    patientName: raw.patientName || "",
    hospitalId: raw.hospitalId || "",
    hospitalName: raw.hospitalName || "",
    actes: raw.actes || [],
    montantTotal: raw.montantTotal || 0,
    montantRembourse: raw.montantRembourse || 0,
    statut: raw.statut || "recue",
    claimId: raw.claimId || "",
    claimNumber: raw.claimNumber || "",
    submittedAt: raw.submittedAt || raw.createdAt || new Date().toISOString(),
    processedAt: raw.processedAt || null,
    rejectionReason: raw.rejectionReason || "",
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const InvoicesService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/invoices");
    return asArray(unwrap(data)).map(mapInvoice);
  },
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/invoices/${id}`);
    return mapInvoice(unwrap(data));
  },
};
