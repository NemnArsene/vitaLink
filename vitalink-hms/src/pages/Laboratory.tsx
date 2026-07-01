import { useState, useEffect, useCallback } from "react";
import { FlaskConical, Microscope, Plus, Bell, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Stat";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/format";
import { httpClient } from "@/api/http-client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface Exam {
  _id: string; id: string; patientName: string; medicalRecordNumber: string; examName: string;
  category: string; requestedBy: string; requestedAt: string; statut: string;
  resultValue: string | null; doctorNotified: boolean; examCode: string;
}

export default function Laboratory() {
  const { can } = usePermission();
  const user = useAuthStore(s => s.user);
  const isDoctor = user?.role === "ROLE_DOCTOR";
  const doctorName = isDoctor && user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const [exams, setExams] = useState<Exam[]>([]);
  const [open, setOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState<Exam | null>(null);
  const [resultValue, setResultValue] = useState("");

  const loadExams = useCallback(async () => {
    try {
      const params: any = {};
      if (isDoctor && doctorName) params.requestedBy = doctorName;
      const { data } = await httpClient.get("/laboratory", { params });
      const raw = data?.data?.data || data?.data || data?.results || data || [];
      const items = (Array.isArray(raw) ? raw : []).map((r: any) => toExam(r));
      setExams(items);
    } catch {
      setExams([]);
    }
  }, [isDoctor, doctorName]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const notifyDoctor = async (id: string) => {
    try {
      await httpClient.post(`/laboratory/${id}/notify-doctor`);
      setExams(exams.map(e => e._id === id || e.id === id ? { ...e, doctorNotified: true } : e));
      toast.success("Médecin notifié");
    } catch {
      toast.error("Erreur de notification");
    }
  };

  const saveResult = async () => {
    if (!resultOpen || !resultValue.trim()) { toast.error("Veuillez saisir un résultat"); return; }
    try {
      await httpClient.post(`/laboratory/${resultOpen._id || resultOpen.id}/record-result`, {
        resultValue: resultValue.trim(), resultText: resultValue.trim(), interpretedBy: user?.email || "lab",
      });
      await loadExams();
      setResultOpen(null);
      setResultValue("");
      toast.success("Résultat enregistré");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const pendingNotification = exams.filter(e => e.statut === "termine" && !e.doctorNotified).length;

  const filterLabel = isDoctor ? ` — Mes examens (${doctorName})` : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratoire"
        description={`${exams.length} examens · Gestion des prélèvements et résultats${filterLabel}`}
        actions={can("laboratory.write") && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nouvel examen</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="En attente" value={exams.filter(e => e.statut === "en_attente").length} icon={<Clock className="h-5 w-5" />} color="warning" />
        <StatCard label="En cours" value={exams.filter(e => ["preleve", "en_cours"].includes(e.statut)).length} icon={<Microscope className="h-5 w-5" />} color="info" />
        <StatCard label="Terminés" value={exams.filter(e => e.statut === "termine").length} icon={<CheckCircle2 className="h-5 w-5" />} color="success" />
        <StatCard label="À notifier médecin" value={pendingNotification} icon={<Bell className="h-5 w-5" />} color="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Examens de laboratoire
            {pendingNotification > 0 && <Badge variant="danger" dot>{pendingNotification} à notifier</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={exams}
            searchable
            searchPlaceholder="Rechercher patient, examen..."
            rowKey={(e) => e.id}
            columns={[
              { key: "patient", label: "Patient", render: (e: Exam) => (
                <div className="flex items-center gap-3">
                  <Avatar name={e.patientName} size="sm" />
                  <div>
                    <div className="font-medium text-sm">{e.patientName}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{e.medicalRecordNumber}</div>
                  </div>
                </div>
              )},
              { key: "examName", label: "Examen", render: (e: Exam) => (
                <div>
                  <div className="font-medium text-sm">{e.examName}</div>
                  <Badge variant="neutral">{e.category}</Badge>
                </div>
              )},
              { key: "requestedBy", label: "Prescripteur" },
              { key: "requestedAt", label: "Prescrit le", render: (e: Exam) => <span className="text-xs">{formatDateTime(e.requestedAt)}</span> },
              { key: "result", label: "Résultat", render: (e: Exam) => e.resultValue ? <span className="font-mono text-xs">{e.resultValue}</span> : <span style={{ color: "var(--text-subtle)" }}>—</span> },
              { key: "statut", label: "Statut", render: (e: Exam) => (
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.statut} />
                  {e.statut === "termine" && !e.doctorNotified && <Badge variant="warning" dot>Nouveau</Badge>}
                </div>
              )},
              { key: "actions", label: "", render: (e: Exam) => (
                <div className="flex gap-1">
                  {e.statut === "preleve" && <Button size="sm" onClick={() => { setResultOpen(e); setResultValue(""); }} variant="primary"><FlaskConical className="h-3 w-3" /> Saisir résultat</Button>}
                  {e.statut === "termine" && !e.doctorNotified && <Button size="sm" variant="outline" onClick={() => notifyDoctor(e.id)}><Bell className="h-3 w-3" /> Notifier</Button>}
                </div>
              )},
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!resultOpen} onClose={() => setResultOpen(null)} title="Saisie du résultat" description={resultOpen?.examName}
        footer={<><Button variant="ghost" onClick={() => setResultOpen(null)}>Annuler</Button><Button onClick={saveResult}>Enregistrer</Button></>}>
        <div className="space-y-3">
          <div><Label>Patient</Label><div className="font-semibold">{resultOpen?.patientName}</div></div>
          <div><Label>Examen</Label><div>{resultOpen?.examName}</div></div>
          <div><Label required>Résultat</Label><Textarea value={resultValue} onChange={e => setResultValue(e.target.value)} placeholder="Saisir le résultat de l'analyse..." /></div>
        </div>
      </Modal>

      <NewExamModal open={open} onClose={() => setOpen(false)} onCreated={(e) => { setExams([...exams, e]); toast.success("Examen créé"); }} />
    </div>
  );
}

function toExam(raw: any): Exam {
  return {
    _id: raw._id || raw.id,
    id: raw._id || raw.id,
    patientName: raw.patientName || "",
    medicalRecordNumber: raw.medicalRecordNumber || "",
    examName: raw.examName || "",
    category: raw.category || "",
    requestedBy: raw.requestedBy || "",
    requestedAt: raw.requestedAt || raw.createdAt || new Date().toISOString(),
    statut: raw.statut || "en_attente",
    resultValue: raw.resultValue || null,
    doctorNotified: raw.doctorNotified || false,
    examCode: raw.examCode || "",
  };
}

function NewExamModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (e: Exam) => void }) {
  const [form, setForm] = useState({ patientSearch: "", examName: "NFS - Numération formule sanguine", category: "Hématologie", sampleType: "Sang veineux" });

  const create = async () => {
    if (!form.patientSearch.trim()) { toast.error("Veuillez renseigner le patient"); return; }
    try {
      const { data } = await httpClient.post("/laboratory", {
        patientName: form.patientSearch,
        patientId: form.patientSearch,
        medicalRecordNumber: `P-${Date.now().toString().slice(-8)}`,
        examCode: form.examName.substring(0, 10).toUpperCase().replace(/\s/g, "_"),
        examName: form.examName,
        category: form.category,
        sampleType: form.sampleType,
        requestedBy: form.patientSearch,
      });
      onCreated(toExam(data?.data || data));
      onClose();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvel examen" description="Enregistrer une nouvelle analyse"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={create}>Créer l'examen</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Label required>Patient</Label><Input value={form.patientSearch} onChange={e => setForm({ ...form, patientSearch: e.target.value })} placeholder="Rechercher un patient..." /></div>
        <div className="col-span-2"><Label required>Examen</Label>
          <Select value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })}>
            <option>NFS - Numération formule sanguine</option>
            <option>Glycémie à jeun</option>
            <option>ECBU - Examen cytobactériologique des urines</option>
            <option>Bilan hépatique complet</option>
            <option>Bilan rénal</option>
            <option>TP-TCA - Bilan coagulation</option>
            <option>VS - Vitesse de sédimentation</option>
            <option>CRP - Protéine C réactive</option>
          </Select>
        </div>
        <div><Label>Catégorie</Label><Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Hématologie</option><option>Biochimie</option><option>Microbiologie</option><option>Immunologie</option></Select></div>
        <div><Label>Type de prélèvement</Label><Select value={form.sampleType} onChange={e => setForm({ ...form, sampleType: e.target.value })}><option>Sang veineux</option><option>Urines</option><option>Selles</option><option>Prélèvement nasal</option></Select></div>
      </div>
    </Modal>
  );
}
