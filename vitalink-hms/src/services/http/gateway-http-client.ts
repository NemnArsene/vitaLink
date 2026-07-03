import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// -----------------------------------------------------------------------------
// GATEWAY API CLIENT (Gateway - Port 3000)
// -----------------------------------------------------------------------------

const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_BASE || "http://localhost:3000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

// Variable pour le mode Standalone / Incognito
export const isStandaloneMode = import.meta.env.VITE_STANDALONE_MODE === "true";

export const gatewayHttpClient = axios.create({
  baseURL: `${GATEWAY_BASE}/${API_PREFIX}`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// En mode Standalone, on ne devrait pas appeler le gateway, mais au cas où :
gatewayHttpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isStandaloneMode) {
    console.warn("Attempting to call Gateway while in Standalone mode:", config.url);
  }
  
  const stored = localStorage.getItem("hms-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.user?.token) {
        config.headers.Authorization = `Bearer ${state.user.token}`;
      } else if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {}
  }
  return config;
});

gatewayHttpClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
