import { coreHttpClient, gatewayHttpClient, isStandaloneMode } from "./http";

export const InsuranceService = {
  companies: async () => {
    if (isStandaloneMode) return [];
    const { data } = await gatewayHttpClient.get("/hms/insurance/companies");
    return data.data;
  },
  
  contracts: async () => {
    if (isStandaloneMode) return [];
    const { data } = await gatewayHttpClient.get("/hms/insurance/contracts");
    return data.data;
  }
};
