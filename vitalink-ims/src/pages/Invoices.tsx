import { useState } from "react";
import { FileText, Search, Eye, CheckCircle2, XCircle, Clock, Euro, Building2, User } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { DataTable } from "../components/ui/Table";
import { useInvoices, useHospitals } from "../hooks/useApi";
import { formatCurrency, formatNumber } from "../utils/cn";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Variant } from "../components/ui/Badge";

const statusVariant: Record<string, Variant> = {
  recue: "brand",
  en_attente: "info",
  approuvee: "success",
  rejetee: "danger",
  litige: "warning",
  remboursee: "violet",
};

const statusLabel: Record<string, string> = {
  recue: "Reçue",
  en_attente: "En attente",
  approuvee: "Approuvée",
  rejetee: "Rejetée",
  litige: "Litige",
  remboursee: "Remboursée",
};

export function Invoices() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: hospitals = [] } = useHospitals();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<any>(null);

  const filtered = invoices.filter((inv: any) => {
    const matchSearch = !search || `${inv.invoiceNumber} ${inv.patientName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: invoices.length,
    recues: invoices.filter((i: any) => i.statut === "recue").length,
    approuvees: invoices.filter((i: any) => i.statut === "approuvee" || i.statut === "remboursee").length,
    rejetees: invoices.filter((i: any) => i.statut === "rejetee").length,
    montantTotal: invoices.reduce((s: number, i: any) => s + i.montantTotal, 0),
  };

  const columns = [
    {
      key: "ref",
      header: "N° Facture",
      cell: (inv: any) => (
        <div>
          <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
          <p className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(inv.submittedAt), { addSuffix: true, locale: fr })}</p>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      cell: (inv: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/30">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium">{inv.patientName}</span>
        </div>
      ),
    },
    {
      key: "hospital",
      header: "Hôpital",
      cell: (inv: any) => {
        const h = hospitals.find((h: any) => h.id === inv.hospitalId);
        return (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{h?.name || inv.hospitalName || inv.hospitalId}</span>
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Montant",
      cell: (inv: any) => (
        <div className="text-right">
          <p className="text-xs font-semibold">{formatCurrency(inv.montantTotal)}</p>
          {inv.montantRembourse > 0 && (
            <p className="text-[10px] text-emerald-600">Remboursé: {formatCurrency(inv.montantRembourse)}</p>
          )}
        </div>
      ),
      align: "right" as const,
    },
    {
      key: "claim",
      header: "Réclamation",
      cell: (inv: any) => (
        <span className="text-xs font-mono text-slate-500">{inv.claimNumber || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (inv: any) => <Badge variant={statusVariant[inv.statut] || "default"} dot>{statusLabel[inv.statut] || inv.statut}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (inv: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setView(inv)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" aria-label="Voir">
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      align: "right" as const,
      width: "60px",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures des hôpitaux"
        description={`${stats.total} factures reçues des hôpitaux partenaires via Gateway`}
        icon={<FileText className="h-5 w-5" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPITile label="Total factures" value={formatNumber(stats.total)} icon={FileText} color="brand" />
        <KPITile label="En attente" value={formatNumber(stats.recues)} icon={Clock} color="amber" />
        <KPITile label="Traitées" value={formatNumber(stats.approuvees)} icon={CheckCircle2} color="emerald" />
        <KPITile label="Montant total" value={formatCurrency(stats.montantTotal)} icon={Euro} color="violet" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input placeholder="Rechercher par n° de facture ou patient..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: "all", label: "Tous les statuts" },
              { value: "recue", label: "Reçues" },
              { value: "en_attente", label: "En attente" },
              { value: "approuvee", label: "Approuvées" },
              { value: "rejetee", label: "Rejetées" },
              { value: "litige", label: "Litiges" },
              { value: "remboursee", label: "Remboursées" },
            ]} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <DataTable columns={columns} data={filtered} loading={isLoading} rowKey={(c: any) => c.id} />
      </Card>

      {/* View Modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={`Facture ${view?.invoiceNumber || ""}`} size="xl">
        {view && (
          <div className="space-y-5">
            <div className="flex items-start justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <div>
                <p className="text-xs font-mono text-slate-500">{view.invoiceNumber}</p>
                <h3 className="mt-1 text-lg font-bold">{view.patientName}</h3>
                <p className="text-xs text-slate-500">
                  {view.claimNumber && `Réclamation: ${view.claimNumber}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={statusVariant[view.statut] || "default"} dot>{statusLabel[view.statut] || view.statut}</Badge>
              </div>
            </div>

            {view.statut === "rejetee" && view.rejectionReason && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
                <XCircle className="h-3.5 w-3.5 inline mr-1" /> Motif du rejet : {view.rejectionReason}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <DetailField label="Patient" value={view.patientName} />
              <DetailField label="Hôpital" value={view.hospitalName || view.hospitalId} />
              <DetailField label="Montant total" value={formatCurrency(view.montantTotal)} />
              <DetailField label="Montant remboursé" value={view.montantRembourse > 0 ? formatCurrency(view.montantRembourse) : "—"} />
              <DetailField label="Date soumission" value={format(new Date(view.submittedAt), "dd MMM yyyy", { locale: fr })} />
              <DetailField label="Réclamation" value={view.claimNumber || "—"} />
            </div>

            {view.actes && view.actes.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Actes médicaux</h4>
                <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Acte</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Code</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Description</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.actes.map((a: any, i: number) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2 text-xs font-medium">{a.acte}</td>
                          <td className="px-3 py-2 text-xs font-mono text-slate-500">{a.code}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">{a.description}</td>
                          <td className="px-3 py-2 text-xs text-right font-semibold">{formatCurrency(a.montant)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <td colSpan={3} className="px-3 py-2 text-xs font-bold text-right">Total</td>
                        <td className="px-3 py-2 text-xs font-bold text-right">{formatCurrency(view.montantTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function KPITile({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${colors[color]}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
        </div>
        <p className="mt-2 text-base font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
