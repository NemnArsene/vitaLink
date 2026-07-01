import { useState } from "react";
import { Plus, Tag, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/Stat";
import { formatCurrency } from "@/lib/format";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";

type Tarif = { id: string; acteCode: string; acteName: string; category: string; montant: number; pourcentageAssurance: number; isActive: boolean; service: string };

const MOCK_TARIFS: Tarif[] = [
  { id: "tar-1", acteCode: "CONS-GEN", acteName: "Consultation générale", category: "Consultation", montant: 15000, pourcentageAssurance: 80, isActive: true, service: "Général" },
  { id: "tar-2", acteCode: "CONS-SPEC", acteName: "Consultation spécialiste", category: "Consultation", montant: 25000, pourcentageAssurance: 80, isActive: true, service: "Spécialiste" },
  { id: "tar-3", acteCode: "NFS", acteName: "Numération formule sanguine", category: "Laboratoire", montant: 5000, pourcentageAssurance: 70, isActive: true, service: "Laboratoire" },
  { id: "tar-4", acteCode: "GLYC", acteName: "Glycémie à jeun", category: "Laboratoire", montant: 3000, pourcentageAssurance: 70, isActive: true, service: "Laboratoire" },
  { id: "tar-5", acteCode: "RX-THORAX", acteName: "Radiographie thoracique", category: "Imagerie", montant: 20000, pourcentageAssurance: 75, isActive: true, service: "Radiologie" },
  { id: "tar-6", acteCode: "ECHO-ABD", acteName: "Échographie abdominale", category: "Imagerie", montant: 35000, pourcentageAssurance: 75, isActive: true, service: "Radiologie" },
  { id: "tar-7", acteCode: "HOSP-JOUR", acteName: "Hospitalisation (jour)", category: "Hospitalisation", montant: 50000, pourcentageAssurance: 85, isActive: true, service: "Hospitalisation" },
  { id: "tar-8", acteCode: "ECG", acteName: "Électrocardiogramme", category: "Examen", montant: 8000, pourcentageAssurance: 70, isActive: true, service: "Cardiologie" },
  { id: "tar-9", acteCode: "CONS-URG", acteName: "Consultation urgence", category: "Consultation", montant: 30000, pourcentageAssurance: 85, isActive: false, service: "Urgences" },
];

export default function Tarifs() {
  const { can } = usePermission();
  const [tarifs, setTarifs] = useState<Tarif[]>(MOCK_TARIFS);
  const [open, setOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");

  const addTarif = (t: Tarif) => {
    setTarifs([t, ...tarifs]);
    setOpen(false);
    toast.success("Tarif créé");
  };

  const filtered = filterCategory === "ALL" ? tarifs : tarifs.filter(t => t.category === filterCategory);
  const categories = [...new Set(tarifs.map(t => t.category))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarifs des actes"
        description="Grille tarifaire · Définir les prix des actes médicaux et taux de couverture"
        actions={can("settings.manage") && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nouveau tarif</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <StatCard
              key={cat}
              label={cat}
              value={tarifs.filter(t => t.category === cat && t.isActive).length}
              icon={<Tag className="h-5 w-5" />}
              color="primary"
            />
          ))}
      </div>

      <DataTable
        data={filtered}
        searchable
        searchPlaceholder="Rechercher un acte..."
        rowKey={(t) => t.id}
        toolbar={
          <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-9 w-auto">
            <option value="ALL">Toutes catégories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        }
        columns={[
          { key: "acteCode", label: "Code", render: (t: any) => <span className="font-mono text-xs">{t.acteCode}</span> },
          { key: "acteName", label: "Acte", sortable: true },
          { key: "category", label: "Catégorie", render: (t: any) => <Badge variant="info">{t.category}</Badge> },
          { key: "montant", label: "Prix", render: (t: any) => <span className="font-semibold">{formatCurrency(t.montant)}</span> },
          { key: "pourcentageAssurance", label: "Taux assurance", render: (t: any) => (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden w-16">
                <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${t.pourcentageAssurance}%` }} />
              </div>
              <span className="text-xs font-medium">{t.pourcentageAssurance}%</span>
            </div>
          )},
          { key: "statut", label: "Actif", render: (t: any) => t.isActive ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge> },
        ]}
      />

      <NewTarifModal open={open} onClose={() => setOpen(false)} onCreated={addTarif} />
    </div>
  );
}

function NewTarifModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (t: Tarif) => void }) {
  const [form, setForm] = useState({ acteCode: "", acteName: "", category: "Consultation", montant: 0, pourcentageAssurance: 80, service: "" });

  const submit = () => {
    if (!form.acteCode.trim() || !form.acteName.trim()) { toast.error("Code et nom requis"); return; }
    if (form.montant <= 0) { toast.error("Montant invalide"); return; }
    onCreated({ id: `tar-${Date.now()}`, ...form, isActive: true });
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau tarif"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={submit}>Créer</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <div><Label required>Code acte</Label><Input value={form.acteCode} onChange={e => setForm({ ...form, acteCode: e.target.value })} placeholder="ex: CONS-GEN" /></div>
        <div><Label required>Nom</Label><Input value={form.acteName} onChange={e => setForm({ ...form, acteName: e.target.value })} /></div>
        <div><Label required>Catégorie</Label><Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Consultation</option><option>Laboratoire</option><option>Imagerie</option><option>Hospitalisation</option><option>Examen</option></Select></div>
        <div><Label required>Montant (FCFA)</Label><Input type="number" value={form.montant || ""} onChange={e => setForm({ ...form, montant: parseInt(e.target.value) || 0 })} /></div>
        <div><Label>% Assurance</Label><Input type="number" value={form.pourcentageAssurance} onChange={e => setForm({ ...form, pourcentageAssurance: parseInt(e.target.value) || 0 })} placeholder="80" /></div>
        <div><Label>Service</Label><Input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} /></div>
      </div>
    </Modal>
  );
}
