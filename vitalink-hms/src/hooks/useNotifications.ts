import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";

export interface NotificationItem {
  id: string;
  type: "success" | "warning" | "info" | "login";
  message: string;
  time: string;
  read: boolean;
  raw: any;
}

const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_BASE || "http://localhost:3000";

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("hms-auth");
    if (!stored) return null;
    const { state } = JSON.parse(stored);
    return state?.token || null;
  } catch {
    return null;
  }
}

function eventToNotification(raw: any): NotificationItem {
  const meta = raw._meta || {};
  const typeMap: Record<string, "success" | "warning" | "info" | "login"> = {
    "message.new": "info",
    "laboratory.result_ready": "success",
    "claim.status_changed": "info",
    "claim.new": "info",
    "eligibility.result": "success",
    "system.alert": "warning",
  };
  const msgMap: Record<string, string> = {
    "message.new": `Nouveau message de ${raw.senderName || "quelqu'un"}`,
    "laboratory.result_ready": `Résultats prêts : ${raw.patientName || ""} — ${raw.examType || ""}`,
    "system.alert": raw.message || "Alerte système",
  };
  const message = msgMap[meta.type] || raw.message || raw.notification || "Notification";
  const relTime = formatRelativeTime(meta.timestamp);
  return {
    id: meta.id || crypto.randomUUID(),
    type: typeMap[meta.type] || "info",
    message,
    time: relTime,
    read: false,
    raw,
  };
}

function formatRelativeTime(iso: string): string {
  if (!iso) return "à l'instant";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "à l'instant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
  return `${Math.floor(diff / 86400000)} j`;
}

export function useNotifications() {
  const userId = useAuthStore(s => s.user?.id);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback((raw: any) => {
    setNotifications(prev => {
      const n = eventToNotification(raw);
      if (prev.some(p => p.id === n.id)) return prev;
      return [n, ...prev].slice(0, 50);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const token = getToken();
    if (!token) return;

    const url = `${GATEWAY_BASE}/api/v1/notifications/subscribe?token=${encodeURIComponent(token)}`;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addNotification(data);
        } catch {}
      };

      es.onerror = () => {
        es.close();
        reconnectTimer.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [userId, addNotification]);

  return { notifications, unread, markAllRead, markRead };
}