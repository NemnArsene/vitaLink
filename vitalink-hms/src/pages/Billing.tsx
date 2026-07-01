import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, Download, Send, Eye, ShieldCheck, Printer } from "lucide-react";
import { InvoicesAPI, RefundsAPI, PatientsAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Label, Select } from "@/components/ui/Input";
import { usePermission } from "@/hooks/usePermission";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { ACTS_CATALOG } from "@/mocks/seed";

export default function Billing() {
  const qc = useQueryClient();
  const { can } = usePermission();
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [refundOpen, setRefundOpen] = useState<any>(null);

  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: InvoicesAPI.list });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => PatientsAPI.list() });

  const submitRefundMut = useMutation({
    mutationFn: RefundsAPI.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["refunds"] });
      setRefundOpen(null);
      toast.success("Demande de remboursement soumise via API Gateway");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturation"
        description={`${invoices.length} factures · Gestion des parts assurance et patient`}
        actions={can("billing.write") && <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Nouvelle facture</Button>}
      />

      <DataTable
        data={invoices}
        searchable
        searchPlaceholder="Rechercher par n° ou patient..."
        emptyIcon={<Receipt className="h-6 w-6" />}
        emptyTitle="Aucune facture"
        rowKey={(i) => i.id}
        columns={[
          { key: "number", label: "N° Facture", render: i => <span className="font-mono text-xs font-semibold">{i.number}</span> },
          { key: "patientName", label: "Patient", sortable: true },
          { key: "issuedAt", label: "Date", sortable: true, render: i => <span className="text-xs">{formatDate(i.issuedAt)}</span> },
          { key: "insuranceCompany", label: "Assureur", render: i => i.insuranceCompany ? <span className="text-xs">{i.insuranceCompany}</span> : <span style={{ color: "var(--text-subtle)" }}>—</span> },
          { key: "total", label: "Total", render: i => <span className="font-semibold">{formatCurrency(i.total)}</span> },
          { key: "patientShare", label: "Part patient", render: i => <span className="text-xs text-amber-700">{formatCurrency(i.patientShare)}</span> },
          { key: "status", label: "Statut", render: i => <StatusBadge status={i.status} /> },
          { key: "paymentStatus", label: "Paiement", render: i => (
            i.status === "PAID" ? 
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">VALIDÉ</span> : 
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">ATTENTE</span>
          )},
          { key: "actions", label: "", render: i => (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setDetail(i); }} className="btn btn-ghost h-7 w-7 p-0" title="Détails"><Eye className="h-3.5 w-3.5" /></button>
              {i.insuranceCover > 0 && i.status !== "PAID" && can("billing.refund") && (
                <button onClick={(e) => { e.stopPropagation(); setRefundOpen(i); }} className="btn btn-ghost h-7 w-7 p-0" title="Soumettre remboursement"><ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" /></button>
              )}
            </div>
          )},
        ]}
      />

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} patients={patients} onCreated={() => { qc.invalidateQueries({ queryKey: ["invoices"] }); setCreateOpen(false); toast.success("Facture créée"); }} />

      {detail && <InvoiceDetailModal invoice={detail} onClose={() => setDetail(null)} />}
      {refundOpen && (
        <Modal open={!!refundOpen} onClose={() => setRefundOpen(null)} title="Soumettre au remboursement" description={`${refundOpen.number} — ${refundOpen.insuranceCompany}`}
          footer={<>
            <Button variant="ghost" onClick={() => setRefundOpen(null)}>Annuler</Button>
            <Button onClick={() => submitRefundMut.mutate(refundOpen.id)} loading={submitRefundMut.isPending}>
              <Send className="h-4 w-4" /> Transmettre via Gateway
            </Button>
          </>}>
          <div className="space-y-3">
            <div className="rounded-lg bg-[var(--info-50)] p-4 border border-blue-100">
              <div className="text-xs font-semibold mb-1" style={{ color: "var(--info)" }}>Montant à rembourser</div>
              <div className="text-2xl font-bold">{formatCurrency(refundOpen.insuranceCover)}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Cette demande sera transmise à <strong>{refundOpen.insuranceCompany}</strong> via API Gateway sécurisée.
              </div>
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              ✓ Transmission chiffrée · ✓ Référence Gateway unique · ✓ Suivi en temps réel
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function generateInvoiceHTML(invoice: any): string {
  const lines = invoice.lines.map((l: any) =>
    `<tr><td style="padding:6px 12px">${l.description}</td><td style="padding:6px 12px;text-align:right">${l.quantity}</td><td style="padding:6px 12px;text-align:right">${formatCurrency(l.unitPrice)}</td><td style="padding:6px 12px;text-align:right;font-weight:600">${formatCurrency(l.total)}</td></tr>`
  ).join("");
  return `
    <html><head><meta charset="utf-8"><title>${invoice.number}</title>
    <style>body{font-family:Arial,sans-serif;font-size:13px;padding:40px;color:#222}
    h1{font-size:18px;margin-bottom:4px}h2{font-size:13px;color:#666;margin-bottom:30px}
    table{width:100%;border-collapse:collapse}th{background:#f5f5f5;padding:6px 12px;text-align:left}
    .totals td{padding:8px 12px;font-size:14px}.grand{font-weight:700;font-size:15px}
    .footer{margin-top:40px;font-size:11px;color:#999;text-align:center;border-top:1px solid #ddd;padding-top:16px}
    </style></head><body>
    <h1>Hôpital Général de Dakar</h1>
    <h2>Facture ${invoice.number} · ${formatDate(invoice.issuedAt)}</h2>
    <p><strong>Patient:</strong> ${invoice.patientName}</p>
    <p><strong>Assureur:</strong> ${invoice.insuranceCompany || "—"}</p>
    <table><thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">PU</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${lines}</tbody></table>
    <table class="totals"><tr><td style="text-align:right;padding:8px 12px">Sous-total</td><td style="text-align:right;font-weight:600;padding:8px 12px">${formatCurrency(invoice.subtotal)}</td></tr>
    <tr><td style="text-align:right;padding:8px 12px;color:#2563eb">Part assurance</td><td style="text-align:right;font-weight:600;padding:8px 12px;color:#2563eb">-${formatCurrency(invoice.insuranceCover)}</td></tr>
    <tr class="grand"><td style="text-align:right;padding:8px 12px">Reste à charge</td><td style="text-align:right;padding:8px 12px">${formatCurrency(invoice.patientShare)}</td></tr></table>
    <div class="footer">Document généré par VitaLink · Hôpital Général de Dakar</div>
    </body></html>`;
}

function downloadInvoice(invoice: any) {
  const html = generateInvoiceHTML(invoice);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${invoice.number}.html`;
  a.click(); URL.revokeObjectURL(url);
  toast.success("Facture téléchargée");
}

function printInvoice(invoice: any) {
  const html = generateInvoiceHTML(invoice);
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
  toast.success("Facture imprimée");
}

function InvoiceDetailModal({ invoice, onClose }: { invoice: any; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Facture ${invoice.number}`} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Fermer</Button><Button onClick={() => printInvoice(invoice)}><Printer className="h-4 w-4" /> Imprimer</Button><Button onClick={() => downloadInvoice(invoice)}><Download className="h-4 w-4" /> Télécharger</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Patient</Label><div className="font-semibold">{invoice.patientName}</div></div>
          <div><Label>Assureur</Label><div className="font-semibold">{invoice.insuranceCompany || "—"}</div></div>
          <div><Label>Émise le</Label><div>{formatDate(invoice.issuedAt)}</div></div>
          <div><Label>Échéance</Label><div>{formatDate(invoice.dueDate)}</div></div>
        </div>
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Qté</th><th className="px-3 py-2 text-right">PU</th><th className="px-3 py-2 text-right">Total</th></tr>
            </thead>
            <tbody>
              {invoice.lines.map((l: any) => (
                <tr key={l.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2">{l.description}</td>
                  <td className="px-3 py-2 text-right">{l.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(l.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(l.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3} className="px-3 py-2 text-right font-semibold">Sous-total</td><td className="px-3 py-2 text-right">{formatCurrency(invoice.subtotal)}</td></tr>
              <tr style={{ background: "var(--info-50)" }}><td colSpan={3} className="px-3 py-2 text-right font-semibold" style={{ color: "var(--info)" }}>Part assurance</td><td className="px-3 py-2 text-right font-bold" style={{ color: "var(--info)" }}>-{formatCurrency(invoice.insuranceCover)}</td></tr>
              <tr style={{ background: "var(--warning-50)" }}><td colSpan={3} className="px-3 py-2 text-right font-semibold" style={{ color: "var(--warning)" }}>Reste à charge patient</td><td className="px-3 py-2 text-right font-bold" style={{ color: "var(--warning)" }}>{formatCurrency(invoice.patientShare)}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function CreateInvoiceModal({ open, onClose, patients, onCreated }: any) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [selectedActs, setSelectedActs] = useState<string[]>([]);

  useEffect(() => {
    if (patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }
  }, [patients, patientId]);

  const patient = patients.find((p: any) => p.id === patientId);
  const lines = selectedActs.map((actId, idx) => {
    const a = ACTS_CATALOG.find(x => x.id === actId)!;
    return { id: `line-${idx}`, actId, description: a.label, quantity: 1, unitPrice: a.basePrice, total: a.basePrice };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const coverage = patient?.insuranceCompany ? 80 : 0;
  const insuranceCover = Math.round(subtotal * coverage / 100);
  const patientShare = subtotal - insuranceCover;

  const submit = async () => {
    if (!patient || lines.length === 0) {
      toast.error("Sélectionnez un patient et au moins un acte");
      return;
    }
    await InvoicesAPI.create({
      patientId: patient.id, patientName: `${patient.firstName} ${patient.lastName}`,
      lines, subtotal, insuranceCover, patientShare, total: subtotal,
      scope: "CONSULTATION",
      status: "ISSUED", issuedAt: new Date().toISOString(), dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      insuranceCompany: patient.insuranceCompany, insuranceNumber: patient.insuranceNumber,
    });
    onCreated();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle facture" size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={submit}>Générer la facture</Button></>}>
      <div className="space-y-4">
        <div>
          <Label required>Patient</Label>
          <Select value={patientId} onChange={e => setPatientId(e.target.value)}>
            <option value="">Sélectionner…</option>
            {patients.map((p: any) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.insuranceCompany ? `— ${p.insuranceCompany}` : ""}</option>)}
          </Select>
        </div>
        <div>
          <Label>Actes médicaux</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg border border-[var(--border)]">
            {ACTS_CATALOG.map(a => (
              <label key={a.id} className="flex items-center gap-2 p-2 rounded hover:bg-[var(--surface-2)] cursor-pointer text-sm">
                <input type="checkbox" checked={selectedActs.includes(a.id)} onChange={e => setSelectedActs(e.target.checked ? [...selectedActs, a.id] : selectedActs.filter(x => x !== a.id))} />
                <span className="flex-1">{a.label}</span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{formatCurrency(a.basePrice)}</span>
              </label>
            ))}
          </div>
        </div>
        {lines.length > 0 && (
          <div className="rounded-lg bg-[var(--surface-2)] p-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Sous-total</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
            {patient?.insuranceCompany && <div className="flex justify-between" style={{ color: "var(--info)" }}><span>Part assurance ({coverage}%)</span><span className="font-semibold">-{formatCurrency(insuranceCover)}</span></div>}
            <div className="flex justify-between pt-2 border-t border-[var(--border)] font-bold"><span>Part patient</span><span>{formatCurrency(patientShare)}</span></div>
          </div>
        )}
      </div>
    </Modal>
  );
}