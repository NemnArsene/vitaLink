import { coreHttpClient } from "./http";

export const PharmacyService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/pharmacy");
    return data.data;
  },
  
  getById: async (id: string) => {
    const { data } = await coreHttpClient.get(`/pharmacy/${id}`);
    return data.data;
  },
  
  updateStock: async (id: string, stock: number) => {
    const { data } = await coreHttpClient.patch(`/pharmacy/${id}/stock`, { stock });
    return data.data;
  }
};
