import { useState } from "react";
import { Building2, Search, MapPin, Phone, Mail, Star, FileText, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { useHospitals, useConventions, useCreateHospital, useDeleteHospital } from "../hooks/useApi";
import { formatNumber } from "../utils/cn";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Hospital } from "../types";

const hospitalSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  code: z.string().min(2, "Code requis"),
  type: z.enum(["public", "private", "clinic", "university"]),
  tier: z.coerce.number().min(1).max(3),
  address: z.string().min(2, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(2, "Code postal requis"),
  phone: z.string().min(6, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  director: z.string().min(2, "Directeur requis"),
  bedCapacity: z.coerce.number().min(1, "Capacité requise"),
  specialties: z.string().optional(),
});

type HospitalForm = z.infer<typeof hospitalSchema>;

const typeVariant: Record<Hospital["type"], "info" | "violet" | "success" | "warning"> = {
  public: "info",
  private: "violet",
  clinic: "success",
  university: "warning",
};

const typeLabel: Record<Hospital["type"], string> = {
  public: "Public",
  private: "Privé",
  clinic: "Clinique",
  university: "CHU",
};

export function Hospitals() {
  const { data: hospitals = [], isLoading } = useHospitals();
  const { data: conventions = [] } = useConventions();
  const createHospital = useCreateHospital();
  const deleteHospital = useDeleteHospital();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<Hospital | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const hospitalForm = useForm<HospitalForm>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      type: "public",
      tier: 2,
      bedCapacity: 50,
      specialties: "",
    },
  });

  const onSubmitHospital = async (data: HospitalForm) => {
    try {
      await createHospital.mutateAsync({
        ...data,
        specialties: data.specialties ? data.specialties.split(",").map((s) => s.trim()) : [],
      });
      setCreateOpen(false);
      hospitalForm.reset();
    } catch {
      /* toast handled by onError */
    }
  };

  const filtered = hospitals.filter((h) => {
    const matchSearch = !search || `${h.name} ${h.city} ${h.code}`.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "all" || String(h.tier) === tierFilter;
    const matchType = typeFilter === "all" || h.type === typeFilter;
    return matchSearch && matchTier && matchType;
  });

  const stats = {
    total: hospitals.length,
    active: hospitals.filter((h) => h.active).length,
    tier1: hospitals.filter((h) => h.tier === 1).length,
    totalClaims: hospitals.reduce((s, h) => s + h.totalClaims, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réseau Hôpitaux"
        description="Gestion du réseau d'hôpitaux partenaires et conventions"
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>Ajouter un partenaire</Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBox label="Total partenaires" value={formatNumber(stats.total)} color="brand" />
        <StatBox label="Actifs" value={formatNumber(stats.active)} color="emerald" />
        <StatBox label="Tier 1 (Premium)" value={formatNumber(stats.tier1)} color="violet" />
        <StatBox label="Demandes totales" value={formatNumber(stats.totalClaims)} color="amber" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input placeholder="Rechercher un hôpital..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} options={[
              { value: "all", label: "Tous les tiers" },
              { value: "1", label: "Tier 1 - Premium" },
              { value: "2", label: "Tier 2 - Standard" },
              { value: "3", label: "Tier 3 - Basique" },
            ]} />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[
              { value: "all", label: "Tous les types" },
              { value: "public", label: "Public" },
              { value: "private", label: "Privé" },
              { value: "clinic", label: "Clinique" },
              { value: "university", label: "CHU" },
            ]} />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer h-64 rounded-xl" />)
          : filtered.map((h) => (
              <Card key={h.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className="relative h-20 bg-gradient-to-br from-brand-500 via-brand-600 to-violet-600">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                  <div className="absolute right-3 top-3">
                    <Badge variant={typeVariant[h.type]}>{typeLabel[h.type]}</Badge>
                  </div>
                  <div className="absolute -bottom-6 left-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-white text-brand-600 shadow-lg dark:border-slate-900 dark:bg-slate-900">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <CardContent className="pt-8">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{h.name}</h3>
                      <p className="text-[10px] text-slate-500">{h.code}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{h.rating}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{h.city}</p>
                    <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{h.phone}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-[11px] dark:bg-slate-900/50">
                    <div>
                      <p className="text-slate-500">Lits</p>
                      <p className="font-bold">{h.bedCapacity}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Demandes</p>
                      <p className="font-bold">{formatNumber(h.totalClaims)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Délai</p>
                      <p className="font-bold">{h.averageProcessingDays}j</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {h.specialties.slice(0, 3).map((s) => (
                      <Badge key={s} variant="default" size="sm">{s}</Badge>
                    ))}
                    {h.specialties.length > 3 && (
                      <Badge variant="neutral" size="sm">+{h.specialties.length - 3}</Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${h.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span className="text-[10px] text-slate-500">{h.active ? "Actif" : "Inactif"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setView(h)}>Détails →</Button>
                      <button
                        onClick={() => { if (confirm(`Supprimer ${h.name} ?`)) deleteHospital.mutate(h.id); }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || ""} size="lg">
        {view && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <InfoBox label="Code" value={view.code} />
              <InfoBox label="Type" value={typeLabel[view.type]} />
              <InfoBox label="Tier" value={`Tier ${view.tier}`} />
              <InfoBox label="Capacité" value={`${view.bedCapacity} lits`} />
              <InfoBox label="Note" value={`${view.rating}/5`} />
              <InfoBox label="Remise" value={`${view.pricingDiscount}%`} />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</h4>
              <p className="mt-2 text-sm">{view.director}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-600"><Phone className="h-3.5 w-3.5" />{view.phone}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-600"><Mail className="h-3.5 w-3.5" />{view.email}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-600"><MapPin className="h-3.5 w-3.5" />{view.address}, {view.city} {view.postalCode}</p>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Spécialités</h4>
              <div className="flex flex-wrap gap-1.5">
                {view.specialties.map((s) => <Badge key={s} variant="brand">{s}</Badge>)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="h-3.5 w-3.5" />
                Convention
              </h4>
              {(() => {
                const conv = conventions.find((c) => c.hospitalId === view.id);
                if (!conv) return <p className="text-xs text-slate-500">Aucune convention</p>;
                return (
                  <div className="space-y-1 text-xs">
                    <p><span className="text-slate-500">Référence:</span> <span className="font-mono">{conv.reference}</span></p>
                    <p><span className="text-slate-500">Statut:</span> <Badge variant={conv.status === "active" ? "success" : "warning"} size="sm">{conv.status}</Badge></p>
                    <p><span className="text-slate-500">Période:</span> {format(new Date(conv.startDate), "dd/MM/yyyy", { locale: fr })} → {format(new Date(conv.endDate), "dd/MM/yyyy", { locale: fr })}</p>
                    <p><span className="text-slate-500">Remise:</span> {conv.discountRate}%</p>
                    <p><span className="text-slate-500">Paiement:</span> {conv.paymentTerms}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Ajouter un hôpital partenaire"
        description="Créer une nouvelle convention d'hospitalisation"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={hospitalForm.handleSubmit(onSubmitHospital)} loading={createHospital.isPending}>Créer</Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Nom" required {...hospitalForm.register("name")} />
          <Input label="Code" required {...hospitalForm.register("code")} />
          <Select label="Type" required {...hospitalForm.register("type")} options={[
            { value: "public", label: "Public" },
            { value: "private", label: "Privé" },
            { value: "clinic", label: "Clinique" },
            { value: "university", label: "CHU" },
          ]} />
          <Select label="Niveau (Tier)" required {...hospitalForm.register("tier", { valueAsNumber: true })} options={[
            { value: "1", label: "Tier 1 - Premium" },
            { value: "2", label: "Tier 2 - Standard" },
            { value: "3", label: "Tier 3 - Basique" },
          ]} />
          <Input label="Adresse" required className="md:col-span-2" {...hospitalForm.register("address")} />
          <Input label="Ville" required {...hospitalForm.register("city")} />
          <Input label="Code postal" required {...hospitalForm.register("postalCode")} />
          <Input label="Téléphone" required {...hospitalForm.register("phone")} />
          <Input label="Email" type="email" required {...hospitalForm.register("email")} />
          <Input label="Directeur" required {...hospitalForm.register("director")} />
          <Input label="Capacité (lits)" type="number" required {...hospitalForm.register("bedCapacity", { valueAsNumber: true })} />
          <Input label="Spécialités (séparées par des virgules)" className="md:col-span-2" {...hospitalForm.register("specialties")} />
        </form>
      </Modal>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    brand: "border-brand-200 bg-brand-50 text-brand-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}