import { coreHttpClient } from "./http";

export const AuthService = {
  login: async (email: string, password: string) => {
    // L'IMS (Assurance) se connecte directement à son API (3002)
    const { data } = await coreHttpClient.post("/auth/login", { email, password });
    return data.data;
  },
  
  logout: async () => {
    await coreHttpClient.post("/auth/logout");
  },
  
  me: async () => {
    const { data } = await coreHttpClient.get("/auth/me");
    return data.data;
  },
};
