import { coreHttpClient } from "./http";
import { getKPI, computeMonthlyRevenue, computeServiceOccupancy } from "@/mocks/store";

export const DashboardService = {
  kpi: async () => {
    // Fallback aux données mockées pour le moment
    return getKPI();
  },
  
  revenue: async () => {
    // Fallback aux données mockées pour le moment
    return computeMonthlyRevenue();
  },
  
  occupancy: async () => {
    // Fallback aux données mockées pour le moment
    return computeServiceOccupancy();
  }
};
