import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, UserCog, Shield, Activity, Stethoscope, User as UserIcon, Receipt, Crown, Users as UsersIcon, ListChecks, FlaskConical, Wallet, Pill } from "lucide-react";
import { UsersService } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { formatDateTime } from "@/lib/format";
import { ROLE_PERMISSIONS } from "@/types";
import { toast } from "sonner";
import type { Role } from "@/types";

const ROLE_META: Record<Role, { label: string; icon: any; color: string }> = {
  ROLE_ADMIN_HOSPITAL: { label: "Administrateur", icon: Crown, color: "text-violet-600 bg-violet-50" },
  ROLE_DOCTOR: { label: "Médecin", icon: Stethoscope, color: "text-emerald-600 bg-emerald-50" },
  ROLE_NURSE: { label: "Infirmier(ère)", icon: Activity, color: "text-sky-600 bg-sky-50" },
  ROLE_BILLING: { label: "Facturation", icon: Receipt, color: "text-amber-600 bg-amber-50" },
  ROLE_DIRECTOR: { label: "Directeur", icon: UserCog, color: "text-rose-600 bg-rose-50" },
  ROLE_RECEPTIONIST: { label: "Accueil", icon: UsersIcon, color: "text-blue-600 bg-blue-50" },
  ROLE_TRIAGE: { label: "Triage", icon: ListChecks, color: "text-red-600 bg-red-50" },
  ROLE_LABORATORY: { label: "Laboratoire", icon: FlaskConical, color: "text-yellow-600 bg-yellow-50" },
  ROLE_CASHIER: { label: "Caisse", icon: Wallet, color: "text-green-600 bg-green-50" },
  ROLE_PHARMACIST: { label: "Pharmacien", icon: Pill, color: "text-indigo-600 bg-indigo-50" },
};

export default function Users() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterRole, setFilterRole] = useState("ALL");

  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: UsersService.list });

  const createMut = useMutation({
    mutationFn: UsersService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setCreateOpen(false); toast.success("Utilisateur créé"); },
  });

  const filtered = filterRole === "ALL" ? users : users.filter((u: any) => u.role === filterRole);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs & RBAC"
        description={`${users.length} comptes · Permissions granulaires par rôle`}
        actions={can("user.manage") && <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Nouvel utilisateur</Button>}
      />

      {/* RBAC visualization */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(ROLE_META) as Role[]).map(role => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          const count = users.filter((u: any) => u.role === role).length;
          return (
            <div key={role} className="card p-4">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2 ${meta.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{meta.label}</div>
              <div className="text-2xl font-bold mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      <DataTable
        data={filtered}
        searchable
        searchPlaceholder="Rechercher par nom, email, service..."
        emptyIcon={<UserIcon className="h-6 w-6" />}
        emptyTitle="Aucun utilisateur"
        toolbar={
          <Select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="h-9 w-auto">
            <option value="ALL">Tous rôles</option>
            {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        }
        rowKey={(u: any) => u.id}
        columns={[
          { key: "name", label: "Utilisateur", render: (u: any) => (
            <div className="flex items-center gap-3">
              <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
              <div>
                <div className="font-medium">{u.firstName} {u.lastName}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</div>
              </div>
            </div>
          )},
          { key: "role", label: "Rôle", render: (u: any) => {
            const meta = ROLE_META[u.role as Role];
            const Icon = meta?.icon || Shield;
            return <Badge variant="primary"><Icon className="h-3 w-3 mr-1" /> {meta?.label || u.role}</Badge>;
          }},
          { key: "service", label: "Service" },
          { key: "perms", label: "Permissions", render: (u: any) => (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {ROLE_PERMISSIONS[u.role as Role]?.length || 0} autorisations
            </span>
          )},
          { key: "active", label: "État", render: (u: any) => u.active ? <StatusBadge status="ACTIVE" /> : <Badge variant="neutral">Inactif</Badge> },
          { key: "lastLogin", label: "Dernière connexion", render: (u: any) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{u.lastLogin ? formatDateTime(u.lastLogin) : "—"}</span> },
        ]}
      />

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={(u) => createMut.mutate(u)} loading={createMut.isPending} />
    </div>
  );
}

function CreateUserModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (u: any) => void; loading?: boolean }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", role: "ROLE_DOCTOR" as Role, service: "Cardiologie", phone: "", active: true });
  return (
    <Modal open={open} onClose={onClose} title="Nouvel utilisateur"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => onSubmit(form)} loading={loading}>Créer</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Prénom</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><Label required>Nom</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
        <div className="col-span-2"><Label required>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Rôle</Label><Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
          {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select></div>
        <div><Label>Service</Label><Input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} /></div>
        <div className="col-span-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
    </Modal>
  );
}