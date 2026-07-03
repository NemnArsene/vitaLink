import { coreHttpClient } from "./http";

export const BillingService = {
  listInvoices: async () => {
    const { data } = await coreHttpClient.get("/billing/invoices");
    return data.data;
  },
  
  getInvoice: async (id: string) => {
    const { data } = await coreHttpClient.get(`/billing/invoices/${id}`);
    return data.data;
  },
  
  createInvoice: async (dto: any) => {
    const { data } = await coreHttpClient.post("/billing/invoices", dto);
    return data.data;
  },
  
  updateInvoice: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/billing/invoices/${id}`, dto);
    return data.data;
  }
};
