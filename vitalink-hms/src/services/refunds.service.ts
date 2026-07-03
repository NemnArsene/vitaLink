import { coreHttpClient, gatewayHttpClient, isStandaloneMode } from "./http";

export const RefundsService = {
  list: async () => {
    if (isStandaloneMode) return []; // Standalone: no refund module
    const { data } = await gatewayHttpClient.get("/hms/refunds"); // Via Gateway
    return data.data;
  },
  
  getById: async (id: string) => {
    if (isStandaloneMode) return null;
    const { data } = await gatewayHttpClient.get(`/hms/refunds/${id}`);
    return data.data;
  },
  
  submit: async (invoiceId: string) => {
    if (isStandaloneMode) throw new Error("Unavailable in standalone mode");
    const { data } = await gatewayHttpClient.post("/hms/refunds", { invoiceId });
    return data.data;
  },
  
  dispute: async (id: string, reason: string) => {
    if (isStandaloneMode) throw new Error("Unavailable in standalone mode");
    const { data } = await gatewayHttpClient.post(`/hms/refunds/${id}/dispute`, { reason });
    return data.data;
  }
};
