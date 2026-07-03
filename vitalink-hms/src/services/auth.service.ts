import { coreHttpClient, gatewayHttpClient, isStandaloneMode } from "./http";

export const AuthService = {
  login: async (email: string, password: string) => {
    // Si standalone, authentification directe via l'API core de l'hôpital.
    // Sinon, authentification centralisée via le Gateway.
    if (isStandaloneMode) {
      const { data } = await coreHttpClient.post("/auth/login", { email, password });
      return data.data;
    } else {
      try {
        const { data } = await gatewayHttpClient.post("/auth/login", { 
          email, 
          password, 
          platform: "hospital" 
        });
        return data.data;
      } catch (error: any) {
        // Fallback automatique vers l'API Core si le Gateway rejette la connexion
        // (ex: Hôpital indépendant non whitelisté) ou si le Gateway est injoignable
        if (error.response?.status === 401 || !error.response || error.response?.status >= 500) {
          console.log("Gateway rejeté ou injoignable, fallback automatique vers l'API Core HMS...");
          const { data } = await coreHttpClient.post("/auth/login", { email, password });
          return data.data;
        }
        throw error;
      }
    }
  },
  
  logout: async () => {
    if (isStandaloneMode) {
      await coreHttpClient.post("/auth/logout");
    } else {
      await gatewayHttpClient.post("/auth/logout");
    }
  },
  
  me: async () => {
    if (isStandaloneMode) {
      const { data } = await coreHttpClient.get("/auth/me");
      return data.data;
    } else {
      const { data } = await gatewayHttpClient.get("/auth/me");
      return data.data;
    }
  },
};
