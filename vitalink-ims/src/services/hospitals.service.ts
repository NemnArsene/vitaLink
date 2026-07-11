import { coreHttpClient, unwrap } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.results && Array.isArray(res.results)) return res.results;
  return [];
}

function mapHospital(raw: any): any {
  const services = raw.servicesDisponibles || [];
  return {
    id: raw._id || raw.id,
    name: raw.hospitalName || raw.name || "",
    code: raw.hospitalCode || raw.code || "",
    type: raw.type === "clinic" ? "clinic" : raw.type === "private" ? "private" : raw.type === "university" ? "university" : "public",
    tier: raw.niveau ? (raw.niveau === "1" || raw.niveau === 1 ? 1 : raw.niveau === "2" || raw.niveau === 2 ? 2 : 3) : 2,
    address: raw.address || "",
    city: raw.city || "",
    postalCode: raw.postalCode || "",
    phone: raw.phone || "",
    email: raw.email || "",
    director: raw.directorName || raw.director || "",
    bedCapacity: raw.capaciteLits || raw.bedCapacity || 0,
    specialties: Array.isArray(services) ? services : [],
    conventionId: raw.conventionId || "",
    conventionStatus: raw.convention?.statut || (raw.statut === "actif" ? "active" : "pending"),
    pricingDiscount: raw.tarifsConventionnes?.[0]?.tauxRemboursement || raw.pricingDiscount || 0,
    rating: raw.rating || 4.0,
    totalClaims: raw.totalClaims || 0,
    averageProcessingDays: raw.averageProcessingDays || 3,
    joinDate: raw.createdAt || raw.dateAgrement || new Date().toISOString(),
    active: raw.statut === "actif",
  };
}

export const HospitalsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/partner-hospitals");
    return asArray(unwrap(data)).map(mapHospital);
  },
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/partner-hospitals/${id}`);
    return mapHospital(unwrap(data));
  },
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/partner-hospitals", {
      hospitalCode: dto.code,
      hospitalName: dto.name,
      address: dto.address,
      city: dto.city,
      phone: dto.phone,
      email: dto.email,
      directorName: dto.director,
      servicesDisponibles: dto.specialties,
      niveau: String(dto.tier || 2),
      capaciteLits: dto.bedCapacity,
    });
    return mapHospital(unwrap(data));
  },
  update: async (id: string, dto: any) => {
    const body: any = {};
    if (dto.hospitalName) body.hospitalName = dto.hospitalName;
    if (dto.address) body.address = dto.address;
    if (dto.phone) body.phone = dto.phone;
    if (dto.email) body.email = dto.email;
    if (dto.directorName) body.directorName = dto.directorName;
    if (dto.statut) body.statut = dto.statut;
    if (dto.servicesDisponibles) body.servicesDisponibles = dto.servicesDisponibles;
    if (dto.capaciteLits) body.capaciteLits = dto.capaciteLits;
    const { data } = await coreHttpClient.put(`/partner-hospitals/${id}`, body);
    return mapHospital(unwrap(data));
  },
  remove: async (id: string) => {
    await coreHttpClient.delete(`/partner-hospitals/${id}`);
  },
};
