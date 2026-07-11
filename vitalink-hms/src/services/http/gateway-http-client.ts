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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login") && !originalRequest.url?.includes("/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return gatewayHttpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const stored = localStorage.getItem("hms-auth");
        if (!stored) throw new Error("No auth data");

        const { state } = JSON.parse(stored);
        const refreshToken = state?.user?.refreshToken;
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${GATEWAY_BASE}/${API_PREFIX}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        const parsed = JSON.parse(stored);
        parsed.state.user.token = newToken;
        parsed.state.user.refreshToken = newRefreshToken;
        localStorage.setItem("hms-auth", JSON.stringify(parsed));

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return gatewayHttpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("hms-auth");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
