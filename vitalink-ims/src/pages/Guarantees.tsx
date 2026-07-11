import { useState } from "react";
import { ShieldCheck, Pill, Stethoscope, Building2, Baby, Glasses, ScanLine, TestTube, Smile, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/States";
import { Modal } from "../components/ui/Modal";
import { useGuarantees, useCreateGuarantee, useUpdateGuarantee, useDeleteGuarantee } from "../hooks/useApi";
import { formatCurrency } from "../utils/cn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import type { Guarantee } from "../types";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2, Pill, Stethoscope, Baby, Glasses, ScanLine, TestTube, Smile,
};

function getColorBar(type: string) {
  const map: Record<string, string> = {
    hospitalization: "bg-gradient-to-r from-rose-500 to-rose-600",
    consultation: "bg-gradient-to-r from-brand-500 to-brand-600",
    pharmacy: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    dental: "bg-gradient-to-r from-cyan-500 to-cyan-600",
    optical: "bg-gradient-to-r from-violet-500 to-violet-600",
    maternity: "bg-gradient-to-r from-pink-500 to-pink-600",
    laboratory: "bg-gradient-to-r from-amber-500 to-amber-600",
    imaging: "bg-gradient-to-r from-indigo-500 to-indigo-600",
  };
  return map[type] || "bg-gradient-to-r from-slate-500 to-slate-600";
}

const guaranteeSchema = z.object({
  code: z.string().min(2, "Code requis"),
  name: z.string().min(2, "Nom requis"),
  description: z.string().min(2, "Description requise"),
  type: z.enum(["hospitalization", "consultation", "pharmacy", "dental", "optical", "maternity", "laboratory", "imaging"]),
  ceiling: z.coerce.number().min(1, "Plafond requis"),
  usedAmount: z.coerce.number().min(0),
  copayPercent: z.coerce.number().min(0).max(100),
  waitingDays: z.coerce.number().min(0),
  exclusions: z.string().optional(),
  included: z.boolean(),
  icon: z.string().optional(),
});

type GuaranteeForm = z.infer<typeof guaranteeSchema>;

export function Guarantees() {
  const { data: guarantees = [], isLoading } = useGuarantees();
  const createGuarantee = useCreateGuarantee();
  const updateGuarantee = useUpdateGuarantee();
  const deleteGuarantee = useDeleteGuarantee();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guarantee | null>(null);

  const form = useForm<GuaranteeForm>({
    resolver: zodResolver(guaranteeSchema),
    defaultValues: {
      type: "hospitalization",
      ceiling: 500000,
      usedAmount: 0,
      copayPercent: 10,
      waitingDays: 0,
      included: true,
      exclusions: "",
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      code: "",
      name: "",
      description: "",
      type: "hospitalization",
      ceiling: 500000,
      usedAmount: 0,
      copayPercent: 10,
      waitingDays: 0,
      included: true,
      exclusions: "",
      icon: "ShieldCheck",
    });
    setModalOpen(true);
  };

  const openEdit = (g: Guarantee) => {
    setEditing(g);
    form.reset({
      code: g.code,
      name: g.name,
      description: g.description,
      type: g.type as GuaranteeForm["type"],
      ceiling: g.ceiling,
      usedAmount: g.usedAmount,
      copayPercent: g.copayPercent,
      waitingDays: g.waitingDays,
      exclusions: g.exclusions.join(", "),
      included: g.included,
      icon: g.icon,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: GuaranteeForm) => {
    try {
      if (editing) {
        await updateGuarantee.mutateAsync({
          id: editing.id,
          data: {
            ...data,
            exclusions: data.exclusions ? data.exclusions.split(",").map((s) => s.trim()) : [],
          },
        });
      } else {
        await createGuarantee.mutateAsync({
          ...data,
          exclusions: data.exclusions ? data.exclusions.split(",").map((s) => s.trim()) : [],
        });
      }
      setModalOpen(false);
      form.reset();
    } catch {
      /* toast handled by onError */
    }
  };

  const handleDelete = (g: Guarantee) => {
    if (confirm(`Supprimer la garantie "${g.name}" ?`)) {
      deleteGuarantee.mutate(g.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garanties"
        description="Catalogue des garanties et niveaux de couverture"
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Nouvelle garantie
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-48 rounded-xl" />
            ))
          : guarantees.map((g) => {
              const Icon = ICON_MAP[g.icon] || ShieldCheck;
              const usagePercent = (g.usedAmount / g.ceiling) * 100;
              return (
                <Card key={g.id} className="overflow-hidden transition-all hover:shadow-md group">
                  <div className={`relative h-2 ${getColorBar(g.type)}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={g.included ? "success" : "neutral"} dot>
                          {g.included ? "Actif" : "Désactivé"}
                        </Badge>
                        <button
                          onClick={() => openEdit(g)}
                          className="rounded p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 transition-opacity"
                          aria-label="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          className="rounded p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 transition-opacity"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{g.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{g.description}</p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Plafond annuel</span>
                          <span className="font-semibold">{formatCurrency(g.ceiling)}</span>
                        </div>
                        <div className="mt-1.5">
                          <Progress
                            value={usagePercent}
                            variant={usagePercent > 80 ? "warning" : usagePercent > 95 ? "danger" : "brand"}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatCurrency(g.usedAmount)} utilisés ({usagePercent.toFixed(0)}%)
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-900/50">
                        <div>
                          <p className="text-[10px] text-slate-500">Co-paiement</p>
                          <p className="font-semibold">{g.copayPercent}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Carence</p>
                          <p className="font-semibold">{g.waitingDays} jours</p>
                        </div>
                      </div>

                      {g.exclusions.length > 0 && (
                        <div>
                          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <AlertCircle className="h-3 w-3" />
                            Exclusions
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {g.exclusions.map((e, idx) => (
                              <Badge key={idx} variant="danger" size="sm">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Modifier : ${editing.name}` : "Nouvelle garantie"}
        description={editing ? "Modifier les paramètres de la garantie" : "Ajouter une nouvelle garantie au catalogue"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={form.handleSubmit(onSubmit)} loading={updateGuarantee.isPending || createGuarantee.isPending}>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Code" required {...form.register("code")} />
          <Input label="Nom" required {...form.register("name")} />
          <Input label="Description" required className="md:col-span-2" {...form.register("description")} />
          <Select label="Type" required {...form.register("type")} options={[
            { value: "hospitalization", label: "Hospitalisation" },
            { value: "consultation", label: "Consultation" },
            { value: "pharmacy", label: "Pharmacie" },
            { value: "dental", label: "Dentaire" },
            { value: "optical", label: "Optique" },
            { value: "maternity", label: "Maternité" },
            { value: "laboratory", label: "Laboratoire" },
            { value: "imaging", label: "Imagerie" },
          ]} />
          <Input label="Plafond annuel" type="number" required {...form.register("ceiling")} />
          <Input label="Montant utilisé" type="number" {...form.register("usedAmount")} />
          <Input label="Co-paiement (%)" type="number" {...form.register("copayPercent")} />
          <Input label="Carence (jours)" type="number" {...form.register("waitingDays")} />
          <Input label="Exclusions (séparées par des virgules)" className="md:col-span-2" {...form.register("exclusions")} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("included")} className="rounded border-slate-300" />
            <span>Garantie active</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}