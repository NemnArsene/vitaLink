import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// -----------------------------------------------------------------------------
// CORE API CLIENT (HMS Backend - Port 3001)
// -----------------------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

export const coreHttpClient = axios.create({
  baseURL: `${API_BASE}/${API_PREFIX}`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

coreHttpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const stored = localStorage.getItem("hms-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.user?.token) {
        config.headers.Authorization = `Bearer ${state.user.token}`;
      } else if (state?.token) { // Fallback for previous store structure
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {}
  }
  return config;
});

coreHttpClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Pourrait déclencher une déconnexion automatique
      console.warn("Unauthorized access to Core API");
    }
    return Promise.reject(error);
  }
);
