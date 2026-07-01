import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Send, Eye, Edit, Trash2, Clock, CheckCircle2, Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/format";
import { WrittenReportsAPI } from "@/api/http-client";
import { PersonnelAPI } from "@/api/http-client";
import { toast } from "sonner";

interface Report {
  _id: string; id: string; title: string; content: string;
  authorId: string; recipientId: string; status: "draft" | "sent";
  sentAt: string | null; createdAt: string; updatedAt: string;
}

interface Personnel {
  _id: string; firstName: string; lastName: string; role: string;
}

type Tab = "drafts" | "sent" | "received";

export default function WrittenReports() {
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<Tab>("drafts");
  const [reports, setReports] = useState<Report[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [open, setOpen] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [editing, setEditing] = useState<Report | null>(null);

  const loadReports = useCallback(async () => {
    try {
      let data: Report[];
      if (tab === "drafts") data = await WrittenReportsAPI.drafts();
      else if (tab === "sent") data = await WrittenReportsAPI.sent();
      else data = await WrittenReportsAPI.received();
      setReports(Array.isArray(data) ? data : []);
    } catch { setReports([]); }
  }, [tab]);

  const loadPersonnel = useCallback(async () => {
    try {
      const data = await PersonnelAPI.list();
      setPersonnel(Array.isArray(data) ? data : []);
    } catch { setPersonnel([]); }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { loadPersonnel(); }, [loadPersonnel]);

  const handleSend = async (id: string) => {
    try {
      await WrittenReportsAPI.send(id);
      await loadReports();
      toast.success("Rapport envoyé");
    } catch { toast.error("Erreur lors de l'envoi"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await WrittenReportsAPI.remove(id);
      await loadReports();
      toast.success("Rapport supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const getRecipientName = (id: string) => {
    const p = personnel.find(x => x._id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "drafts", label: "Brouillons", icon: Clock },
    { key: "sent", label: "Envoyés", icon: CheckCircle2 },
    { key: "received", label: "Reçus", icon: Inbox },
  ];

  const columns = [
    { key: "title", label: "Titre", render: (r: Report) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--primary-50)] flex items-center justify-center">
          <FileText className="h-4 w-4" style={{ color: "var(--primary-600)" }} />
        </div>
        <div>
          <div className="font-medium text-sm">{r.title}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {tab === "received" ? `De: ${getRecipientName(r.authorId)}` : `À: ${getRecipientName(r.recipientId)}`}
          </div>
        </div>
      </div>
    )},
    { key: "date", label: "Date", render: (r: Report) => (
      <span className="text-xs">{formatDateTime(r.sentAt || r.createdAt)}</span>
    )},
    { key: "status", label: "Statut", render: (r: Report) => (
      <StatusBadge status={r.status === "draft" ? "DRAFT" : "SUBMITTED"} />
    )},
    { key: "actions", label: "", render: (r: Report) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => setViewReport(r)} title="Voir">
          <Eye className="h-3 w-3" />
        </Button>
        {r.status === "draft" && (
          <>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }} title="Modifier">
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleSend(r._id || r.id)} title="Envoyer">
              <Send className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(r._id || r.id)} title="Supprimer">
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports écrits"
        description={`${reports.length} rapport${reports.length > 1 ? "s" : ""} · Comptes rendus et documents`}
        actions={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Nouveau rapport</Button>}
      />

      <Card>
        <CardHeader>
          <div className="flex gap-1 border-b border-[var(--border)] pb-0">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-[var(--primary-600)] text-[var(--primary-700)]"
                    : "border-transparent hover:text-[var(--text)]"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={reports}
            searchable
            searchPlaceholder="Rechercher un rapport..."
            rowKey={(r) => r._id || r.id}
            columns={columns}
            emptyMessage="Aucun rapport trouvé"
          />
        </CardContent>
      </Card>

      <ReportModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        editing={editing}
        personnel={personnel}
        onSaved={() => { loadReports(); setOpen(false); setEditing(null); }}
      />

      <Modal open={!!viewReport} onClose={() => setViewReport(null)} title={viewReport?.title || "Rapport"}
        description={`${viewReport?.status === "draft" ? "Brouillon" : "Envoyé"} · ${viewReport?.sentAt ? formatDateTime(viewReport.sentAt) : ""}`}
        size="lg">
        {viewReport && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <span>De: <strong>{getRecipientName(viewReport.authorId)}</strong></span>
              <span>À: <strong>{getRecipientName(viewReport.recipientId)}</strong></span>
            </div>
            <div className="p-4 rounded-lg bg-[var(--surface-2)] whitespace-pre-wrap text-sm leading-relaxed">
              {viewReport.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReportModal({ open, onClose, editing, personnel, onSaved }: {
  open: boolean; onClose: () => void; editing: Report | null;
  personnel: Personnel[]; onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setContent(editing.content);
      setRecipientId(editing.recipientId);
    } else {
      setTitle(""); setContent(""); setRecipientId("");
    }
  }, [editing, open]);

  const save = async () => {
    if (!title.trim() || !content.trim() || !recipientId) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      if (editing) {
        await WrittenReportsAPI.update(editing._id || editing.id, { title, content, recipientId });
        toast.success("Rapport mis à jour");
      } else {
        await WrittenReportsAPI.create({ title, content, recipientId });
        toast.success("Rapport créé");
      }
      onSaved();
    } catch { toast.error("Erreur lors de la sauvegarde"); }
  };

  return (
    <Modal open={open} onClose={onClose}
      title={editing ? "Modifier le rapport" : "Nouveau rapport"}
      description={editing ? "Modifiez le contenu du rapport" : "Rédiger un nouveau rapport écrit"}
      size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={save}>{editing ? "Mettre à jour" : "Créer le rapport"}</Button></>}>
      <div className="space-y-4">
        <div><Label required>Titre</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du rapport..." /></div>
        <div><Label required>Destinataire</Label>
          <Select value={recipientId} onChange={e => setRecipientId(e.target.value)}>
            <option value="">Sélectionner un destinataire...</option>
            {personnel.filter(p => p._id).map(p => (
              <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.role})</option>
            ))}
          </Select>
        </div>
        <div><Label required>Contenu</Label><Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Rédigez le contenu du rapport..." rows={8} /></div>
      </div>
    </Modal>
  );
}
