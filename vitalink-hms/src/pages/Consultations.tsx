import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Plus, Stethoscope } from "lucide-react";
import { ConsultationsService, PatientsService } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { formatDateTime } from "@/lib/format";
import { DOCTORS } from "@/mocks/seed";
import { toast } from "sonner";
import type { Consultation } from "@/types";

const URGENCY_COLOR: Record<string, "danger" | "warning" | "info" | "neutral" | "success"> = {
  P1_URGENCE: "danger",
  P2_TRES_URGENT: "danger",
  P3_URGENT: "warning",
  P4_SEMI_URGENT: "info",
  P5_NON_URGENT: "success",
};

export default function Consultations() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patient");

  const { data: consultations = [] } = useQuery({ queryKey: ["consultations"], queryFn: ConsultationsService.list });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => PatientsService.list() });

  const createMut = useMutation({
    mutationFn: ConsultationsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["consultations"] }); setOpen(false); toast.success("Consultation créée"); },
  });

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      setOpen(true);
    }
  }, [preselectedPatientId, patients]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultations"
        description={`${consultations.length} consultations · Suivi des médecins référents`}
        actions={can("consultation.write") && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nouvelle consultation</Button>}
      />
      <DataTable
        data={consultations}
        searchable
        searchPlaceholder="Rechercher par patient, médecin, motif..."
        emptyIcon={<Stethoscope className="h-6 w-6" />}
        emptyTitle="Aucune consultation"
        rowKey={(c) => c.id}
        columns={[
          { key: "scheduledAt", label: "Date", sortable: true, render: c => <span className="text-xs">{formatDateTime(c.scheduledAt)}</span> },
          { key: "urgency", label: "Urgence", render: (c: any) => c.urgency ? <Badge variant={URGENCY_COLOR[c.urgency]}>{c.urgency.split('_')[0]}</Badge> : <Badge variant="neutral">--</Badge> },
          { key: "reason", label: "Motif", sortable: true, render: c => (
            <div>
              <div className="font-medium">{c.reason}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{c.type}</div>
            </div>
          )},
          { key: "doctorName", label: "Médecin" },
          { key: "diagnosis", label: "Diagnostic", render: (c: any) => c.diagnosis || <span style={{ color: "var(--text-subtle)" }}>—</span> },
          { key: "status", label: "Statut", render: c => <StatusBadge status={c.status} /> },
        ]}
      />
      <CreateConsultationModal
        open={open}
        onClose={() => setOpen(false)}
        patients={patients}
        loading={createMut.isPending}
        onSubmit={(c: any) => createMut.mutate(c)}
        preselectedPatientId={preselectedPatientId}
      />
    </div>
  );
}

function CreateConsultationModal({ open, onClose, patients, onSubmit, loading, preselectedPatientId }: any) {
  const doctor = DOCTORS[0];
  const [form, setForm] = useState<Omit<Consultation, "id" | "createdAt" | "updatedAt">>({
    patientId: (preselectedPatientId || patients[0]?.id) ?? "",
    doctorId: doctor.id,
    doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    type: "GENERAL",
    status: "SCHEDULED",
    insuranceStatus: "VERIFYING",
    paymentStatus: "PENDING_PAYMENT",
    urgency: "P5_NON_URGENT",
    scheduledAt: new Date().toISOString(),
    reason: "",
    diagnosis: "",
  });

  useEffect(() => {
    if (patients.length > 0 && (preselectedPatientId || !form.patientId)) {
      setForm(prev => ({ ...prev, patientId: preselectedPatientId || patients[0].id }));
    }
  }, [patients, preselectedPatientId, form.patientId]);

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle consultation" size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => onSubmit(form)} loading={loading}>Créer</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Label required>Patient</Label>
          <Select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
            <option value="">Sélectionner…</option>
            {patients.map((p: any) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.fileNumber})</option>)}
          </Select>
        </div>
        <div><Label>Type</Label><Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}><option>GENERAL</option><option>SPECIALIST</option><option>EMERGENCY</option><option>FOLLOW_UP</option></Select></div>
        <div><Label>Niveau d'urgence</Label>
          <Select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value as any })}>
            {Object.keys(URGENCY_COLOR).map(k => (
              <option key={k} value={k}>{k.replace('_', ' ')}</option>
            ))}
          </Select>
        </div>
        <div><Label>Médecin</Label><Select value={form.doctorId} onChange={e => {
          const d = DOCTORS.find(x => x.id === e.target.value)!;
          setForm({ ...form, doctorId: d.id, doctorName: `Dr. ${d.firstName} ${d.lastName}` });
        }}>
          {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} — {d.specialty}</option>)}
        </Select></div>
        <div className="col-span-2"><Label required>Motif</Label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
        <div className="col-span-2"><Label>Diagnostic préliminaire</Label><Textarea value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></div>
      </div>
    </Modal>
  );
}