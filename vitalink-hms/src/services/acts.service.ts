import { coreHttpClient } from "./http";

export const ActsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/acts");
    return data.data;
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/acts/${id}`);
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/acts", dto);
    return data.data;
  }
};
