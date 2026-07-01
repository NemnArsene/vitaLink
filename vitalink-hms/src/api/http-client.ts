import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api/v1";

export const httpClient = axios.create({
  baseURL: `${API_BASE}/${API_PREFIX}`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const stored = localStorage.getItem("hms-auth");
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

export const PersonnelAPI = {
  async list() {
    const { data } = await httpClient.get("/personnel");
    return data.data;
  },
  async get(id: string) {
    const { data } = await httpClient.get(`/personnel/${id}`);
    return data.data;
  },
  async doctors() {
    const { data } = await httpClient.get("/personnel/doctors");
    return data.data;
  },
  async create(dto: any) {
    const { data } = await httpClient.post("/personnel", dto);
    return data.data;
  },
  async update(id: string, dto: any) {
    const { data } = await httpClient.put(`/personnel/${id}`, dto);
    return data.data;
  },
  async remove(id: string) {
    await httpClient.delete(`/personnel/${id}`);
  },
};

export const ReportsAPI = {
  async generate(type: string, startDate?: string, endDate?: string) {
    const { data } = await httpClient.post("/reports/generate", { type, startDate, endDate });
    return data.data;
  },
  async activity() {
    const { data } = await httpClient.get("/reports/activity");
    return data.data;
  },
  async billing() {
    const { data } = await httpClient.get("/reports/billing");
    return data.data;
  },
  async occupation() {
    const { data } = await httpClient.get("/reports/occupation");
    return data.data;
  },
};

export const ImportExportAPI = {
  async importPatients(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await httpClient.post("/import-export/csv/patients", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export const WrittenReportsAPI = {
  async drafts() {
    const { data } = await httpClient.get("/written-reports/drafts");
    return data.data || data;
  },
  async sent() {
    const { data } = await httpClient.get("/written-reports/sent");
    return data.data || data;
  },
  async received() {
    const { data } = await httpClient.get("/written-reports/received");
    return data.data || data;
  },
  async get(id: string) {
    const { data } = await httpClient.get(`/written-reports/${id}`);
    return data.data || data;
  },
  async create(dto: { title: string; content: string; recipientId: string }) {
    const { data } = await httpClient.post("/written-reports", dto);
    return data.data || data;
  },
  async update(id: string, dto: { title?: string; content?: string; recipientId?: string }) {
    const { data } = await httpClient.put(`/written-reports/${id}`, dto);
    return data.data || data;
  },
  async send(id: string) {
    const { data } = await httpClient.post(`/written-reports/${id}/send`);
    return data.data || data;
  },
  async remove(id: string) {
    await httpClient.delete(`/written-reports/${id}`);
  },
};

export const MessagesAPI = {
  async inbox(userId: string) {
    const { data } = await httpClient.get(`/messaging/inbox/${userId}`);
    return data.data;
  },
  async sent(senderId: string) {
    const { data } = await httpClient.get(`/messaging/sent/${senderId}`);
    return data.data;
  },
  async conversation(messageId: string) {
    const { data } = await httpClient.get(`/messaging/conversation/${messageId}`);
    return data.data;
  },
  async unreadCount(userId: string) {
    const { data } = await httpClient.get(`/messaging/unread/${userId}`);
    return data.data;
  },
  async send(dto: {
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId: string;
    receiverName?: string;
    subject?: string;
    content: string;
    isUrgent?: boolean;
    parentMessageId?: string;
  }) {
    const { data } = await httpClient.post("/messaging", dto);
    return data.data;
  },
  async markRead(id: string) {
    const { data } = await httpClient.patch(`/messaging/${id}/read`);
    return data.data;
  },
  async archive(id: string) {
    const { data } = await httpClient.patch(`/messaging/${id}/archive`);
    return data.data;
  },
  async delete(id: string) {
    await httpClient.delete(`/messaging/${id}`);
  },
};
