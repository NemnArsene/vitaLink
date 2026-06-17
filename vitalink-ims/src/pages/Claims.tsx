import { useState } from "react";
import { Receipt, Search, Download, CheckCircle2, XCircle, AlertTriangle, Eye, Clock, Euro, FileText } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { DataTable } from "../components/ui/Table";
import { Avatar, Alert } from "../components/ui/States";
import { useClaims, useInsureds, useHospitals, useProcessClaim } from "../hooks/useApi";
import { formatCurrency, formatNumber } from "../utils/cn";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ReimbursementClaim } from "../types";
import type { Variant } from "../components/ui/Badge";

const statusVariant: Record<ReimbursementClaim["status"], Variant> = {
  received: "brand",
  under_review: "info",
  approved: "success",
  rejected: "danger",
  disputed: "warning",
  paid: "violet",
};

const priorityVariant: Record<ReimbursementClaim["priority"], Variant> = {
  low: "neutral",
  normal: "default",
  high: "warning",
  urgent: "danger",
};

export function Claims() {
  const { data: claims = [], isLoading } = useClaims();
  const { data: insureds = [] } = useInsureds();
  const { data: hospitals = [] } = useHospitals();
  const processClaim = useProcessClaim();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [view, setView] = useState<ReimbursementClaim | null>(null);
  const [actionModal, setActionModal] = useState<{ claim: ReimbursementClaim; action: "approve" | "reject" | "dispute" | "pay" } | null>(null);
  const [actionComment, setActionComment] = useState("");

  const filtered = claims.filter((c) => {
    const insured = insureds.find((i) => i.id === c.insuredId);
    const matchSearch = !search || `${c.reference} ${insured?.firstName} ${insured?.lastName} ${c.medicalAct}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter((c) => ["received", "under_review"].includes(c.status)).length,
    approved: claims.filter((c) => c.status === "approved" || c.status === "paid").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    disputed: claims.filter((c) => c.status === "disputed").length,
    totalAmount: claims.reduce((s, c) => s + c.claimedAmount, 0),
    approvedAmount: claims.filter((c) => ["approved", "paid"].includes(c.status)).reduce((s, c) => s + c.approvedAmount, 0),
  };

  const columns = [
    {
      key: "ref",
      header: "Référence",
      cell: (c: ReimbursementClaim) => (
        <div>
          <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{c.reference}</p>
          <p className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(c.submissionDate), { addSuffix: true, locale: fr })}</p>
        </div>
      ),
    },
    {
      key: "insured",
      header: "Assuré",
      cell: (c: ReimbursementClaim) => {
        const insured = insureds.find((i) => i.id === c.insuredId);
        return (
          <div className="flex items-center gap-2">
            <Avatar name={insured ? `${insured.firstName} ${insured.lastName}` : "NA"} size="sm" />
            <div>
              <p className="text-xs font-medium">{insured ? `${insured.firstName} ${insured.lastName}` : "—"}</p>
              <p className="text-[10px] text-slate-500">{insured?.matricule}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "act",
      header: "Acte médical",
      cell: (c: ReimbursementClaim) => (
        <div>
          <p className="text-xs font-medium">{c.medicalAct}</p>
          <p className="text-[10px] font-mono text-slate-500">{c.medicalActCode}</p>
        </div>
      ),
    },
    {
      key: "hospital",
      header: "Hôpital",
      cell: (c: ReimbursementClaim) => {
        const h = hospitals.find((h) => h.id === c.hospitalId);
        return <span className="text-xs text-slate-600 dark:text-slate-400">{h?.name || "—"}</span>;
      },
    },
    {
      key: "amount",
      header: "Montant",
      cell: (c: ReimbursementClaim) => (
        <div className="text-right">
          <p className="text-xs font-semibold">{formatCurrency(c.claimedAmount)}</p>
          {c.approvedAmount > 0 && c.status !== "rejected" && (
            <p className="text-[10px] text-emerald-600">→ {formatCurrency(c.approvedAmount)}</p>
          )}
        </div>
      ),
      align: "right" as const,
    },
    {
      key: "priority",
      header: "Priorité",
      cell: (c: ReimbursementClaim) => <Badge variant={priorityVariant[c.priority]} size="sm" dot>{c.priority}</Badge>,
    },
    {
      key: "status",
      header: "Statut",
      cell: (c: ReimbursementClaim) => <Badge variant={statusVariant[c.status]} dot>{c.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (c: ReimbursementClaim) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setView(c)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" aria-label="Voir">
            <Eye className="h-3.5 w-3.5" />
          </button>
          {(c.status === "received" || c.status === "under_review") && (
            <>
              <button onClick={() => setActionModal({ claim: c, action: "approve" })} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800" aria-label="Approuver">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setActionModal({ claim: c, action: "reject" })} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" aria-label="Rejeter">
                <XCircle className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setActionModal({ claim: c, action: "dispute" })} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800" aria-label="Litige">
                <AlertTriangle className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {c.status === "approved" && (
            <button onClick={() => setActionModal({ claim: c, action: "pay" })} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-violet-600 dark:hover:bg-slate-800" aria-label="Payer">
              <Euro className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
      align: "right" as const,
      width: "160px",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traitement des Remboursements"
        description="Réception, validation et suivi des demandes de remboursement"
        icon={<Receipt className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>Exporter</Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <KPITile label="Total" value={formatNumber(stats.total)} icon={Receipt} color="brand" />
        <KPITile label="En attente" value={formatNumber(stats.pending)} icon={Clock} color="amber" />
        <KPITile label="Approuvées" value={formatNumber(stats.approved)} icon={CheckCircle2} color="emerald" />
        <KPITile label="Rejetées" value={formatNumber(stats.rejected)} icon={XCircle} color="rose" />
        <KPITile label="Litiges" value={formatNumber(stats.disputed)} icon={AlertTriangle} color="amber" />
        <KPITile label="Demandé" value={formatCurrency(stats.totalAmount)} icon={Euro} color="violet" />
        <KPITile label="Approuvé" value={formatCurrency(stats.approvedAmount)} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input placeholder="Rechercher..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
              { value: "all", label: "Tous les statuts" },
              { value: "received", label: "Reçues" },
              { value: "under_review", label: "En cours" },
              { value: "approved", label: "Approuvées" },
              { value: "rejected", label: "Rejetées" },
              { value: "disputed", label: "Litiges" },
              { value: "paid", label: "Payées" },
            ]} />
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} options={[
              { value: "all", label: "Toutes priorités" },
              { value: "urgent", label: "Urgent" },
              { value: "high", label: "Haute" },
              { value: "normal", label: "Normale" },
              { value: "low", label: "Basse" },
            ]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <DataTable columns={columns} data={filtered} loading={isLoading} rowKey={(c) => c.id} />
      </Card>

      {/* View Modal */}
      <Modal open={!!view} onClose={() => setView(null)} title="Détails de la demande" size="xl">
        {view && (
          <div className="space-y-5">
            <div className="flex items-start justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <div>
                <p className="text-xs font-mono text-slate-500">{view.reference}</p>
                <h3 className="mt-1 text-lg font-bold">{view.medicalAct}</h3>
                <p className="text-xs text-slate-500">{view.medicalActCode}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={statusVariant[view.status]} dot>{view.status}</Badge>
                <Badge variant={priorityVariant[view.priority]} size="sm">{view.priority}</Badge>
              </div>
            </div>

            {view.status === "rejected" && view.rejectionReason && (
              <Alert variant="error" title="Motif du rejet">{view.rejectionReason}</Alert>
            )}
            {view.status === "disputed" && view.disputeReason && (
              <Alert variant="warning" title="Litige en cours">{view.disputeReason}</Alert>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <DetailField label="Montant demandé" value={formatCurrency(view.claimedAmount)} />
              <DetailField label="Montant approuvé" value={formatCurrency(view.approvedAmount)} />
              <DetailField label="Co-paiement" value={formatCurrency(view.copayAmount)} />
              <DetailField label="Date soumission" value={format(new Date(view.submissionDate), "dd MMM yyyy", { locale: fr })} />
              <DetailField label="Date traitement" value={format(new Date(view.treatmentDate), "dd MMM yyyy", { locale: fr })} />
              <DetailField label="Délai SLA" value={format(new Date(view.slaDeadline), "dd MMM yyyy", { locale: fr })} />
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="h-3.5 w-3.5" />
                Description & Diagnostic
              </h4>
              <p className="text-sm">{view.description}</p>
              {view.diagnosis && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Diagnostic</p>
                  <p className="mt-0.5 text-sm font-medium">{view.diagnosis}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Documents ({view.documents.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {view.documents.map((d, i) => <Badge key={i} variant="brand">{d}</Badge>)}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Historique</h4>
              <div className="space-y-2">
                {view.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-brand-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{h.action}</p>
                        <p className="text-[10px] text-slate-500">{format(new Date(h.date), "dd MMM HH:mm", { locale: fr })}</p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{h.actor}</p>
                      {h.comment && <p className="mt-1 text-xs text-slate-500 italic">"{h.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setActionComment(""); }}
        title={
          actionModal?.action === "approve" ? "Approuver la demande" :
          actionModal?.action === "reject" ? "Rejeter la demande" :
          actionModal?.action === "dispute" ? "Ouvrir un litige" :
          "Effectuer le paiement"
        }
        description={`Référence: ${actionModal?.claim.reference}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setActionModal(null); setActionComment(""); }}>Annuler</Button>
            <Button
              variant={actionModal?.action === "reject" ? "danger" : "primary"}
              loading={processClaim.isPending}
              onClick={() => {
                if (actionModal) {
                  processClaim.mutate({ id: actionModal.claim.id, action: actionModal.action, comment: actionComment });
                  setActionModal(null);
                  setActionComment("");
                }
              }}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant={actionModal?.action === "reject" ? "error" : actionModal?.action === "dispute" ? "warning" : "info"}>
            {actionModal?.action === "approve" && "La demande sera validée et passera en statut 'Approuvée'."}
            {actionModal?.action === "reject" && "La demande sera rejetée. Veuillez préciser le motif."}
            {actionModal?.action === "dispute" && "Un litige sera ouvert et nécessitera une revue manuelle."}
            {actionModal?.action === "pay" && "Le paiement sera déclenché et la demande passera en statut 'Payée'."}
          </Alert>
          <Textarea
            label="Commentaire"
            placeholder="Ajoutez un commentaire..."
            rows={4}
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
          />
        </div>
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