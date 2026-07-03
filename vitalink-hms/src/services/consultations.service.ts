import { coreHttpClient } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.consultations)) return res.consultations;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

export const ConsultationsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/consultations");
    return asArray(data.data);
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/consultations/${id}`);
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/consultations", dto);
    return data.data;
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/consultations/${id}`, dto);
    return data.data;
  }
};
