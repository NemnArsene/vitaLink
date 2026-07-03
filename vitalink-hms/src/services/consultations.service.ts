import { coreHttpClient } from "./http";

export const ConsultationsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/consultations");
    return data.data;
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
