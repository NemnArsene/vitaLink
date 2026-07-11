import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock, Send, RefreshCw, XCircle, Banknote, Plus, ChevronLeft, ChevronRight, FileText, User, ShieldCheck } from "lucide-react";
import { RefundsService, BillingService, PatientsService, InsuranceService } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Select, Textarea, Label } from "@/components/ui/Input";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import type { RefundStatus } from "@/types";

const STATUS_GROUPS: Array<{ label: string; statuses: RefundStatus[]; color: string; icon: any }> = [
  { label: "Soumis", statuses: ["SUBMITTED"], color: "var(--info)", icon: Send },
  { label: "En traitement", statuses: ["PROCESSING"], color: "var(--warning)", icon: Clock },
  { label: "Approuvés", statuses: ["APPROVED", "PAID"], color: "var(--success)", icon: CheckCircle2 },
  { label: "Litiges", statuses: ["DISPUTED", "REJECTED"], color: "var(--danger)", icon: AlertCircle },
];

const STEP_LABELS = ["Facture", "Assuré", "Assurance", "Récapitulatif"];

export default function Refunds() {
  const qc = useQueryClient();
  const [dispute, setDispute] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");

  const { data: refunds = [] } = useQuery({ queryKey: ["refunds"], queryFn: RefundsService.list });
  const { data: companies = [] } = useQuery({ queryKey: ["insurance-companies"], queryFn: InsuranceService.companies });

  const disputeMut = useMutation({
    mutationFn: ({ id, invoiceId, reason }: any) => RefundsService.dispute({ id, invoiceId, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["refunds"] });
      setDispute(null); setReason("");
      toast.success("Litige ouvert");
    },
  });

  const submitMut = useMutation({
    mutationFn: async (data: { invoiceId: string; insuranceData?: { insuranceCompany: string; insuranceNumber: string } }) => {
      return RefundsService.submitRefund(data.invoiceId, data.insuranceData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["refunds"] });
      setWizardOpen(false);
      resetWizard();
      toast.success("Remboursement soumis avec succès");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Erreur lors de la soumission");
    },
  });

  function resetWizard() {
    setStep(0);
    setSelectedInvoice(null);
    setPatientDetails(null);
    setInsuranceCompany("");
    setInsuranceNumber("");
  }

  function handleSelectInvoice(inv: any) {
    setSelectedInvoice(inv);
    setInsuranceCompany(inv.insuranceProvider || inv.insuranceCompany || "");
    setInsuranceNumber(inv.insuranceCardNumber || inv.insuranceNumber || "");
    if (inv.patientId) {
      PatientsService.getById(inv.patientId).then(setPatientDetails).catch(() => {});
    }
    setStep(1);
  }

  const totalAmount = refunds.reduce((s, r) => s + r.amount, 0);
  const pendingAmount = refunds.filter(r => r.status === "SUBMITTED" || r.status === "PENDING" || r.status === "PROCESSING").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Remboursements"
        description="Suivi des demandes soumises à l'assurance via API Gateway"
        actions={<Button onClick={() => setWizardOpen(true)}><Plus className="h-4 w-4" /> Nouveau remboursement</Button>}
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
          { key: "status", label: "Statut", render: r => (
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              <div className="flex items-center gap-0.5">
                {(["SUBMITTED", "PENDING", "PROCESSING", "APPROVED", "PAID"] as const).map((s, i) => {
                  const statusOrder = ["SUBMITTED", "PENDING", "PROCESSING", "APPROVED", "PAID"];
                  const idx = statusOrder.indexOf(r.status as any);
                  const done = idx >= 0 && i <= idx;
                  const isRejected = r.status === "REJECTED" || r.status === "DISPUTED";
                  return (
                    <div key={s} className={`h-1.5 w-1.5 rounded-full ${isRejected ? "bg-rose-300" : done ? "bg-emerald-400" : "bg-slate-200"}`} />
                  );
                })}
              </div>
            </div>
          )},
          { key: "actions", label: "", render: r => r.status === "REJECTED" || r.status === "DISPUTED" ? (
            <Button size="sm" variant="outline" onClick={() => setDispute(r)}><RefreshCw className="h-3 w-3" /> Relancer</Button>
          ) : null },
        ]}
      />

      {/* Nouveau remboursement - Wizard */}
      <Modal open={wizardOpen} onClose={() => { setWizardOpen(false); resetWizard(); }} title="Nouveau remboursement" size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEP_LABELS.map((l, i) => (
                <div key={l} className={`h-1.5 w-1.5 rounded-full ${i <= step ? "bg-brand-500" : "bg-slate-200"}`} />
              ))}
              <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>{STEP_LABELS[step]} ({step + 1}/4)</span>
            </div>
            <div className="flex items-center gap-2">
              {step > 0 && <Button variant="ghost" onClick={() => setStep(s => s - 1)}><ChevronLeft className="h-4 w-4" /> Retour</Button>}
              {step < 3 ? (
                <Button disabled={step === 0 && !selectedInvoice} onClick={() => setStep(s => s + 1)}>
                  Suivant <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => submitMut.mutate({ invoiceId: selectedInvoice.id, insuranceData: { insuranceCompany, insuranceNumber } })} loading={submitMut.isPending}>
                  <Send className="h-4 w-4" /> Transmettre à l'assurance
                </Button>
              )}
            </div>
          </div>
        }
      >
        {step === 0 && <StepSelectInvoice onSelect={handleSelectInvoice} selectedId={selectedInvoice?.id} />}
        {step === 1 && <StepConfirmPatient invoice={selectedInvoice} patientDetails={patientDetails} />}
        {step === 2 && <StepInsurance companies={companies} value={insuranceCompany} onChange={setInsuranceCompany} cardNumber={insuranceNumber} onCardNumberChange={setInsuranceNumber} />}
        {step === 3 && <StepReview invoice={selectedInvoice} patientDetails={patientDetails} insuranceCompany={insuranceCompany} insuranceNumber={insuranceNumber} />}
      </Modal>

      {/* Litige modal */}
      {dispute && (
        <Modal open={!!dispute} onClose={() => setDispute(null)} title="Ouvrir un litige" description={`${dispute.reference} — ${dispute.patientName}`}
          footer={<><Button variant="ghost" onClick={() => setDispute(null)}>Annuler</Button><Button onClick={() => disputeMut.mutate({ id: dispute.insuranceClaimId || dispute.id, invoiceId: dispute.id, reason })} loading={disputeMut.isPending}>Soumettre le litige</Button></>}>
          <div className="space-y-3">
            {dispute.rejectionReason && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 border border-rose-100"><XCircle className="h-4 w-4 inline mr-1" /> Motif rejet : {dispute.rejectionReason}</div>}
            <div><Label required>Motif du litige</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Expliquez pourquoi vous contestez cette décision..." /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Step 1: Sélectionner la facture
function StepSelectInvoice({ onSelect, selectedId }: { onSelect: (inv: any) => void; selectedId?: string }) {
  const { data: invoices = [] } = useQuery({
    queryKey: ["billing-invoices-eligible"],
    queryFn: async () => {
      const raw = await BillingService.listInvoices();
      const items = Array.isArray(raw) ? raw : [];
      return items.filter((i: any) => {
        const s = i.statut ?? i.status;
        return s === "brouillon" || s === "ISSUED";
      });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" style={{ color: "var(--primary)" }} />
        <div>
          <p className="font-semibold text-sm">Sélectionnez une facture</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{invoices.length} facture(s) éligible(s)</p>
        </div>
      </div>
      {invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Aucune facture en brouillon. Créez d'abord une facture dans la page Facturation.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
          {invoices.map((inv: any) => {
            const isSelected = inv._id === selectedId || inv.id === selectedId;
            return (
              <button
                key={inv._id ?? inv.id}
                onClick={() => onSelect({ id: inv._id ?? inv.id, ...inv })}
                className={`w-full text-left rounded-lg border p-3 transition ${isSelected ? "border-brand-500 bg-brand-50" : "border-[var(--border)] hover:border-brand-300"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold">{inv.invoiceNumber}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{inv.patientName}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCurrency(inv.montantTotal ?? 0)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{formatDateTime(inv.createdAt ?? inv.submittedAt)}</span>
                  <span>{inv.actes?.length || 0} acte(s)</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Step 2: Confirmer l'assuré
function StepConfirmPatient({ invoice, patientDetails }: { invoice: any; patientDetails: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5" style={{ color: "var(--primary)" }} />
        <div>
          <p className="font-semibold text-sm">Assuré concerné</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Informations du patient lié à la facture</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Nom complet</p>
              <p className="font-semibold">{invoice?.patientName || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>N° carte d'assurance</p>
              <p className="font-mono text-sm">{patientDetails?.insuranceNumber || invoice?.insuranceNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Assureur</p>
              <p>{patientDetails?.insuranceCompany || invoice?.insuranceCompany || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Tél.</p>
              <p>{patientDetails?.phone || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="rounded-lg bg-[var(--surface-2)] p-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-emerald-600" />
        Ces informations seront transmises à l'assurance pour vérification d'éligibilité.
      </div>
    </div>
  );
}

// Step 3: Assurance partenaire
function StepInsurance({ companies, value, onChange, cardNumber, onCardNumberChange }: {
  companies: any[]; value: string; onChange: (v: string) => void; cardNumber: string; onCardNumberChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5" style={{ color: "var(--primary)" }} />
        <div>
          <p className="font-semibold text-sm">Assurance partenaire</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Compagnie d'assurance et numéro de carte</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <Label>Compagnie d'assurance</Label>
            <Select value={value} onChange={e => onChange(e.target.value)}>
              <option value="">Sélectionner...</option>
              {companies.map((c: any) => (
                <option key={c.id || c.code} value={c.name || c.code}>{c.name || c.code}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>N° carte d'assurance</Label>
            <Input value={cardNumber} onChange={e => onCardNumberChange(e.target.value)} placeholder="Ex: CARD-123456" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 4: Récapitulatif
function StepReview({ invoice, patientDetails, insuranceCompany, insuranceNumber }: {
  invoice: any; patientDetails: any; insuranceCompany: string; insuranceNumber: string;
}) {
  const items = [
    { label: "Facture", value: invoice?.invoiceNumber || "—" },
    { label: "Patient", value: invoice?.patientName || "—" },
    { label: "N° carte assurance", value: insuranceNumber || patientDetails?.insuranceNumber || "—" },
    { label: "Compagnie", value: insuranceCompany || patientDetails?.insuranceCompany || invoice?.insuranceCompany || "—" },
    { label: "Montant total", value: formatCurrency(invoice?.montantTotal ?? 0) },
    { label: "Actes médicaux", value: `${invoice?.actes?.length || 0} acte(s)` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="font-semibold text-sm">Récapitulatif</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Vérifiez les informations avant soumission</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          {items.map(item => (
            <div key={item.label} className="flex items-center justify-between py-1 text-sm">
              <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      {invoice?.actes && invoice.actes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Détail des actes</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Acte</th>
                <th className="text-left py-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Code</th>
                <th className="text-right py-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {invoice.actes.map((a: any, i: number) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  <td className="py-1 text-xs">{a.acte || a.label}</td>
                  <td className="py-1 text-xs font-mono">{a.code}</td>
                  <td className="py-1 text-xs text-right font-semibold">{formatCurrency(a.montant || a.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        <Send className="h-3.5 w-3.5 inline mr-1" />
        En cliquant sur "Transmettre", la demande sera envoyée via Gateway vers l'assurance pour vérification et traitement.
      </div>
    </div>
  );
}
