import { coreHttpClient } from "./http";

export const MessagingService = {
  inbox: async (userId: string) => {
    const { data } = await coreHttpClient.get(`/messaging/inbox/${userId}`);
    return data.data;
  },
  
  sent: async (senderId: string) => {
    const { data } = await coreHttpClient.get(`/messaging/sent/${senderId}`);
    return data.data;
  },
  
  conversation: async (messageId: string) => {
    const { data } = await coreHttpClient.get(`/messaging/conversation/${messageId}`);
    return data.data;
  },
  
  unreadCount: async (userId: string) => {
    const { data } = await coreHttpClient.get(`/messaging/unread/${userId}`);
    return data.data;
  },
  
  send: async (dto: any) => {
    const { data } = await coreHttpClient.post("/messaging", dto);
    return data.data;
  },
  
  markRead: async (id: string) => {
    const { data } = await coreHttpClient.patch(`/messaging/${id}/read`);
    return data.data;
  },
  
  archive: async (id: string) => {
    const { data } = await coreHttpClient.patch(`/messaging/${id}/archive`);
    return data.data;
  },
  
  delete: async (id: string) => {
    await coreHttpClient.delete(`/messaging/${id}`);
  }
};
