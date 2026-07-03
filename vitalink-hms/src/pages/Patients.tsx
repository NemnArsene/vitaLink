import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Upload, Users as UsersIcon, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { PatientsService } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { calcAge, formatDate } from "@/lib/format";
import { INSURANCE_COMPANIES } from "@/mocks/seed";
import { ImportCSVModal } from "@/components/ui/ImportCSVModal";
import { toast } from "sonner";
import type { Patient } from "@/types";

export default function Patients() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { can } = usePermission();
  const [status, setStatus] = useState("ALL");
  const [insurance, setInsurance] = useState("ALL");
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: patientsRaw = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => PatientsService.list(),
  });
  const patients = patientsRaw.filter(p => {
    if (status !== "ALL" && p.status !== status) return false;
    if (insurance !== "ALL" && p.insuranceCompany !== insurance) return false;
    if (genderFilter !== "ALL" && p.gender !== genderFilter) return false;
    if (cityFilter && !p.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    return true;
  });

  const createMut = useMutation({
    mutationFn: PatientsService.create,
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Importer CSV
            </Button>
            {can("patient.write") && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Nouveau patient
              </Button>
            )}
          </div>
        }
      />

      {showExtraFilters && (
        <Card>
          <CardContent className="py-4">
            <div className="flex gap-3 items-end">
              <div>
                <Label>Genre</Label>
                <Select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="h-9 w-36">
                  <option value="ALL">Tous genres</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </Select>
              </div>
              <div>
                <Label>Ville</Label>
                <Input placeholder="Filtrer par ville…" value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="h-9 w-44" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Button variant="outline" size="sm" onClick={() => setShowExtraFilters(!showExtraFilters)} className={showExtraFilters ? "border-[var(--primary)]" : ""}><Filter className="h-3.5 w-3.5" /> Plus de filtres</Button>
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
          { key: "insuranceStatus", label: "Couverture", render: p => {
            const status = p.insuranceStatus;
            if (status === "ASSURE") return (
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--success)" }}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Assuré
                </span>
                {p.insuranceCoveragePercentage != null && p.insuranceCoveragePercentage > 0 && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.insuranceCompany} · {p.insuranceCoveragePercentage}%</span>
                )}
              </div>
            );
            if (status === "EN_ATTENTE") return (
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--warning)" }}>
                <ShieldAlert className="h-3.5 w-3.5" /> En attente
              </span>
            );
            if (status === "NON_ASSURE") return (
              <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <ShieldX className="h-3.5 w-3.5" /> Non assuré
              </span>
            );
            // Ancien patient (pas encore de insuranceStatus)
            return p.insuranceCompany
              ? <Badge variant="info">{p.insuranceCompany}</Badge>
              : <span style={{ color: "var(--text-subtle)" }}>—</span>;
          }},
          { key: "city", label: "Ville" },
          { key: "updatedAt", label: "Mis à jour", sortable: true, render: p => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(p.updatedAt)}</span> },
          { key: "status", label: "Statut", render: p => <StatusBadge status={p.status} /> },
        ]}
      />

      <CreatePatientModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={(p) => createMut.mutate(p)} loading={createMut.isPending} />
      <ImportCSVModal open={importOpen} onClose={() => setImportOpen(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ["patients"] })} />
    </div>
  );
}

function CreatePatientModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (p: any) => void; loading?: boolean }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    birthDate: "1990-01-01",
    bloodGroup: "O+",
    phone: "",
    email: "",
    address: "",
    city: "Yaoundé",
    emergencyContact: "",
    emergencyPhone: "",
    status: "ACTIVE",
    insuranceNumber: "",
    insuranceCompany: "",
    allergies: [] as string[],
    antecedents: [] as string[],
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [antecedentInput, setAntecedentInput] = useState("");

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm({ ...form, allergies: [...form.allergies, allergyInput.trim()] });
      setAllergyInput("");
    }
  };

  const addAntecedent = () => {
    if (antecedentInput.trim()) {
      setForm({ ...form, antecedents: [...form.antecedents, antecedentInput.trim()] });
      setAntecedentInput("");
    }
  };

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
      description="Enregistrement du patient — le dossier médical sera créé automatiquement"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} loading={loading}>Créer le dossier</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Identité */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Identité</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label required>Prénom</Label><Input value={form.firstName} onChange={f("firstName")} placeholder="Jean" /></div>
            <div><Label required>Nom</Label><Input value={form.lastName} onChange={f("lastName")} placeholder="Dupont" /></div>
            <div>
              <Label>Genre</Label>
              <Select value={form.gender} onChange={f("gender")}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="OTHER">Autre</option>
              </Select>
            </div>
            <div><Label>Date de naissance</Label><Input type="date" value={form.birthDate} onChange={f("birthDate")} /></div>
            <div>
              <Label>Groupe sanguin</Label>
              <Select value={form.bloodGroup} onChange={f("bloodGroup")}>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
              </Select>
            </div>
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={f("phone")} placeholder="+237 6XX XXX XXX" /></div>
            <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={f("email")} placeholder="patient@email.com" /></div>
          </div>
        </div>

        {/* Adresse & contact d'urgence */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Adresse & Contact d'urgence</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Adresse</Label><Input value={form.address} onChange={f("address")} placeholder="Rue de la Paix" /></div>
            <div><Label>Ville</Label><Input value={form.city} onChange={f("city")} placeholder="Yaoundé" /></div>
            <div><Label>Contact d'urgence</Label><Input value={form.emergencyContact} onChange={f("emergencyContact")} placeholder="Nom du contact" /></div>
            <div><Label>Tél. d'urgence</Label><Input value={form.emergencyPhone} onChange={f("emergencyPhone")} placeholder="+237 6XX XXX XXX" /></div>
          </div>
        </div>

        {/* Assurance */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Assurance (optionnel)</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>N° Carte d'assurance</Label><Input value={form.insuranceNumber} onChange={f("insuranceNumber")} placeholder="ASS-XXXX-XXXX" /></div>
            <div><Label>Compagnie</Label><Input value={form.insuranceCompany} onChange={f("insuranceCompany")} placeholder="CNAMGS, ASCOMA..." /></div>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Si un numéro de carte est fourni, la couverture sera vérifiée automatiquement auprès de l'assureur.
          </p>
        </div>

        {/* Allergies */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Allergies connues</p>
          <div className="flex gap-2">
            <Input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} placeholder="Ex: Pénicilline" onKeyDown={e => e.key === "Enter" && addAllergy()} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={addAllergy}>+ Ajouter</Button>
          </div>
          {form.allergies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.allergies.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--error-bg)", color: "var(--error)" }}>
                  {a}
                  <button onClick={() => setForm({ ...form, allergies: form.allergies.filter((_, j) => j !== i) })} className="hover:opacity-70">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Antécédents */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Antécédents médicaux</p>
          <div className="flex gap-2">
            <Input value={antecedentInput} onChange={e => setAntecedentInput(e.target.value)} placeholder="Ex: Hypertension" onKeyDown={e => e.key === "Enter" && addAntecedent()} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={addAntecedent}>+ Ajouter</Button>
          </div>
          {form.antecedents.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.antecedents.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
                  {a}
                  <button onClick={() => setForm({ ...form, antecedents: form.antecedents.filter((_, j) => j !== i) })} className="hover:opacity-70">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}