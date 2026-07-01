import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Building2, Activity, Tag } from "lucide-react";
import { SettingsAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { HOSPITAL } from "@/mocks/seed";

export default function Settings() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [tab, setTab] = useState<"hospital" | "services" | "acts">("hospital");
  const [openService, setOpenService] = useState(false);
  const [openAct, setOpenAct] = useState(false);

  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: SettingsAPI.services });
  const { data: acts = [] } = useQuery({ queryKey: ["acts-catalog"], queryFn: SettingsAPI.acts });

  const createServiceMut = useMutation({
    mutationFn: SettingsAPI.createService,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); setOpenService(false); toast.success("Service créé"); },
  });
  const createActMut = useMutation({
    mutationFn: SettingsAPI.createAct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["acts-catalog"] }); setOpenAct(false); toast.success("Acte ajouté au catalogue"); },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Configuration de l'hôpital, services et facturation" />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface-2)] w-fit">
        {([
          { id: "hospital", label: "Hôpital", icon: Building2 },
          { id: "services", label: "Services médicaux", icon: Activity },
          { id: "acts", label: "Catalogue d'actes", icon: Tag },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? "bg-[var(--surface)] shadow-sm" : ""}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "hospital" && (
        <Card>
          <CardHeader><CardTitle>Informations de l'hôpital</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom">{HOSPITAL.name}</Field>
            <Field label="Code">{HOSPITAL.code}</Field>
            <Field label="Adresse">{HOSPITAL.address}</Field>
            <Field label="Ville">{HOSPITAL.city}, {HOSPITAL.country}</Field>
            <Field label="Téléphone">{HOSPITAL.phone}</Field>
            <Field label="Email">{HOSPITAL.email}</Field>
            <Field label="Capacité totale"><Badge variant="primary">{HOSPITAL.totalBeds} lits</Badge></Field>
            <Field label="Lits disponibles"><Badge variant="success">{HOSPITAL.availableBeds} libres</Badge></Field>
          </CardContent>
        </Card>
      )}

      {tab === "services" && (
        <>
          <div className="flex justify-end">
            {can("settings.manage") && <Button onClick={() => setOpenService(true)}><Plus className="h-4 w-4" /> Nouveau service</Button>}
          </div>
          <DataTable
            data={services}
            searchable
            searchPlaceholder="Rechercher un service..."
            rowKey={(s: any) => s.id}
            columns={[
              { key: "code", label: "Code", render: (s: any) => <span className="font-mono text-xs">{s.code}</span> },
              { key: "name", label: "Service", sortable: true, render: (s: any) => (
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.description}</div>
                </div>
              )},
              { key: "head", label: "Chef de service" },
              { key: "capacity", label: "Capacité", render: (s: any) => <Badge variant="info">{s.capacity} lits</Badge> },
              { key: "active", label: "État", render: (s: any) => s.active ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge> },
            ]}
          />
        </>
      )}

      {tab === "acts" && (
        <>
          <div className="flex justify-end">
            {can("settings.manage") && <Button onClick={() => setOpenAct(true)}><Plus className="h-4 w-4" /> Nouvel acte</Button>}
          </div>
          <DataTable
            data={acts}
            searchable
            searchPlaceholder="Rechercher un acte..."
            rowKey={(a: any) => a.id}
            columns={[
              { key: "code", label: "Code", render: (a: any) => <span className="font-mono text-xs">{a.code}</span> },
              { key: "label", label: "Libellé", sortable: true },
              { key: "type", label: "Type", render: (a: any) => <Badge variant="info">{a.type}</Badge> },
              { key: "basePrice", label: "Prix de base", render: (a: any) => <span className="font-semibold">{formatCurrency(a.basePrice)}</span> },
              { key: "active", label: "État", render: (a: any) => a.active ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge> },
            ]}
          />
        </>
      )}

      <ServiceModal open={openService} onClose={() => setOpenService(false)} onSubmit={(s) => createServiceMut.mutate(s)} loading={createServiceMut.isPending} />
      <ActModal open={openAct} onClose={() => setOpenAct(false)} onSubmit={(a) => createActMut.mutate(a)} loading={createActMut.isPending} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-3">
      <div className="text-[10px] uppercase tracking-wider mb-1.5 font-semibold" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ServiceModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (s: any) => void; loading?: boolean }) {
  const [s, setS] = useState({ code: "", name: "", description: "", head: "", capacity: 20, active: true });
  return (
    <Modal open={open} onClose={onClose} title="Nouveau service"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => onSubmit(s)} loading={loading}>Créer</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Code</Label><Input value={s.code} onChange={e => setS({ ...s, code: e.target.value })} /></div>
        <div><Label required>Nom</Label><Input value={s.name} onChange={e => setS({ ...s, name: e.target.value })} /></div>
        <div className="col-span-2"><Label>Description</Label><Input value={s.description} onChange={e => setS({ ...s, description: e.target.value })} /></div>
        <div><Label>Chef de service</Label><Input value={s.head} onChange={e => setS({ ...s, head: e.target.value })} /></div>
        <div><Label>Capacité</Label><Input type="number" value={s.capacity} onChange={e => setS({ ...s, capacity: Number(e.target.value) })} /></div>
      </div>
    </Modal>
  );
}

function ActModal({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (a: any) => void; loading?: boolean }) {
  const [a, setA] = useState({ code: "", type: "CARE" as const, label: "", basePrice: 0, active: true });
  return (
    <Modal open={open} onClose={onClose} title="Nouvel acte"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={() => onSubmit(a)} loading={loading}>Ajouter</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Code</Label><Input value={a.code} onChange={e => setA({ ...a, code: e.target.value })} /></div>
        <div><Label required>Type</Label><Select value={a.type} onChange={e => setA({ ...a, type: e.target.value as any })}><option>CARE</option><option>EXAM</option><option>IMAGING</option><option>LAB</option></Select></div>
        <div className="col-span-2"><Label required>Libellé</Label><Input value={a.label} onChange={e => setA({ ...a, label: e.target.value })} /></div>
        <div><Label>Prix de base</Label><Input type="number" value={a.basePrice} onChange={e => setA({ ...a, basePrice: Number(e.target.value) })} /></div>
      </div>
    </Modal>
  );
}