import { coreHttpClient, unwrap } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.results && Array.isArray(res.results)) return res.results;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

function mapPolicy(raw: any): any {
  return {
    id: raw._id || raw.id,
    reference: raw.policyNumber || "",
    insuredId: raw.subscriberId || "",
    productName: raw.providerName || "Santé",
    type: raw.type === "individuelle" ? "individual" : raw.type === "familiale" ? "family" : raw.type === "entreprise" ? "enterprise" : "individual",
    startDate: raw.dateDebut || new Date().toISOString(),
    endDate: raw.dateFin || new Date().toISOString(),
    monthlyPremium: raw.monthlyPremium || 0,
    annualPremium: (raw.monthlyPremium || 0) * 12,
    coverageAmount: raw.coverageAmount || 5000000,
    remainingCoverage: raw.remainingCoverage || raw.coverageAmount || 5000000,
    status: raw.statut === "active" ? "active" : raw.statut === "suspendue" ? "suspended" : raw.statut === "expiree" ? "expired" : raw.statut === "inactive" ? "terminated" : "pending",
    paymentFrequency: "monthly",
    guarantees: (raw.garanties || []).map((g: any) => g.code || g),
    deductible: raw.deductible || 0,
    commission: raw.commission || 0,
    agentId: raw.agentId || "",
    notes: raw.notes || "",
    subscriberName: raw.subscriberName || "",
    insuranceCardNumber: raw.insuranceCardNumber || "",
    providerName: raw.providerName || "",
  };
}

export const PoliciesService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/policies");
    return asArray(unwrap(data)).map(mapPolicy);
  },
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/policies/${id}`);
    return mapPolicy(unwrap(data));
  },
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/policies", {
      policyNumber: dto.policyNumber || `POL-${Date.now()}`,
      subscriberId: dto.insuredId,
      subscriberName: dto.subscriberName || dto.subscriberNameFromInsured || "Souscripteur",
      insuranceProviderId: dto.insuranceProviderId || "INS-001",
      providerName: dto.productName || "Assureur",
      insuranceCardNumber: dto.insuranceCardNumber || `CARD-${Date.now()}`,
      type: dto.type === "individual" ? "individuelle" : dto.type === "family" ? "familiale" : "entreprise",
      dateDebut: dto.startDate,
      dateFin: dto.endDate,
      garanties: (dto.guarantees || []).map((code: string) => ({ code, libelle: code, montantMax: 1000000, pourcentage: 80 })),
    });
    return mapPolicy(unwrap(data));
  },
  update: async (id: string, dto: any) => {
    const body: any = {};
    if (dto.status) {
      body.statut = dto.status === "active" ? "active" : dto.status === "suspended" ? "suspendue" : dto.status === "expired" ? "expiree" : "inactive";
    }
    if (dto.startDate) body.dateDebut = dto.startDate;
    if (dto.endDate) body.dateFin = dto.endDate;
    const { data } = await coreHttpClient.put(`/policies/${id}`, body);
    return mapPolicy(unwrap(data));
  },
  remove: async (id: string) => {
    await coreHttpClient.delete(`/policies/${id}`);
  },
};
