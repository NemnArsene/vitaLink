import { coreHttpClient } from "./http";

export const UsersService = {
  list: async () => {
    const { data } = await coreHttpClient.get("/users");
    return data.data;
  },
  
  create: async (dto: any) => {
    const { data } = await coreHttpClient.post("/users", dto);
    return data.data;
  },
  
  update: async (id: string, dto: any) => {
    const { data } = await coreHttpClient.put(`/users/${id}`, dto);
    return data.data;
  },
  
  remove: async (id: string) => {
    await coreHttpClient.delete(`/users/${id}`);
  }
};
