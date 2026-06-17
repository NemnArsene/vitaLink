import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { DataTable } from "../components/ui/Table";
import { Avatar } from "../components/ui/States";
import { useInsureds, useDeleteInsured, useCreateInsured, useUpdateInsured } from "../hooks/useApi";
import { formatCurrency, formatNumber } from "../utils/cn";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Insured } from "../types";

const insuredSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone requis"),
  birthDate: z.string().min(1, "Date de naissance requise"),
  gender: z.enum(["M", "F"]),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  address: z.string().min(2, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(4, "Code postal requis"),
  socialSecurityNumber: z.string().min(10, "N° SS invalide"),
  status: z.enum(["active", "suspended", "terminated", "pending"]),
});

type InsuredForm = z.infer<typeof insuredSchema>;

const statusVariant: Record<Insured["status"], "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  suspended: "warning",
  terminated: "danger",
  pending: "neutral",
};

export function Insureds() {
  const { data: insureds = [], isLoading } = useInsureds();
  const deleteInsured = useDeleteInsured();
  const createInsured = useCreateInsured();
  const updateInsured = useUpdateInsured();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewInsured, setViewInsured] = useState<Insured | null>(null);
  const [editing, setEditing] = useState<Insured | null>(null);

  const cities = Array.from(new Set(insureds.map((i) => i.city))).sort();

  const filtered = insureds.filter((i) => {
    const matchSearch = !search ||
      `${i.firstName} ${i.lastName} ${i.email} ${i.matricule}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchCity = cityFilter === "all" || i.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const form = useForm<InsuredForm>({
    resolver: zodResolver(insuredSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      birthDate: "", gender: "M", maritalStatus: "single",
      address: "", city: "", postalCode: "", socialSecurityNumber: "",
      status: "pending",
    },
  });

  const onSubmit = (data: InsuredForm) => {
    if (editing) {
      updateInsured.mutate({ id: editing.id, data });
    } else {
      createInsured.mutate(data as Partial<Insured>);
    }
    setModalOpen(false);
    setEditing(null);
    form.reset();
  };

  const handleEdit = (insured: Insured) => {
    setEditing(insured);
    form.reset({
      firstName: insured.firstName,
      lastName: insured.lastName,
      email: insured.email,
      phone: insured.phone,
      birthDate: insured.birthDate.slice(0, 10),
      gender: insured.gender,
      maritalStatus: insured.maritalStatus,
      address: insured.address,
      city: insured.city,
      postalCode: insured.postalCode,
      socialSecurityNumber: insured.socialSecurityNumber,
      status: insured.status,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      header: "Assuré",
      cell: (i: Insured) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${i.firstName} ${i.lastName}`} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900 dark:text-white">{i.firstName} {i.lastName}</p>
            <p className="truncate text-xs text-slate-500">{i.matricule}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (i: Insured) => (
        <div>
          <p className="text-xs text-slate-700 dark:text-slate-300">{i.email}</p>
          <p className="text-xs text-slate-500">{i.phone}</p>
        </div>
      ),
    },
    {
      key: "city",
      header: "Ville",
      cell: (i: Insured) => <span className="text-xs text-slate-600 dark:text-slate-400">{i.city}</span>,
    },
    {
      key: "age",
      header: "Âge",
      cell: (i: Insured) => <span className="text-xs text-slate-600 dark:text-slate-400">{differenceInYears(new Date(), new Date(i.birthDate))} ans</span>,
      align: "center" as const,
    },
    {
      key: "risk",
      header: "Risque",
      cell: (i: Insured) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full ${
                i.riskScore > 70 ? "bg-rose-500" : i.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${i.riskScore}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{i.riskScore}</span>
        </div>
      ),
    },
    {
      key: "reimb",
      header: "Remboursé",
      cell: (i: Insured) => <span className="text-xs font-medium text-slate-900 dark:text-white">{formatCurrency(i.totalReimbursements)}</span>,
      align: "right" as const,
    },
    {
      key: "status",
      header: "Statut",
      cell: (i: Insured) => <Badge variant={statusVariant[i.status]} dot>{i.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (i: Insured) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewInsured(i)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" aria-label="Voir">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleEdit(i)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800" aria-label="Modifier">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => deleteInsured.mutate(i.id)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" aria-label="Supprimer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      align: "right" as const,
      width: "120px",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assurés"
        description={`${formatNumber(insureds.length)} assurés enregistrés dans le système`}
        icon={<Avatar name="Insureds" size="md" className="!h-10 !w-10" />}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>Exporter</Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); form.reset(); setModalOpen(true); }}>
              Nouvel assuré
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              placeholder="Rechercher par nom, email, matricule..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Tous les statuts" },
                { value: "active", label: "Actif" },
                { value: "suspended", label: "Suspendu" },
                { value: "terminated", label: "Résilié" },
                { value: "pending", label: "En attente" },
              ]}
            />
            <Select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              options={[{ value: "all", label: "Toutes les villes" }, ...cities.map((c) => ({ value: c, label: c }))]}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>{formatNumber(filtered.length)} résultats affichés</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          loading={isLoading}
          rowKey={(i) => i.id}
          emptyMessage="Aucun assuré trouvé"
        />
      </Card>

      {/* Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Modifier l'assuré" : "Nouvel assuré"}
        description={editing ? `Modifiez les informations de ${editing.firstName} ${editing.lastName}` : "Renseignez les informations du nouvel assuré"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null); }}>Annuler</Button>
            <Button onClick={form.handleSubmit(onSubmit)} loading={createInsured.isPending || updateInsured.isPending}>
              {editing ? "Mettre à jour" : "Créer l'assuré"}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Prénom" required {...form.register("firstName")} error={form.formState.errors.firstName?.message} />
          <Input label="Nom" required {...form.register("lastName")} error={form.formState.errors.lastName?.message} />
          <Input label="Email" type="email" required icon={<Mail className="h-4 w-4" />} {...form.register("email")} error={form.formState.errors.email?.message} />
          <Input label="Téléphone" required icon={<Phone className="h-4 w-4" />} {...form.register("phone")} error={form.formState.errors.phone?.message} />
          <Input label="Date de naissance" type="date" required {...form.register("birthDate")} error={form.formState.errors.birthDate?.message} />
          <Select label="Genre" required {...form.register("gender")} options={[{ value: "M", label: "Homme" }, { value: "F", label: "Femme" }]} />
          <Select label="Statut matrimonial" required {...form.register("maritalStatus")} options={[
            { value: "single", label: "Célibataire" },
            { value: "married", label: "Marié(e)" },
            { value: "divorced", label: "Divorcé(e)" },
            { value: "widowed", label: "Veuf/Veuve" },
          ]} />
          <Select label="Statut" required {...form.register("status")} options={[
            { value: "active", label: "Actif" },
            { value: "pending", label: "En attente" },
            { value: "suspended", label: "Suspendu" },
            { value: "terminated", label: "Résilié" },
          ]} />
          <Input label="Adresse" required className="md:col-span-2" {...form.register("address")} error={form.formState.errors.address?.message} />
          <Input label="Ville" required {...form.register("city")} error={form.formState.errors.city?.message} />
          <Input label="Code postal" required {...form.register("postalCode")} error={form.formState.errors.postalCode?.message} />
          <Input label="N° Sécurité Sociale" required className="md:col-span-2" {...form.register("socialSecurityNumber")} error={form.formState.errors.socialSecurityNumber?.message} />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewInsured}
        onClose={() => setViewInsured(null)}
        title="Détails de l'assuré"
        size="lg"
      >
        {viewInsured && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={`${viewInsured.firstName} ${viewInsured.lastName}`} size="xl" />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{viewInsured.firstName} {viewInsured.lastName}</h3>
                <p className="text-sm text-slate-500">{viewInsured.matricule}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={statusVariant[viewInsured.status]} dot>{viewInsured.status}</Badge>
                  <Badge variant="brand">{viewInsured.dependents} ayant(s)-droit</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <Field label="Email" value={viewInsured.email} />
              <Field label="Téléphone" value={viewInsured.phone} />
              <Field label="Date de naissance" value={format(new Date(viewInsured.birthDate), "dd MMMM yyyy", { locale: fr })} />
              <Field label="Âge" value={`${differenceInYears(new Date(), new Date(viewInsured.birthDate))} ans`} />
              <Field label="Ville" value={viewInsured.city} />
              <Field label="Code postal" value={viewInsured.postalCode} />
              <Field label="N° SS" value={viewInsured.socialSecurityNumber} className="col-span-2" />
              <Field label="Score de risque" value={`${viewInsured.riskScore}/100`} />
              <Field label="Total remboursé" value={formatCurrency(viewInsured.totalReimbursements)} />
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Historique des remboursements</h4>
              <div className="rounded-lg border border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-800">
                {formatCurrency(viewInsured.totalReimbursements)} remboursés sur les 12 derniers mois
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}