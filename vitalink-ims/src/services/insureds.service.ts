import { coreHttpClient, unwrap } from "./http";

export const InsuredsService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/insureds");
    return unwrap(data) as any[];
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/insureds/${id}`);
    return unwrap(data);
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/insureds", dto);
    return unwrap(data);
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/insureds/${id}`, dto);
    return unwrap(data);
  },
  
  remove: async (id: string) => {
    await coreHttpClient.delete(`/insureds/${id}`);
  }
};
