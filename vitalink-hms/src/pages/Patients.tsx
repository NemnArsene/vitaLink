import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Users as UsersIcon } from "lucide-react";
import { PatientsAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { calcAge, formatDate } from "@/lib/format";
import { INSURANCE_COMPANIES } from "@/mocks/seed";
import { toast } from "sonner";
import type { Patient } from "@/types";

export default function Patients() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { can } = usePermission();
  const [status, setStatus] = useState("ALL");
  const [insurance, setInsurance] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", status, insurance],
    queryFn: () => PatientsAPI.list({ status, insurance }),
  });

  const createMut = useMutation({
    mutationFn: PatientsAPI.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setCreateOpen(false);
      toast.success("Patient créé avec succès");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`${patients.length} patients enregistrés · Dossiers médicaux centralisés`}
        actions={
          can("patient.write") && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Nouveau patient
            </Button>
          )
        }
      />

      <DataTable
        data={patients}
        searchable
        searchPlaceholder="Rechercher par nom, n° dossier, téléphone..."
        emptyTitle="Aucun patient trouvé"
        emptyDescription="Commencez par créer un dossier patient."
        emptyIcon={<UsersIcon className="h-6 w-6" style={{ color: "var(--text-muted)" }} />}
        toolbar={
          <>
            <Select value={status} onChange={e => setStatus(e.target.value)} className="h-9 w-auto">
              <option value="ALL">Tous statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </Select>
            <Select value={insurance} onChange={e => setInsurance(e.target.value)} className="h-9 w-auto">
              <option value="ALL">Tous assureurs</option>
              {INSURANCE_COMPANIES.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
            </Select>
            <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5" /> Plus de filtres</Button>
          </>
        }
        onRowClick={(p) => nav(`/patients/${p.id}`)}
        rowKey={(p) => p.id}
        columns={[
          { key: "fileNumber", label: "N° Dossier", width: "120px", render: p => <span className="font-mono text-xs">{p.fileNumber}</span> },
          { key: "name", label: "Patient", sortable: true, render: p => (
            <div className="flex items-center gap-3">
              <Avatar name={`${p.firstName} ${p.lastName}`} size="sm" />
              <div>
                <div className="font-medium">{p.firstName} {p.lastName}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{p.gender === "M" ? "H" : "F"} · {calcAge(p.birthDate)} ans · {p.bloodGroup}</div>
              </div>
            </div>
          )},
          { key: "phone", label: "Téléphone" },
          { key: "insuranceCompany", label: "Assurance", render: p => p.insuranceCompany ? <Badge variant="info">{p.insuranceCompany}</Badge> : <span style={{ color: "var(--text-subtle)" }}>—</span> },
          { key: "city", label: "Ville" },
          { key: "updatedAt", label: "Mis à jour", sortable: true, render: p => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(p.updatedAt)}</span> },
          { key: "status", label: "Statut", render: p => <StatusBadge status={p.status} /> },
        ]}
      />

      <CreatePatientModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={(p) => createMut.mutate(p)} loading={createMut.isPending} />
    </div>
  );
}

function CreatePatientModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (p: Omit<Patient, "id" | "createdAt" | "updatedAt">) => void; loading?: boolean }) {
  const [form, setForm] = useState<Omit<Patient, "id" | "createdAt" | "updatedAt">>({
    fileNumber: `P-${Date.now().toString().slice(-8)}`,
    firstName: "", lastName: "", gender: "M", birthDate: "1990-01-01T00:00:00Z",
    bloodGroup: "O+", phone: "", email: "", address: "", city: "Dakar",
    emergencyContact: "", emergencyPhone: "", status: "ACTIVE",
  });

  const submit = () => {
    if (!form.firstName || !form.lastName) {
      toast.error("Nom et prénom requis");
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau patient"
      description="Créer un dossier patient"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} loading={loading}>Créer le dossier</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Prénom</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><Label required>Nom</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
        <div><Label>Genre</Label><Select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as any })}><option value="M">Masculin</option><option value="F">Féminin</option></Select></div>
        <div><Label>Date de naissance</Label><Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} /></div>
        <div><Label>Groupe sanguin</Label><Select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value as any })}>
          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
        </Select></div>
        <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div><Label>Ville</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        <div><Label>Contact d'urgence</Label><Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} /></div>
        <div><Label>Téléphone d'urgence</Label><Input value={form.emergencyPhone} onChange={e => setForm({ ...form, emergencyPhone: e.target.value })} /></div>
      </div>
    </Modal>
  );
}