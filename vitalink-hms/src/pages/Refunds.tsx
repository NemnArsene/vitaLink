import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, Send, RefreshCw, XCircle, Banknote } from "lucide-react";
import { RefundsAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea, Label } from "@/components/ui/Input";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import type { RefundStatus } from "@/types";

const STATUS_GROUPS: Array<{ label: string; statuses: RefundStatus[]; color: string; icon: any }> = [
  { label: "Soumis", statuses: ["SUBMITTED"], color: "var(--info)", icon: Send },
  { label: "En traitement", statuses: ["PROCESSING"], color: "var(--warning)", icon: Clock },
  { label: "Approuvés", statuses: ["APPROVED", "PAID"], color: "var(--success)", icon: CheckCircle2 },
  { label: "Litiges", statuses: ["DISPUTED", "REJECTED"], color: "var(--danger)", icon: AlertCircle },
];

export default function Refunds() {
  const qc = useQueryClient();
  const [dispute, setDispute] = useState<any>(null);
  const [reason, setReason] = useState("");

  const { data: refunds = [] } = useQuery({ queryKey: ["refunds"], queryFn: RefundsAPI.list });

  const disputeMut = useMutation({
    mutationFn: ({ id, reason }: any) => RefundsAPI.dispute(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["refunds"] });
      setDispute(null); setReason("");
      toast.success("Litige ouvert");
    },
  });

  const totalAmount = refunds.reduce((s, r) => s + r.amount, 0);
  const pendingAmount = refunds.filter(r => r.status === "SUBMITTED" || r.status === "PROCESSING").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Remboursements"
        description={`Suivi des demandes soumises à l'assurance via API Gateway`}
      />

      {/* Status pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_GROUPS.map(g => {
          const Icon = g.icon;
          const count = refunds.filter(r => g.statuses.includes(r.status)).length;
          return (
            <div key={g.label} className="card p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 rounded-full opacity-5" style={{ background: g.color }} />
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5" style={{ color: g.color }} />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{g.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Volume total soumis</div>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>En attente</div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</div>
        </div>
      </div>

      <DataTable
        data={refunds}
        searchable
        searchPlaceholder="Rechercher par référence, patient, n° facture..."
        emptyIcon={<Banknote className="h-6 w-6" />}
        emptyTitle="Aucun remboursement"
        rowKey={(r) => r.id}
        columns={[
          { key: "reference", label: "Référence", render: r => <span className="font-mono text-xs">{r.reference}</span> },
          { key: "invoiceNumber", label: "Facture", render: r => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
          { key: "patientName", label: "Patient" },
          { key: "insuranceCompany", label: "Assureur", render: r => <Badge variant="info">{r.insuranceCompany}</Badge> },
          { key: "amount", label: "Montant", render: r => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
          { key: "submittedAt", label: "Soumis le", sortable: true, render: r => <span className="text-xs">{formatDateTime(r.submittedAt)}</span> },
          { key: "status", label: "Statut", render: r => <StatusBadge status={r.status} /> },
          { key: "actions", label: "", render: r => r.status === "REJECTED" || r.status === "DISPUTED" ? (
            <Button size="sm" variant="outline" onClick={() => setDispute(r)}><RefreshCw className="h-3 w-3" /> Relancer</Button>
          ) : null },
        ]}
      />

      {dispute && (
        <Modal open={!!dispute} onClose={() => setDispute(null)} title="Ouvrir un litige" description={`${dispute.reference} — ${dispute.patientName}`}
          footer={<><Button variant="ghost" onClick={() => setDispute(null)}>Annuler</Button><Button onClick={() => disputeMut.mutate({ id: dispute.id, reason })} loading={disputeMut.isPending}>Soumettre le litige</Button></>}>
          <div className="space-y-3">
            {dispute.rejectionReason && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-100"><XCircle className="h-4 w-4 inline mr-1" /> Motif rejet : {dispute.rejectionReason}</div>}
            <div><Label required>Motif du litige</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Expliquez pourquoi vous contestez cette décision..." /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}