import { coreHttpClient } from "./http";

export const WrittenReportsService = {
  drafts: async () => {
    const { data } = await coreHttpClient.get("/written-reports/drafts");
    return data.data;
  },
  
  sent: async () => {
    const { data } = await coreHttpClient.get("/written-reports/sent");
    return data.data;
  },
  
  received: async () => {
    const { data } = await coreHttpClient.get("/written-reports/received");
    return data.data;
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/written-reports/${id}`);
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/written-reports", dto);
    return data.data;
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/written-reports/${id}`, dto);
    return data.data;
  },
  
  send: async (id: string) => {
    const { data } = await coreHttpClient.post(`/written-reports/${id}/send`);
    return data.data;
  },
  
  remove: async (id: string) => {
    await coreHttpClient.delete(`/written-reports/${id}`);
  }
};
