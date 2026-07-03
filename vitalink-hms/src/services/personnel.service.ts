import { coreHttpClient } from "./http";

export const PersonnelService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/personnel");
    return data.data;
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/personnel/${id}`);
    return data.data;
  },
  
  doctors: async () => {
    const { data } = await coreHttpClient.get("/personnel/doctors");
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/personnel", dto);
    return data.data;
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/personnel/${id}`, dto);
    return data.data;
  },
  
  remove: async (id: string) => {
    await coreHttpClient.delete(`/personnel/${id}`);
  }
};
