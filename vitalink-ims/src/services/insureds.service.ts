import { coreHttpClient, unwrap } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.results && Array.isArray(res.results)) return res.results;
  if (res?.items && Array.isArray(res.items)) return res.items;
  return [];
}

function mapInsured(raw: any): any {
  const addr = raw.address || {};
  return {
    id: raw._id || raw.id,
    matricule: raw.insuredNumber || raw.matricule || "",
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    email: raw.email || "",
    phone: raw.phone || "",
    birthDate: raw.dateOfBirth || raw.birthDate || "",
    gender: raw.gender || "",
    maritalStatus: raw.maritalStatus || "",
    address: typeof addr === "object" ? (addr.street || "") : (raw.address || ""),
    city: typeof addr === "object" ? (addr.city || "") : (raw.city || ""),
    postalCode: typeof addr === "object" ? (addr.zipCode || "") : (raw.postalCode || ""),
    socialSecurityNumber: raw.socialSecurityNumber || "",
    contractId: raw.policyId || raw.contractId || "",
    providerName: raw.providerName || "",
    joinDate: raw.dateAffiliation || raw.joinDate || new Date().toISOString(),
    status: raw.statut === "actif" ? "active"
          : raw.statut === "suspendu" ? "suspended"
          : raw.statut === "inactif" ? "terminated"
          : raw.status || "pending",
    dependents: raw.dependents || 0,
    totalReimbursements: raw.totalReimbursements || 0,
    riskScore: raw.riskScore || 0,
    notes: raw.notes || "",
  };
}

export const InsuredsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/insureds");
    return asArray(unwrap(data)).map(mapInsured);
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/insureds/${id}`);
    return mapInsured(unwrap(data));
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/insureds", dto);
    return mapInsured(unwrap(data));
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/insureds/${id}`, dto);
    return mapInsured(unwrap(data));
  },
  
  remove: async (id: string) => {
    await coreHttpClient.delete(`/insureds/${id}`);
  }
};
