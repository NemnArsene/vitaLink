import { coreHttpClient } from "./http";

export const AuditService = {
  list: async (params?: any) => {
    const { data } = await coreHttpClient.get("/audit", { params });
    return data.data;
  },
  
  stats: async () => {
    const { data } = await coreHttpClient.get("/audit/stats");
    return data.data;
  }
};
