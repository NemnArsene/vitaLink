import { coreHttpClient } from "./http";

export const SettingsService = {
  services: async () => {
    const { data } = await coreHttpClient.get("/settings/services");
    return data.data;
  },
  
  acts: async () => {
    const { data } = await coreHttpClient.get("/settings/acts");
    return data.data;
  },
  
  createService: async (dto: any) => {
    const { data } = await coreHttpClient.post("/settings/services", dto);
    return data.data;
  },
  
  updateService: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/settings/services/${id}`, dto);
    return data.data;
  },
  
  removeService: async (id: string) => {
    await coreHttpClient.delete(`/settings/services/${id}`);
  },
  
  createAct: async (dto: any) => {
    const { data } = await coreHttpClient.post("/settings/acts", dto);
    return data.data;
  },
  
  updateAct: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/settings/acts/${id}`, dto);
    return data.data;
  },
  
  removeAct: async (id: string) => {
    await coreHttpClient.delete(`/settings/acts/${id}`);
  }
};
