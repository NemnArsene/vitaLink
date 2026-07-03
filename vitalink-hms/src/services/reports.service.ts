import { coreHttpClient } from "./http";

export const ReportsService = {
  generate: async (type: string, startDate?: string, endDate?: string) => {
    const { data } = await coreHttpClient.post("/reports/generate", { type, startDate, endDate });
    return data.data;
  },
  
  activity: async () => {
    const { data } = await coreHttpClient.get("/reports/activity");
    return data.data;
  },
  
  billing: async () => {
    const { data } = await coreHttpClient.get("/reports/billing");
    return data.data;
  },
  
  occupation: async () => {
    const { data } = await coreHttpClient.get("/reports/occupation");
    return data.data;
  }
};
