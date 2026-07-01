import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

export const httpClient = axios.create({
  baseURL: `${API_BASE}/${API_PREFIX}`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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

httpClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("medisure-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const AuthAPI = {
  async login(email: string, password: string) {
    const { data } = await httpClient.post("/auth/login", { email, password });
    return data.data;
  },
  async logout() {
    await httpClient.post("/auth/logout");
  },
  async me() {
    const { data } = await httpClient.get("/auth/me");
    return data.data;
  },
};

function unwrap(res: any) {
  return res?.data ?? res?.results ?? res;
}

export const InsuredsAPI = {
  async list() {
    const { data } = await httpClient.get("/insureds");
    return unwrap(data) as any[];
  },
  async get(id: string) {
    const { data } = await httpClient.get(`/insureds/${id}`);
    return unwrap(data);
  },
  async create(dto: any) {
    const { data } = await httpClient.post("/insureds", dto);
    return unwrap(data);
  },
  async update(id: string, dto: any) {
    const { data } = await httpClient.put(`/insureds/${id}`, dto);
    return unwrap(data);
  },
  async remove(id: string) {
    await httpClient.delete(`/insureds/${id}`);
  },
};

export const ExportAPI = {
  async csv(entity: string) {
    const { data } = await httpClient.post("/import-export/export/csv", { entity, format: "csv" }, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
