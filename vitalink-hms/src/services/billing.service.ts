import { coreHttpClient } from "./http";

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.invoices)) return res.invoices;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

export const BillingService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/billing/invoices");
    return asArray(data.data);
  },
  
  listInvoices: async () => {
    const { data } = await coreHttpClient.get("/billing/invoices");
    return asArray(data.data);
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
