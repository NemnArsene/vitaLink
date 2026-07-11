import { coreHttpClient, unwrap } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

function mapClaim(raw: any): any {
  const actes = raw.actes || [];
  const firstActe = actes[0] || {};
  return {
    id: raw._id || raw.id,
    reference: raw.claimNumber || `CLM-${raw._id?.slice(-6) || "000000"}`,
    insuredId: raw.patientId || "",
    contractId: raw.contractId || "",
    hospitalId: raw.hospitalId || "",
    submissionDate: raw.createdAt || raw.submittedAt || new Date().toISOString(),
    treatmentDate: firstActe.dateActe || raw.treatmentDate || new Date().toISOString(),
    medicalAct: firstActe.acte || raw.medicalAct || "Acte médical",
    medicalActCode: firstActe.code || raw.medicalActCode || "",
    description: firstActe.description || raw.description || raw.notes || "",
    claimedAmount: raw.montantTotal || raw.claimedAmount || 0,
    approvedAmount: raw.montantApprouve || raw.approvedAmount || 0,
    copayAmount: raw.copayAmount || 0,
    status: raw.statut === "recue" ? "received"
          : raw.statut === "en_attente" ? "pending"
          : raw.statut === "en_revision" ? "under_review"
          : raw.statut === "approuvee" ? "approved"
          : raw.statut === "rejetee" ? "rejected"
          : raw.statut === "remboursee" ? "paid"
          : raw.statut === "litige" ? "disputed"
          : raw.status || "received",
    priority: raw.priority || (raw.montantTotal > 100000 ? "high" : "normal"),
    assignedTo: raw.reviewedBy || raw.assignedTo || "",
    documents: raw.documents || [],
    diagnosis: raw.diagnosis || "",
    rejectionReason: raw.rejectionReason || "",
    disputeReason: raw.disputeReason || "",
    processingDays: raw.processingDays || 0,
    slaDeadline: raw.slaDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    history: raw.history || [],
    notes: raw.notes || "",
    patientName: raw.patientName || "",
    hospitalName: raw.hospitalName || "",
    invoiceNumber: raw.invoiceNumber || "",
    invoiceId: raw.invoiceId || "",
  };
}

export const ClaimsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/claims-processing");
    return asArray(unwrap(data)).map(mapClaim);
  },
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/claims-processing/${id}`);
    return mapClaim(unwrap(data));
  },
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/claims-processing", {
      invoiceId: dto.invoiceId,
      invoiceNumber: dto.invoiceNumber,
      patientId: dto.patientId,
      patientName: dto.patientName,
      hospitalId: dto.hospitalId,
      actes: dto.actes || [],
      montantTotal: dto.montantTotal || dto.claimedAmount || 0,
    });
    return mapClaim(unwrap(data));
  },
  approve: async (id: string, dto?: { montantApprouve?: number; notes?: string }) => {
    const { data } = await coreHttpClient.post(`/claims-processing/${id}/approve`, dto || {});
    return mapClaim(unwrap(data));
  },
  reject: async (id: string, dto: { rejectionReason: string; notes?: string }) => {
    const { data } = await coreHttpClient.post(`/claims-processing/${id}/reject`, dto);
    return mapClaim(unwrap(data));
  },
  analyze: async (id: string, dto?: { notes?: string }) => {
    const { data } = await coreHttpClient.post(`/claims-processing/${id}/analyze`, dto || {});
    return mapClaim(unwrap(data));
  },
  pay: async (id: string, dto?: { montantApprouve?: number; notes?: string }) => {
    const { data } = await coreHttpClient.post(`/claims-processing/${id}/pay`, dto || {});
    return mapClaim(unwrap(data));
  },
  dispute: async (id: string, dto: { reason: string; description?: string }) => {
    const { data } = await coreHttpClient.put(`/claims-processing/${id}/dispute`, dto);
    return mapClaim(unwrap(data));
  },
  resolveDispute: async (id: string, dto: { resolution: "approved" | "rejected"; montantApprouve?: number; notes?: string }) => {
    const backendDto = {
      resolution: dto.resolution === "approved" ? "approuvee" : "rejetee",
      montantApprouve: dto.montantApprouve,
      notes: dto.notes,
    };
    const { data } = await coreHttpClient.post(`/claims-processing/${id}/resolve-dispute`, backendDto);
    return mapClaim(unwrap(data));
  },
};
