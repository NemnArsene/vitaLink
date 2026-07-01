import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { MessageSquare, Send, Plus, Search, Circle, Check, CheckCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Label, Textarea } from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { MessagesAPI, PersonnelAPI } from "@/api/http-client";

interface ApiMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName?: string;
  subject?: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  folder: string;
  parentMessageId?: string;
  attachments?: string[];
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ChatMessage {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  sentAt: string;
  read: boolean;
}

interface Conversation {
  contactId: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

function toContactAvatar(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function toChatMessage(m: ApiMessage, meId: string): ChatMessage {
  return {
    id: m._id,
    fromId: m.senderId,
    toId: m.receiverId,
    text: m.content,
    sentAt: m.createdAt,
    read: m.isRead || m.senderId === meId,
  };
}

function buildConversations(messages: ApiMessage[], contacts: Contact[], meId: string): Conversation[] {
  const byContact = new Map<string, ApiMessage[]>();
  for (const msg of messages) {
    const otherId = msg.senderId === meId ? msg.receiverId : msg.senderId;
    if (!byContact.has(otherId)) byContact.set(otherId, []);
    byContact.get(otherId)!.push(msg);
  }
  return contacts
    .filter(c => c.id !== meId)
    .map(c => {
      const msgs = (byContact.get(c.id) || [])
        .map(m => toChatMessage(m, meId))
        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      const last = msgs[msgs.length - 1];
      return {
        contactId: c.id,
        contactName: c.name,
        contactRole: c.role,
        contactAvatar: c.avatar,
        messages: msgs,
        lastMessage: last?.text || "",
        lastMessageAt: last?.sentAt || "",
        unread: msgs.filter(m => m.fromId !== meId && !m.read).length,
      };
    })
    .filter(c => c.messages.length > 0)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

function formatChatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function Messages() {
  const authUser = useAuthStore(s => s.user);
  const meId = authUser?.id || "";
  const meName = authUser ? `${authUser.firstName} ${authUser.lastName}` : "";
  const meRole = authUser?.role?.replace("ROLE_", "").replace(/_/g, " ") || "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!meId) return;
    try {
      setLoading(true);
      const [personnel, inbox, sent] = await Promise.all([
        PersonnelAPI.list().catch(() => []),
        MessagesAPI.inbox(meId).catch(() => []),
        MessagesAPI.sent(meId).catch(() => []),
      ]);
      const contactList: Contact[] = (Array.isArray(personnel) ? personnel : []).map((p: any) => ({
        id: p._id || p.id,
        name: `${p.prenom || ""} ${p.nom || ""}`.trim() || p.email || "Inconnu",
        role: (p.role || "Personnel").replace("ROLE_", "").replace(/_/g, " "),
        avatar: toContactAvatar(`${p.prenom || ""} ${p.nom || ""}`.trim() || "?"),
      }));
      setContacts(contactList);
      const allMessages = [...(Array.isArray(inbox) ? inbox : []), ...(Array.isArray(sent) ? sent : [])];
      const unique = new Map<string, ApiMessage>();
      for (const m of allMessages) unique.set(m._id, m);
      setConversations(buildConversations([...unique.values()], contactList, meId));
    } catch {
      setContacts([]);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [meId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactId]);

  const handleSelect = async (contactId: string) => {
    setActiveContactId(contactId);
    const conv = conversations.find(c => c.contactId === contactId);
    if (!conv) return;
    const unreadIds = conv.messages.filter(m => m.fromId !== meId && !m.read).map(m => m.id);
    if (unreadIds.length > 0) {
      await Promise.all(unreadIds.map(id => MessagesAPI.markRead(id).catch(() => {})));
      setConversations(prev => prev.map(c =>
        c.contactId === contactId
          ? { ...c, unread: 0, messages: c.messages.map(m => m.fromId !== meId ? { ...m, read: true } : m) }
          : c
      ));
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeContactId || !authUser) return;
    const contact = contacts.find(c => c.id === activeContactId);
    try {
      const created = await MessagesAPI.send({
        senderId: meId,
        senderName: meName,
        senderRole: meRole,
        receiverId: activeContactId,
        receiverName: contact?.name,
        content: replyText.trim(),
      });
      const chatMsg = toChatMessage(created, meId);
      setConversations(prev => prev.map(c =>
        c.contactId === activeContactId
          ? { ...c, messages: [...c.messages, chatMsg], lastMessage: chatMsg.text, lastMessageAt: chatMsg.sentAt }
          : c
      ));
      setReplyText("");
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
  };

  const handleNewMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactId = formData.get("to") as string;
    const text = formData.get("content") as string;
    if (!contactId || !text || !authUser) return;
    const contact = contacts.find(c => c.id === contactId);
    try {
      const created = await MessagesAPI.send({
        senderId: meId,
        senderName: meName,
        senderRole: meRole,
        receiverId: contactId,
        receiverName: contact?.name,
        content: text,
      });
      const chatMsg = toChatMessage(created, meId);
      setConversations(prev => {
        const exists = prev.find(c => c.contactId === contactId);
        if (exists) return prev.map(c =>
          c.contactId === contactId
            ? { ...c, messages: [...c.messages, chatMsg], lastMessage: chatMsg.text, lastMessageAt: chatMsg.sentAt }
            : c
        );
        const c = contact || { id: contactId, name: contactId, role: "", avatar: "??" };
        return [{
          contactId: c.id, contactName: c.name, contactRole: c.role, contactAvatar: c.avatar,
          messages: [chatMsg], lastMessage: chatMsg.text, lastMessageAt: chatMsg.sentAt, unread: 0,
        }, ...prev];
      });
      setActiveContactId(contactId);
      setComposeOpen(false);
    } catch {}
  };

  const activeConv = conversations.find(c => c.contactId === activeContactId);
  const unreadTotal = conversations.reduce((s, c) => s + c.unread, 0);
  const filtered = conversations.filter(c => c.contactName.toLowerCase().includes(search.toLowerCase()));

  if (!meId) {
    return (
      <div className="flex flex-col h-[calc(100vh-7rem)] items-center justify-center" style={{ color: "var(--text-muted)" }}>
        <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-base font-medium">Connectez-vous pour accéder à la messagerie</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <PageHeader
        title="Messagerie"
        description={loading ? "Chargement…" : unreadTotal > 0 ? `${unreadTotal} non lu${unreadTotal > 1 ? "s" : ""}` : "Aucun message non lu"}
        actions={<Button onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" /> Nouvelle conversation</Button>}
      />

      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-[var(--border)] bg-white dark:bg-slate-900 shadow-sm">
        {/* Left sidebar — conversation list */}
        <div className="w-72 lg:w-80 border-r border-[var(--border)] flex flex-col shrink-0">
          <div className="p-2 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>Aucune conversation</p>
            )}
            {filtered.map(conv => (
              <button key={conv.contactId} onClick={() => handleSelect(conv.contactId)}
                className={cn("w-full text-left p-3 border-b border-[var(--border)] transition last:border-b-0",
                  activeContactId === conv.contactId ? "bg-[var(--primary-50)]" : "hover:bg-[var(--surface-2)]")}>
                <div className="flex items-start gap-2.5">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                    conv.unread > 0 ? "bg-[var(--primary)]" : "bg-slate-400")}>{conv.contactAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm truncate", conv.unread > 0 ? "font-semibold" : "font-medium")}>{conv.contactName}</span>
                      <span className="text-[10px] shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>{formatChatTime(conv.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.unread > 0 && <Circle className="h-2 w-2 fill-[var(--primary)] text-[var(--primary)]" />}
                      <p className={cn("text-xs truncate", conv.unread > 0 ? "font-medium" : "")} style={{ color: "var(--text-muted)" }}>{conv.lastMessage}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — chat */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)]">
                <div className="h-9 w-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">{activeConv.contactAvatar}</div>
                <div>
                  <p className="text-sm font-semibold">{activeConv.contactName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{activeConv.contactRole}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {activeConv.messages.map(msg => {
                  const isMe = msg.fromId === meId;
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isMe
                          ? "bg-[var(--primary)] text-white rounded-br-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md"
                      )}>
                        <p>{msg.text}</p>
                        <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                          <span className={cn("text-[10px]", isMe ? "text-white/70" : "text-slate-400")}>{formatChatTime(msg.sentAt)}</span>
                          {isMe && (msg.read ? <CheckCheck className="h-3 w-3 text-white/70" /> : <Check className="h-3 w-3 text-white/70" />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[var(--border)] p-3">
                <div className="flex items-end gap-2">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Écrivez un message…"
                    className="flex-1 resize-none px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 max-h-32" />
                  <Button onClick={handleSendReply} disabled={!replyText.trim()} size="icon" className="h-10 w-10 rounded-xl shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ color: "var(--text-muted)" }}>
              <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-base font-medium">Sélectionnez une conversation</p>
              <p className="text-sm mt-1">Choisissez une discussion pour commencer à chatter</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="Nouveau message" size="lg"
        footer={<><Button variant="ghost" onClick={() => setComposeOpen(false)}>Annuler</Button><Button type="submit" form="compose-form">Envoyer</Button></>}>
        <form id="compose-form" onSubmit={handleNewMessage} className="space-y-3">
          <div><Label required>Destinataire</Label>
            <select name="to" required className="w-full mt-1 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-transparent text-sm">
              <option value="">Sélectionner…</option>
              {contacts.filter(c => c.id !== meId).map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
              ))}
            </select>
          </div>
          <div><Label required>Message</Label><Textarea name="content" required rows={4} placeholder="Écrivez votre message…" /></div>
        </form>
      </Modal>
    </div>
  );
}