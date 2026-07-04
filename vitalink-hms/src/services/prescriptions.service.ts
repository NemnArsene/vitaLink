import { coreHttpClient } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.prescriptions)) return res.prescriptions;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function normalizePrescription(raw: any) {
  if (raw?.id && raw?.patientName) return raw;
  return {
    ...raw,
    id: raw._id || raw.id,
  };
}

export const PrescriptionsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/prescriptions");
    return asArray(data.data).map(normalizePrescription);
  },

  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/prescriptions/${id}`);
    return normalizePrescription(data.data);
  },

  getByPatient: async (patientId: string) => {
    const { data } = await coreHttpClient.get(`/prescriptions/patient/${patientId}`);
    return asArray(data.data).map(normalizePrescription);
  },

  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/prescriptions", dto);
    return normalizePrescription(data.data);
  },

  invalidate: async (id: string) => {
    const { data } = await coreHttpClient.post(`/prescriptions/${id}/invalidate`);
    return normalizePrescription(data.data);
  },
};
