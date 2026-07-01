import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store";
import { MessageSquare, Send, Plus, Search, Circle, Check, CheckCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Label, Textarea } from "../components/ui/Input";
import { cn } from "../utils/cn";

interface ChatMessage {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  sentAt: string;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
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

const CONTACTS: Contact[] = [
  { id: "ims_dir_001", name: "Diallo Mamadou", role: "Directeur", avatar: "DM" },
  { id: "ims_mgr_001", name: "Ba Fatou", role: "Manager", avatar: "BF" },
  { id: "ims_liq_001", name: "Ndiaye Aminata", role: "Liquidateur", avatar: "NA" },
  { id: "ims_ana_001", name: "Sy Ousmane", role: "Analyste", avatar: "SO" },
];

const rawMessages: ChatMessage[] = [
  { id: "m1", fromId: "ims_liq_001", toId: "ims_mgr_001", text: "Bonjour, le dossier de remboursement n° CLM-202606-042 nécessite une validation. Le montant dépasse le seuil auto. Merci.", sentAt: "2026-06-28T09:15:00Z", read: false },
  { id: "m2", fromId: "ims_ana_001", toId: "ims_mgr_001", text: "J'ai terminé l'analyse des sinistres de juin. 15% d'augmentation vs mois dernier. Rapport disponible.", sentAt: "2026-06-27T14:30:00Z", read: false },
  { id: "m3", fromId: "ims_dir_001", toId: "ims_mgr_001", text: "Félicitations pour les résultats. Fixons une réunion vendredi pour discuter des objectifs du prochain semestre.", sentAt: "2026-06-25T08:45:00Z", read: true },
  { id: "m4", fromId: "ims_mgr_001", toId: "ims_liq_001", text: "Procédure validée. Vous pouvez procéder au remboursement du dossier CLM-202606-042.", sentAt: "2026-06-24T11:20:00Z", read: true },
  { id: "m5", fromId: "ims_dir_001", toId: "ims_mgr_001", text: "Pouvez-vous préparer le rapport trimestriel d'activité pour la réunion de vendredi ?", sentAt: "2026-06-29T08:00:00Z", read: false },
];

function buildConversations(meId: string): Conversation[] {
  const map = new Map<string, ChatMessage[]>();
  for (const msg of rawMessages) {
    const otherId = msg.fromId === meId ? msg.toId : msg.fromId;
    if (!map.has(otherId)) map.set(otherId, []);
    map.get(otherId)!.push(msg);
  }
  return CONTACTS
    .filter(c => c.id !== meId)
    .map(c => {
      const msgs = (map.get(c.id) || []).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
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

export function Messages() {
  const currentUser = useAuthStore(s => s.currentUser);
  const meId = currentUser?.id || "ims_mgr_001";
  const meName = currentUser?.fullName || "Ba Fatou";

  const [conversations, setConversations] = useState<Conversation[]>(() => buildConversations(meId));
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.contactId === activeContactId);
  const unreadTotal = conversations.reduce((s, c) => s + c.unread, 0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  const handleSelect = (contactId: string) => {
    setActiveContactId(contactId);
    setConversations(prev => prev.map(c => c.contactId === contactId ? { ...c, unread: 0, messages: c.messages.map(m => m.fromId !== meId ? { ...m, read: true } : m) } : c));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeContactId) return;
    const msg: ChatMessage = { id: `m_${Date.now()}`, fromId: meId, text: replyText.trim(), sentAt: new Date().toISOString(), read: true };
    setConversations(prev => prev.map(c => c.contactId === activeContactId ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastMessageAt: msg.sentAt } : c));
    setReplyText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
  };

  const handleNewMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactId = formData.get("to") as string;
    const text = formData.get("content") as string;
    if (!contactId || !text) return;
    const msg: ChatMessage = { id: `m_${Date.now()}`, fromId: meId, text, sentAt: new Date().toISOString(), read: true };
    setConversations(prev => {
      const exists = prev.find(c => c.contactId === contactId);
      if (exists) return prev.map(c => c.contactId === contactId ? { ...c, messages: [...c.messages, msg] } : c);
      const contact = CONTACTS.find(c => c.id === contactId)!;
      return [{ contactId: contact.id, contactName: contact.name, contactRole: contact.role, contactAvatar: contact.avatar, messages: [msg], lastMessage: msg.text, lastMessageAt: msg.sentAt, unread: 0 }, ...prev];
    });
    setActiveContactId(contactId);
    setComposeOpen(false);
  };

  const filtered = conversations.filter(c => c.contactName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messagerie</h1>
          <p className="text-sm text-slate-500">{unreadTotal > 0 ? `${unreadTotal} non lu${unreadTotal > 1 ? "s" : ""}` : "Aucun message non lu"}</p>
        </div>
        <Button onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" /> Nouvelle conversation</Button>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        {/* Left sidebar */}
        <div className="w-72 lg:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-transparent dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && <p className="text-xs text-center py-8 text-slate-500">Aucune conversation</p>}
            {filtered.map(conv => (
              <button key={conv.contactId} onClick={() => handleSelect(conv.contactId)}
                className={cn("w-full text-left p-3 border-b border-slate-200 dark:border-slate-700 transition last:border-b-0",
                  activeContactId === conv.contactId ? "bg-brand-50 dark:bg-brand-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800")}>
                <div className="flex items-start gap-2.5">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                    conv.unread > 0 ? "bg-brand-600" : "bg-slate-400")}>{conv.contactAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm truncate", conv.unread > 0 ? "font-semibold" : "font-medium")}>{conv.contactName}</span>
                      <span className="text-[10px] shrink-0 ml-2 text-slate-400">{formatChatTime(conv.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {conv.unread > 0 && <Circle className="h-2 w-2 fill-brand-600 text-brand-600" />}
                      <p className={cn("text-xs truncate", conv.unread > 0 ? "font-medium" : "")} style={{ color: "var(--text-muted)" }}>{conv.lastMessage}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">{activeConv.contactAvatar}</div>
                <div>
                  <p className="text-sm font-semibold">{activeConv.contactName}</p>
                  <p className="text-xs text-slate-500">{activeConv.contactRole}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {activeConv.messages.map(msg => {
                  const isMe = msg.fromId === meId;
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isMe
                          ? "bg-brand-600 text-white rounded-br-md"
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

              <div className="border-t border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-end gap-2">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Écrivez un message…"
                    className="flex-1 resize-none px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-transparent dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 max-h-32" />
                  <Button onClick={handleSendReply} disabled={!replyText.trim()} size="icon" className="h-10 w-10 rounded-xl shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
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
            <select name="to" required className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-transparent text-sm dark:border-slate-700">
              <option value="">Sélectionner…</option>
              {CONTACTS.filter(c => c.id !== meId).map(c => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
            </select>
          </div>
          <div><Label required>Message</Label><Textarea name="content" required rows={4} placeholder="Écrivez votre message…" /></div>
        </form>
      </Modal>
    </div>
  );
}
