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
      // Le core API utilise son propre token (coreToken), pas celui du gateway
      const coreToken = state?.user?.coreToken || state?.user?.token;
      if (coreToken) {
        config.headers.Authorization = `Bearer ${coreToken}`;
      }
    } catch {}
  }
  return config;
});

coreHttpClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hms-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
