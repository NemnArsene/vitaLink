import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, FileText, Pause, X, CheckCircle2, Eye, AlertTriangle } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { DataTable } from "../components/ui/Table";
import { useContracts, useInsureds, useUpdateContract, useCreateContract, useDeleteContract } from "../hooks/useApi";
import { formatCurrency, formatNumber } from "../utils/cn";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Contract } from "../types";

const contractSchema = z.object({
  insuredId: z.string().min(1, "Assuré requis"),
  type: z.enum(["individual", "family", "group", "enterprise"]),
  productName: z.string().min(2, "Produit requis"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  monthlyPremium: z.number().min(1, "Prime requise"),
  coverageAmount: z.number().min(1, "Couverture requise"),
  paymentFrequency: z.enum(["monthly", "quarterly", "annual"]),
  status: z.enum(["active", "pending", "suspended", "terminated", "expired"]),
  deductible: z.number().min(0),
  commission: z.number().min(0).max(100),
  notes: z.string().optional(),
});

type ContractForm = z.infer<typeof contractSchema>;

const statusVariant: Record<Contract["status"], "success" | "warning" | "danger" | "neutral" | "info"> = {
  active: "success",
  pending: "info",
  suspended: "warning",
  terminated: "danger",
  expired: "neutral",
};

const typeLabel: Record<Contract["type"], string> = {
  individual: "Individuel",
  family: "Famille",
  group: "Groupe",
  enterprise: "Entreprise",
};

export function Contracts() {
  const { data: contracts = [], isLoading } = useContracts();
  const { data: insureds = [] } = useInsureds();
  const updateContract = useUpdateContract();
  const createContract = useCreateContract();
  const deleteContract = useDeleteContract();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewContract, setViewContract] = useState<Contract | null>(null);

  const filtered = contracts.filter((c) => {
    const insured = insureds.find((i) => i.id === c.insuredId);
    const matchSearch = !search || `${c.reference} ${insured?.firstName} ${insured?.lastName} ${c.productName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    active: contracts.filter((c) => c.status === "active").length,
    suspended: contracts.filter((c) => c.status === "suspended").length,
    pending: contracts.filter((c) => c.status === "pending").length,
    totalRevenue: contracts.filter((c) => c.status === "active").reduce((s, c) => s + c.monthlyPremium, 0),
  };

  const form = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      type: "individual", productName: "Santé Essentielle",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      monthlyPremium: 50, coverageAmount: 100000, paymentFrequency: "monthly",
      status: "pending", deductible: 0, commission: 10,
    },
  });

  const onSubmit = (data: ContractForm) => {
    createContract.mutate({
      ...data,
      annualPremium: data.monthlyPremium * 12,
      remainingCoverage: data.coverageAmount,
      guarantees: ["GRT-001", "GRT-002", "GRT-003"],
      agentId: "USR-0001",
    } as Partial<Contract>);
    setModalOpen(false);
    form.reset();
  };

  const suspendContract = (c: Contract) => {
    updateContract.mutate({ id: c.id, data: { status: "suspended" } });
  };

  const terminateContract = (c: Contract) => {
    if (confirm(`Résilier définitivement le contrat ${c.reference} ?`)) {
      updateContract.mutate({ id: c.id, data: { status: "terminated" } });
    }
  };

  const reactivate = (c: Contract) => {
    updateContract.mutate({ id: c.id, data: { status: "active" } });
  };

  const columns = [
    {
      key: "ref",
      header: "Référence",
      cell: (c: Contract) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/30">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{c.reference}</p>
            <p className="text-[10px] text-slate-500">{c.productName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "insured",
      header: "Assuré",
      cell: (c: Contract) => {
        const insured = insureds.find((i) => i.id === c.insuredId);
        return (
          <div>
            <p className="text-xs font-medium text-slate-900 dark:text-white">{insured ? `${insured.firstName} ${insured.lastName}` : "—"}</p>
            <p className="text-[10px] text-slate-500">{insured?.matricule}</p>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      cell: (c: Contract) => <Badge variant="info" size="sm">{typeLabel[c.type]}</Badge>,
    },
    {
      key: "premium",
      header: "Prime /mois",
      cell: (c: Contract) => <span className="text-xs font-semibold text-slate-900 dark:text-white">{formatCurrency(c.monthlyPremium)}</span>,
      align: "right" as const,
    },
    {
      key: "coverage",
      header: "Couverture",
      cell: (c: Contract) => (
        <div>
          <p className="text-xs text-slate-900 dark:text-white">{formatCurrency(c.coverageAmount)}</p>
          <p className="text-[10px] text-slate-500">Restant: {formatCurrency(c.remainingCoverage)}</p>
        </div>
      ),
      align: "right" as const,
    },
    {
      key: "dates",
      header: "Période",
      cell: (c: Contract) => (
        <div className="text-[10px] text-slate-500">
          <p>Début: {format(new Date(c.startDate), "dd/MM/yyyy")}</p>
          <p>Fin: {format(new Date(c.endDate), "dd/MM/yyyy")}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (c: Contract) => <Badge variant={statusVariant[c.status]} dot>{c.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (c: Contract) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setViewContract(c)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" aria-label="Voir">
            <Eye className="h-3.5 w-3.5" />
          </button>
          {c.status === "active" && (
            <button onClick={() => suspendContract(c)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800" aria-label="Suspendre">
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
          {c.status === "suspended" && (
            <button onClick={() => reactivate(c)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800" aria-label="Réactiver">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
          {c.status !== "terminated" && (
            <button onClick={() => terminateContract(c)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" aria-label="Résilier">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => deleteContract.mutate(c.id)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" aria-label="Supprimer">
            <AlertTriangle className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      align: "right" as const,
      width: "180px",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contrats"
        description="Gestion des contrats d'assurance santé"
        icon={<FileText className="h-5 w-5" />}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => { form.reset(); setModalOpen(true); }}>
            Nouveau contrat
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={CheckCircle2} label="Contrats actifs" value={formatNumber(stats.active)} color="emerald" />
        <StatTile icon={Pause} label="Contrats suspendus" value={formatNumber(stats.suspended)} color="amber" />
        <StatTile icon={FileText} label="En attente" value={formatNumber(stats.pending)} color="brand" />
        <StatTile icon={FileText} label="Revenus mensuels" value={formatCurrency(stats.totalRevenue)} color="violet" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input placeholder="Rechercher..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: "all", label: "Tous les statuts" },
              { value: "active", label: "Actif" },
              { value: "pending", label: "En attente" },
              { value: "suspended", label: "Suspendu" },
              { value: "terminated", label: "Résilié" },
              { value: "expired", label: "Expiré" },
            ]} />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[
              { value: "all", label: "Tous les types" },
              { value: "individual", label: "Individuel" },
              { value: "family", label: "Famille" },
              { value: "group", label: "Groupe" },
              { value: "enterprise", label: "Entreprise" },
            ]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <DataTable columns={columns} data={filtered} loading={isLoading} rowKey={(c) => c.id} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau contrat"
        description="Créer un nouveau contrat d'assurance santé"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={form.handleSubmit(onSubmit)} loading={createContract.isPending}>Créer le contrat</Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Assuré" required className="md:col-span-2" {...form.register("insuredId")} options={[
            { value: "", label: "Sélectionner un assuré..." },
            ...insureds.map((i) => ({ value: i.id, label: `${i.firstName} ${i.lastName} - ${i.matricule}` })),
          ]} />
          <Select label="Type de contrat" required {...form.register("type")} options={[
            { value: "individual", label: "Individuel" },
            { value: "family", label: "Famille" },
            { value: "group", label: "Groupe" },
            { value: "enterprise", label: "Entreprise" },
          ]} />
          <Select label="Produit" required {...form.register("productName")} options={[
            { value: "Santé Essentielle", label: "Santé Essentielle" },
            { value: "Santé Confort", label: "Santé Confort" },
            { value: "Santé Premium", label: "Santé Premium" },
            { value: "Santé Famille", label: "Santé Famille" },
            { value: "Santé Senior", label: "Santé Senior" },
            { value: "Santé Entreprise", label: "Santé Entreprise" },
          ]} />
          <Input label="Date de début" type="date" required {...form.register("startDate")} />
          <Input label="Date de fin" type="date" required {...form.register("endDate")} />
          <Input label="Prime mensuelle (€)" type="number" required {...form.register("monthlyPremium")} />
          <Select label="Fréquence de paiement" required {...form.register("paymentFrequency")} options={[
            { value: "monthly", label: "Mensuel" },
            { value: "quarterly", label: "Trimestriel" },
            { value: "annual", label: "Annuel" },
          ]} />
          <Input label="Plafond de couverture (€)" type="number" required {...form.register("coverageAmount")} />
          <Input label="Franchise (€)" type="number" {...form.register("deductible")} />
          <Input label="Commission (%)" type="number" {...form.register("commission")} />
          <Select label="Statut" required {...form.register("status")} options={[
            { value: "pending", label: "En attente" },
            { value: "active", label: "Actif" },
          ]} />
          <Textarea label="Notes" className="md:col-span-2" rows={3} {...form.register("notes")} />
        </form>
      </Modal>

      <Modal open={!!viewContract} onClose={() => setViewContract(null)} title="Détails du contrat" size="lg">
        {viewContract && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <p className="text-xs font-mono text-slate-500">{viewContract.reference}</p>
              <p className="mt-1 text-lg font-bold">{viewContract.productName}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant={statusVariant[viewContract.status]} dot>{viewContract.status}</Badge>
                <Badge variant="info">{typeLabel[viewContract.type]}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Prime mensuelle" value={formatCurrency(viewContract.monthlyPremium)} />
              <DetailField label="Prime annuelle" value={formatCurrency(viewContract.annualPremium)} />
              <DetailField label="Plafond" value={formatCurrency(viewContract.coverageAmount)} />
              <DetailField label="Restant" value={formatCurrency(viewContract.remainingCoverage)} />
              <DetailField label="Franchise" value={formatCurrency(viewContract.deductible)} />
              <DetailField label="Commission" value={`${viewContract.commission}%`} />
              <DetailField label="Début" value={format(new Date(viewContract.startDate), "dd MMM yyyy", { locale: fr })} />
              <DetailField label="Fin" value={format(new Date(viewContract.endDate), "dd MMM yyyy", { locale: fr })} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Garanties incluses</p>
              <div className="flex flex-wrap gap-1.5">
                {viewContract.guarantees.map((g) => (
                  <Badge key={g} variant="brand">{g}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    brand: "from-brand-500/10 to-brand-500/5 text-brand-600 border-brand-200/50",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/50",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/50",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600 border-violet-200/50",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}