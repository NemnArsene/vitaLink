import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Stethoscope } from "lucide-react";
import { ConsultationsAPI, PatientsAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { formatDateTime } from "@/lib/format";
import { DOCTORS } from "@/mocks/seed";
import { toast } from "sonner";
import type { Consultation } from "@/types";

export default function Consultations() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [open, setOpen] = useState(false);

  const { data: consultations = [] } = useQuery({ queryKey: ["consultations"], queryFn: ConsultationsAPI.list });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => PatientsAPI.list() });

  const createMut = useMutation({
    mutationFn: ConsultationsAPI.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["consultations"] }); setOpen(false); toast.success("Consultation créée"); },
  });

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
      <CreateConsultationModal open={open} onClose={() => setOpen(false)} patients={patients} loading={createMut.isPending} onSubmit={(c: any) => createMut.mutate(c)} />
    </div>
  );
}

function CreateConsultationModal({ open, onClose, patients, onSubmit, loading }: any) {
  const doctor = DOCTORS[0];
  const [form, setForm] = useState<Omit<Consultation, "id" | "createdAt" | "updatedAt">>({
    patientId: patients[0]?.id ?? "",
    doctorId: doctor.id,
    doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    type: "GENERAL",
    status: "SCHEDULED",
    scheduledAt: new Date().toISOString(),
    reason: "",
    diagnosis: "",
  });

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