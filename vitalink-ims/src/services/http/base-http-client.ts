import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// -----------------------------------------------------------------------------
// CORE API CLIENT (IMS Backend - Port 3002)
// -----------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

export const coreHttpClient = axios.create({
  baseURL: `${API_BASE}/${API_PREFIX}`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

coreHttpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const stored = localStorage.getItem("medisure-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {}
  }
  console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

coreHttpClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/")) {
      localStorage.removeItem("medisure-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function unwrap(res: any) {
  return res?.data ?? res?.results ?? res;
}
