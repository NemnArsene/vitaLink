import { coreHttpClient } from "./http";

export const PatientsService = {
  list: async (params?: { q?: string; status?: string; insurance?: string }) => {
    const { data } = await coreHttpClient.get("/patients", { params });
    return data.data;
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/patients/${id}`);
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/patients", dto);
    return data.data;
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/patients/${id}`, dto);
    return data.data;
  },
  
  remove: async (id: string) => {
    await coreHttpClient.delete(`/patients/${id}`);
  }
};
