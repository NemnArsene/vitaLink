import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// -----------------------------------------------------------------------------
// GATEWAY API CLIENT (Gateway - Port 3000)
// -----------------------------------------------------------------------------

const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_BASE || "http://localhost:3000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

export const gatewayHttpClient = axios.create({
  baseURL: `${GATEWAY_BASE}/${API_PREFIX}`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

gatewayHttpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const stored = localStorage.getItem("medisure-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
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
