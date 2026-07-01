import { useState, useEffect, useCallback } from "react";
import { Plus, Users, CalendarDays, Building2, Briefcase, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/Stat";
import { Avatar } from "@/components/ui/Avatar";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { PersonnelAPI } from "@/api/http-client";

type Staff = { id: string; firstName: string; lastName: string; email: string; role: string; service: string; specialty?: string; phone: string; statut: string; employeeId: string; reportsTo?: string; dailyPatientLimit?: number };

const STAFF_ROLES: Record<string, { label: string; color: string }> = {
  ROLE_DOCTOR: { label: "Médecin", color: "bg-emerald-100 text-emerald-700" },
  ROLE_NURSE: { label: "Infirmier(ère)", color: "bg-sky-100 text-sky-700" },
  ROLE_BILLING: { label: "Facturation", color: "bg-amber-100 text-amber-700" },
  ROLE_RECEPTIONIST: { label: "Accueil", color: "bg-blue-100 text-blue-700" },
  ROLE_TRIAGE: { label: "Triage", color: "bg-red-100 text-red-700" },
  ROLE_LABORATORY: { label: "Laboratoire", color: "bg-yellow-100 text-yellow-700" },
  ROLE_CASHIER: { label: "Caisse", color: "bg-green-100 text-green-700" },
  ROLE_DIRECTOR: { label: "Direction", color: "bg-rose-100 text-rose-700" },
};

const SHIFTS = ["Matin", "Après-midi", "Garde 24h", "Repos", "Congé"];

function toApiStaff(raw: any): Staff {
  return {
    id: raw._id || raw.id,
    firstName: raw.prenom || raw.firstName || "",
    lastName: raw.nom || raw.lastName || "",
    email: raw.email || "",
    role: raw.role || "",
    service: raw.service || "",
    specialty: raw.specialty || raw.specialite || "",
    phone: raw.phone || "",
    statut: raw.statut || "actif",
    employeeId: raw.employeeId || raw.matricule || "",
    reportsTo: raw.reportsTo || undefined,
    dailyPatientLimit: raw.dailyPatientLimit ?? 25,
  };
}

export default function Personnel() {
  const { can } = usePermission();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [planning, setPlanning] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PersonnelAPI.list();
      const raw = data?.data || data?.results || data || [];
      const items = (Array.isArray(raw) ? raw : []).map(toApiStaff);
      setStaff(items);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const superiorName = (reportsTo?: string): string => {
    if (!reportsTo) return "—";
    const sup = staff.find(s => s.id === reportsTo);
    return sup ? `${sup.firstName} ${sup.lastName}` : "—";
  };

  const addStaff = async (s: Staff) => {
    try {
      const dto: any = {
        prenom: s.firstName,
        nom: s.lastName,
        email: s.email,
        role: s.role,
        service: s.service,
        specialty: s.specialty,
        phone: s.phone,
        reportsTo: s.reportsTo || undefined,
        dailyPatientLimit: s.dailyPatientLimit,
      };
      if (s.employeeId) dto.employeeId = s.employeeId;
      const created = await PersonnelAPI.create(dto);
      setStaff(prev => [toApiStaff(created), ...prev]);
      setOpen(false);
      toast.success("Employé créé");
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const byService = staff.reduce((acc: Record<string, number>, p) => {
    acc[p.service] = (acc[p.service] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion du personnel"
        description={loading ? "Chargement…" : `${staff.length} employés · Services, rôles et plannings`}
        actions={can("user.manage") && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nouvel employé</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Effectif total" value={staff.length} icon={<Users className="h-5 w-5" />} color="primary" />
        <StatCard label="Actifs" value={staff.filter(s => s.statut === "actif").length} icon={<CheckCircle className="h-5 w-5" />} color="success" />
        <StatCard label="Médecins" value={staff.filter(s => s.role === "ROLE_DOCTOR").length} icon={<Briefcase className="h-5 w-5" />} color="info" />
        <StatCard label="Services" value={Object.keys(byService).length} icon={<Building2 className="h-5 w-5" />} color="warning" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(byService).map(([service, count]) => (
          <Card key={service} className="p-4">
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{service}</div>
            <div className="text-2xl font-bold mt-1">{count as number}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>employés</div>
          </Card>
        ))}
      </div>

      <DataTable
        data={staff}
        searchable
        searchPlaceholder="Rechercher par nom, email, service..."
        rowKey={(s) => s.id}
        toolbar={<Button size="sm" variant="outline" onClick={() => setPlanning(true)}><CalendarDays className="h-3.5 w-3.5" /> Plannings</Button>}
        columns={[
          { key: "name", label: "Employé", render: (s: Staff) => (
            <div className="flex items-center gap-3">
              <Avatar name={`${s.firstName} ${s.lastName}`} size="sm" />
              <div>
                <div className="font-medium">{s.firstName} {s.lastName}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.email}</div>
              </div>
            </div>
          )},
          { key: "employeeId", label: "Matricule", render: (s: Staff) => <span className="font-mono text-xs">{s.employeeId}</span> },
          { key: "role", label: "Rôle", render: (s: Staff) => {
            const meta = STAFF_ROLES[s.role] || { label: s.role, color: "" };
            return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>;
          }},
          { key: "service", label: "Service" },
          { key: "superior", label: "Supérieur", render: (s: Staff) => (
            <span className="text-xs">{superiorName(s.reportsTo)}</span>
          )},
          { key: "phone", label: "Téléphone" },
          { key: "limit", label: "Limite/j", render: (s: Staff) => (
            <span className="text-xs font-mono">{s.dailyPatientLimit ?? 25}</span>
          )},
          { key: "statut", label: "Statut", render: (s: Staff) => s.statut === "actif" ? <StatusBadge status="ACTIVE" /> : <Badge variant="neutral">Inactif</Badge> },
        ]}
      />

      <NewStaffModal open={open} onClose={() => setOpen(false)} onCreated={addStaff} staff={staff} />

      <PlanningModal open={planning} onClose={() => setPlanning(false)} doctors={staff.filter(s => s.role === "ROLE_DOCTOR")} />
    </div>
  );
}

function NewStaffModal({ open, onClose, onCreated, staff }: { open: boolean; onClose: () => void; onCreated: (s: Staff) => void; staff: Staff[] }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "ROLE_DOCTOR", service: "Cardiologie", specialty: "", phone: "", hireDate: "", reportsTo: "", dailyPatientLimit: "25" });

  const submit = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) { toast.error("Prénom, nom et email requis"); return; }
    onCreated({
      id: `stf-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
      service: form.service,
      specialty: form.specialty || undefined,
      phone: form.phone,
      statut: "actif",
      employeeId: `EMP-${String(Date.now()).slice(-4)}`,
      reportsTo: form.reportsTo || undefined,
      dailyPatientLimit: form.dailyPatientLimit ? Number(form.dailyPatientLimit) : 25,
    });
  };

  const superiors = staff.filter(s => ["ROLE_DIRECTOR", "ROLE_DOCTOR"].includes(s.role));

  return (
    <Modal open={open} onClose={onClose} title="Nouvel employé" size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={submit}>Créer</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Prénom</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><Label required>Nom</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
        <div className="col-span-2"><Label required>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label required>Rôle</Label><Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          {Object.entries(STAFF_ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select></div>
        <div><Label required>Service</Label><Select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
          <option>Cardiologie</option><option>Pédiatrie</option><option>Urgences</option>
          <option>Maternité</option><option>Laboratoire</option><option>Accueil</option>
          <option>Facturation</option><option>Caisse</option>
        </Select></div>
        <div><Label>Spécialité</Label><Input value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} /></div>
        <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div><Label>Date d'embauche</Label><Input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></div>
        <div><Label>Limite patients/jour</Label><Input type="number" min={1} max={200} value={form.dailyPatientLimit} onChange={e => setForm({ ...form, dailyPatientLimit: e.target.value })} /></div>
        <div className="col-span-2">
          <Label>Supérieur hiérarchique</Label>
          <Select value={form.reportsTo} onChange={e => setForm({ ...form, reportsTo: e.target.value })}>
            <option value="">Aucun</option>
            {superiors.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.service}</option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
}

function PlanningModal({ open, onClose, doctors }: { open: boolean; onClose: () => void; doctors: Staff[] }) {
  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const [schedule, setSchedule] = useState<Record<string, string[]>>({});

  const getShifts = (docId: string) => schedule[docId] || DAYS.map(() => "Matin");

  const setShift = (docId: string, dayIdx: number, val: string) => {
    const shifts = getShifts(docId);
    shifts[dayIdx] = val;
    setSchedule({ ...schedule, [docId]: [...shifts] });
  };

  const save = () => {
    toast.success("Planning mis à jour");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Planning des gardes" description="Médecins — Semaine courante" size="lg"
      footer={<Button onClick={save}>Enregistrer</Button>}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="py-2 px-3 text-left">Médecin</th>
            {DAYS.map(d => <th key={d} className="py-2 px-3 text-center">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {doctors.map(d => (
            <tr key={d.id} className="border-b border-[var(--border)]">
              <td className="py-2 px-3 font-medium">{d.firstName} {d.lastName}</td>
              {getShifts(d.id).map((s, i) => (
                <td key={i} className="py-2 px-3 text-center">
                  <Select value={s} onChange={e => setShift(d.id, i, e.target.value)} className="text-xs h-7">
                    {SHIFTS.map(sh => <option key={sh} value={sh}>{sh}</option>)}
                  </Select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}