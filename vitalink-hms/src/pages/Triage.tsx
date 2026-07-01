import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Thermometer, Heart, Activity, AlertTriangle, Stethoscope, Clock, ListChecks } from "lucide-react";
import { PatientsAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/Stat";
import { usePermission } from "@/hooks/usePermission";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";

const TRIAGE_LEVELS = [
  { value: "P1_URGENCE", label: "P1 - Urgence vitale", color: "danger" as const },
  { value: "P2_TRES_URGENT", label: "P2 - Très urgent", color: "danger" as const },
  { value: "P3_URGENT", label: "P3 - Urgent", color: "warning" as const },
  { value: "P4_SEMI_URGENT", label: "P4 - Semi-urgent", color: "info" as const },
  { value: "P5_NON_URGENT", label: "P5 - Non urgent", color: "success" as const },
];

// Mock data for triage queue
const MOCK_TRIAGE = [
  { id: "tri-1", patientName: "Mariama Cissé", mrn: "P-20240985", triageLevel: "P1_URGENCE", chiefComplaint: "Douleur thoracique intense", temperature: 38.9, heartRate: 112, oxygenSaturation: 92, triagedAt: new Date(Date.now() - 5 * 60000).toISOString(), seenByDoctor: false },
  { id: "tri-2", patientName: "Ousmane Diallo", mrn: "P-20240321", triageLevel: "P3_URGENT", chiefComplaint: "Fièvre persistante 3 jours", temperature: 39.2, heartRate: 98, oxygenSaturation: 96, triagedAt: new Date(Date.now() - 15 * 60000).toISOString(), seenByDoctor: false },
  { id: "tri-3", patientName: "Aïcha Ba", mrn: "P-20240712", triageLevel: "P2_TRES_URGENT", chiefComplaint: "Traumatisme crânien léger", temperature: 37.1, heartRate: 88, oxygenSaturation: 98, triagedAt: new Date(Date.now() - 25 * 60000).toISOString(), seenByDoctor: false },
  { id: "tri-4", patientName: "Fatou Ndiaye", mrn: "P-20241001", triageLevel: "P4_SEMI_URGENT", chiefComplaint: "Consultation suivi grossesse", temperature: 36.8, heartRate: 76, oxygenSaturation: 99, triagedAt: new Date(Date.now() - 40 * 60000).toISOString(), seenByDoctor: false },
  { id: "tri-5", patientName: "Moussa Diop", mrn: "P-20241105", triageLevel: "P5_NON_URGENT", chiefComplaint: "Renouvellement ordonnance", temperature: 36.5, heartRate: 72, oxygenSaturation: 99, triagedAt: new Date(Date.now() - 120 * 60000).toISOString(), seenByDoctor: true },
];

export default function Triage() {
  const { can } = usePermission();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const triageQueue = MOCK_TRIAGE.filter(t => !t.seenByDoctor).sort((a, b) => {
    const order = ["P1_URGENCE", "P2_TRES_URGENT", "P3_URGENT", "P4_SEMI_URGENT", "P5_NON_URGENT"];
    return order.indexOf(a.triageLevel) - order.indexOf(b.triageLevel);
  });

  const urgentCount = triageQueue.filter(t => ["P1_URGENCE", "P2_TRES_URGENT"].includes(t.triageLevel)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Triage - Urgences"
        description="Évaluation rapide, orientation et priorisation des patients"
        actions={can("triage.write") && (
          <Button onClick={() => setOpen(true)}>
            <Activity className="h-4 w-4" /> Nouveau triage
          </Button>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="En attente médecin" value={triageQueue.length} icon={<Clock className="h-5 w-5" />} color="warning" />
        <StatCard label="Cas urgents (P1-P2)" value={urgentCount} icon={<AlertTriangle className="h-5 w-5" />} color="danger" />
        <StatCard label="Triés aujourd'hui" value="24" icon={<ListChecks className="h-5 w-5" />} color="info" />
        <StatCard label="Temps attente moyen" value="18 min" icon={<Clock className="h-5 w-5" />} color="primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            File d'attente triage <Badge variant="danger" dot>{urgentCount} urgents</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={triageQueue}
            searchable
            searchPlaceholder="Rechercher un patient..."
            rowKey={(t) => t.id}
            columns={[
              { key: "triageLevel", label: "Priorité", render: (t: any) => {
                const level = TRIAGE_LEVELS.find(l => l.value === t.triageLevel);
                return <Badge variant={(level?.color || "neutral") as any}>{level?.label.split(" - ")[0]}</Badge>;
              }},
              { key: "patient", label: "Patient", render: (t: any) => (
                <div className="flex items-center gap-3">
                  <Avatar name={t.patientName} size="sm" />
                  <div>
                    <div className="font-medium">{t.patientName}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t.mrn}</div>
                  </div>
                </div>
              )},
              { key: "chiefComplaint", label: "Motif", sortable: true },
              { key: "vitals", label: "Constantes", render: (t: any) => (
                <div className="flex gap-2 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">T {t.temperature}°C</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">FC {t.heartRate}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">SpO2 {t.oxygenSaturation}%</span>
                </div>
              )},
              { key: "waitTime", label: "Attente", render: (t: any) => {
                const mins = Math.floor((Date.now() - new Date(t.triagedAt).getTime()) / 60000);
                return <span className="text-xs">{mins} min</span>;
              }},
              { key: "status", label: "Statut", render: (t: any) => t.seenByDoctor ? <Badge variant="success">Vu</Badge> : <Badge variant="warning">En attente</Badge> },
            ]}
          />
        </CardContent>
      </Card>

      <TriageModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function TriageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    patientId: "", patientName: "", mrn: "",
    temperature: "", heartRate: "", bloodPressureSystolic: "", bloodPressureDiastolic: "",
    respiratoryRate: "", oxygenSaturation: "", weight: "", height: "",
    triageLevel: "P5_NON_URGENT", chiefComplaint: "", symptoms: "", orientation: "", notes: "",
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouveau triage" description="Saisie des constantes vitales et orientation" size="xl"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => { toast.success("Patient trié avec succès"); onClose(); }}>Valider le triage</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label required>Patient</Label><Input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} placeholder="Rechercher un patient..." /></div>
          <div className="col-span-2"><Label required>Motif de consultation</Label><Input value={form.chiefComplaint} onChange={e => setForm({...form, chiefComplaint: e.target.value})} /></div>
        </div>

        <div className="rounded-lg border border-[var(--border)] p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Thermometer className="h-4 w-4" /> Constantes vitales</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label>Température (°C)</Label><Input type="number" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
            <div><Label>Fréquence cardiaque</Label><Input type="number" value={form.heartRate} onChange={e => setForm({...form, heartRate: e.target.value})} /></div>
            <div><Label>Tension systolique</Label><Input type="number" value={form.bloodPressureSystolic} onChange={e => setForm({...form, bloodPressureSystolic: e.target.value})} /></div>
            <div><Label>Tension diastolique</Label><Input type="number" value={form.bloodPressureDiastolic} onChange={e => setForm({...form, bloodPressureDiastolic: e.target.value})} /></div>
            <div><Label>Fréquence respiratoire</Label><Input type="number" value={form.respiratoryRate} onChange={e => setForm({...form, respiratoryRate: e.target.value})} /></div>
            <div><Label>Saturation O2 (%)</Label><Input type="number" value={form.oxygenSaturation} onChange={e => setForm({...form, oxygenSaturation: e.target.value})} /></div>
            <div><Label>Poids (kg)</Label><Input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
            <div><Label>Taille (cm)</Label><Input type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><Label required>Niveau de triage</Label>
            <Select value={form.triageLevel} onChange={e => setForm({...form, triageLevel: e.target.value})}>
              {TRIAGE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
          </div>
          <div><Label>Orientation</Label>
            <Select value={form.orientation} onChange={e => setForm({...form, orientation: e.target.value})}>
              <option value="">Sélectionner...</option>
              <option value="Urgences">Urgences</option>
              <option value="Consultation">Consultation externe</option>
              <option value="Hospitalisation">Hospitalisation</option>
              <option value="Bloc opératoire">Bloc opératoire</option>
            </Select>
          </div>
          <div className="col-span-2"><Label>Symptômes</Label><Textarea value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} /></div>
        </div>
      </div>
    </Modal>
  );
}
