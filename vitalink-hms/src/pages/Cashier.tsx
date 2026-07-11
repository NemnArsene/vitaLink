import { useState } from "react";
import { Wallet, Printer, CheckCircle2, Clock, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Stat";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "sonner";

type Invoice = { id: string; number: string; patientName: string; total: number; insurance: number; patientShare: number; status: string; paymentStatus: string; issuedAt: string; paidAt?: string; insuranceCompany?: string };
type PaymentMethod = "cash" | "card" | "mobile" | "cheque";

const MOCK_INVOICES: Invoice[] = [
  { id: "inv-1", number: "INV-2026-00142", patientName: "Mariama Cissé", total: 25000, insurance: 17500, patientShare: 7500, status: "ISSUED", paymentStatus: "PENDING_PAYMENT", issuedAt: new Date().toISOString(), insuranceCompany: "NSIA Assurances" },
  { id: "inv-2", number: "INV-2026-00143", patientName: "Ousmane Diallo", total: 15000, insurance: 0, patientShare: 15000, status: "ISSUED", paymentStatus: "PENDING_PAYMENT", issuedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "inv-3", number: "INV-2026-00140", patientName: "Aïcha Ba", total: 45000, insurance: 33750, patientShare: 11250, status: "ISSUED", paymentStatus: "PAIEMENT_VALIDE", issuedAt: new Date(Date.now() - 7200000).toISOString(), paidAt: new Date(Date.now() - 3600000).toISOString(), insuranceCompany: "SUNU Assurances" },
  { id: "inv-4", number: "INV-2026-00138", patientName: "Fatou Ndiaye", total: 8500, insurance: 0, patientShare: 8500, status: "ISSUED", paymentStatus: "PAID", issuedAt: new Date(Date.now() - 14400000).toISOString(), paidAt: new Date(Date.now() - 7200000).toISOString() },
];

function generateReceiptHTML(inv: Invoice, method: PaymentMethod, amount: number): string {
  return `
    <html><head><meta charset="utf-8"><title>Reçu ${inv.number}</title>
    <style>body{font-family:Arial,sans-serif;font-size:13px;padding:40px;color:#222}
    h1{font-size:16px;margin-bottom:4px}h2{font-size:12px;color:#666;margin-bottom:24px}
    .footer{margin-top:32px;font-size:10px;color:#999;text-align:center;border-top:1px solid #ddd;padding-top:12px}
    table{width:100%}td{padding:4px 8px}.total{font-weight:700;font-size:15px}
    </style></head><body>
    <h1>Hôpital Général de Douala</h1>
    <h2>Reçu de paiement · ${inv.number} · ${formatDate(inv.issuedAt)}</h2>
    <table><tr><td><strong>Patient:</strong></td><td>${inv.patientName}</td></tr>
    <tr><td><strong>Montant total:</strong></td><td>${formatCurrency(inv.total)}</td></tr>
    <tr><td><strong>Part assurance:</strong></td><td>${formatCurrency(inv.insurance)}</td></tr>
    <tr class="total"><td><strong>Payé:</strong></td><td>${formatCurrency(amount)}</td></tr>
    <tr><td><strong>Mode:</strong></td><td>${method === "cash" ? "Espèces" : method === "card" ? "Carte" : method === "mobile" ? "Mobile Money" : "Chèque"}</td></tr>
    <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleDateString("fr-FR")}</td></tr></table>
    <div class="footer">Merci de votre confiance · VitaLink · Hôpital Général de Douala</div>
    </body></html>`;
}

function printOrDownloadReceipt(inv: Invoice, method: PaymentMethod, amount: number, action: "print" | "download") {
  const html = generateReceiptHTML(inv, method, amount);
  if (action === "print") {
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  } else {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `recu-${inv.number}.html`;
    a.click(); URL.revokeObjectURL(url);
  }
}

export default function Cashier() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [paymentModal, setPaymentModal] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountReceived, setAmountReceived] = useState(0);

  const processPayment = () => {
    if (!paymentModal) return;
    if (amountReceived <= 0) { toast.error("Montant invalide"); return; }
    if (amountReceived < paymentModal.patientShare) { toast.error("Montant insuffisant"); return; }
    setInvoices(invoices.map(i => i.id === paymentModal.id ? {
      ...i, paymentStatus: "PAID", paidAt: new Date().toISOString(),
    } : i));
    printOrDownloadReceipt(paymentModal, paymentMethod, amountReceived, "print");
    setPaymentModal(null);
    setAmountReceived(0);
    toast.success(`Paiement validé. Reçu imprimé. Monnaie: ${formatCurrency(amountReceived - paymentModal.patientShare)}`);
  };

  const pendingPayments = invoices.filter(i => i.paymentStatus === "PENDING_PAYMENT");
  const todayTotal = invoices.filter(i => i.paymentStatus === "PAID" || i.paymentStatus === "PAIEMENT_VALIDE").reduce((s, i) => s + i.patientShare, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Caisse" description="Encaissement des consultations et impression des factures" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="En attente" value={pendingPayments.length} icon={<Clock className="h-5 w-5" />} color="warning" />
        <StatCard label="Encaissements jour" value={formatCurrency(todayTotal)} icon={<Wallet className="h-5 w-5" />} color="success" />
        <StatCard label="Factures émises" value={invoices.length} icon={<Printer className="h-5 w-5" />} color="info" />
        <StatCard label="Taux encaissement" value={`${invoices.length ? Math.round(invoices.filter(i => i.paymentStatus !== "PENDING_PAYMENT").length / invoices.length * 100) : 0}%`} icon={<CheckCircle2 className="h-5 w-5" />} color="primary" />
      </div>

      <DataTable
        data={invoices}
        searchable
        searchPlaceholder="Rechercher par n° facture, patient..."
        rowKey={(i) => i.id}
        columns={[
          { key: "number", label: "N° Facture", render: (i: Invoice) => <span className="font-mono text-xs font-semibold">{i.number}</span> },
          { key: "patient", label: "Patient", render: (i: Invoice) => (
            <div className="flex items-center gap-2">
              <Avatar name={i.patientName} size="sm" />
              <span className="font-medium">{i.patientName}</span>
            </div>
          )},
          { key: "total", label: "Total", render: (i: Invoice) => <span className="font-semibold">{formatCurrency(i.total)}</span> },
          { key: "patientShare", label: "Part patient", render: (i: Invoice) => <span className="font-semibold text-amber-600">{formatCurrency(i.patientShare)}</span> },
          { key: "paymentStatus", label: "Paiement", render: (i: Invoice) => {
            if (i.paymentStatus === "PAID" || i.paymentStatus === "PAIEMENT_VALIDE") return <Badge variant="success">Payé</Badge>;
            return <Badge variant="warning">En attente</Badge>;
          }},
          { key: "actions", label: "", render: (i: Invoice) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => printOrDownloadReceipt(i, "cash", i.patientShare, "print")}><Printer className="h-3.5 w-3.5" /></Button>
              {i.paymentStatus === "PENDING_PAYMENT" && (
                <Button size="sm" onClick={() => { setPaymentModal(i); setPaymentMethod("cash"); setAmountReceived(i.patientShare); }}><Wallet className="h-3.5 w-3.5" /> Encaisser</Button>
              )}
              {(i.paymentStatus === "PAID" || i.paymentStatus === "PAIEMENT_VALIDE") && (
                <Button size="sm" variant="outline" onClick={() => printOrDownloadReceipt(i, "cash", i.patientShare, "download")}><Download className="h-3.5 w-3.5" /> Reçu</Button>
              )}
            </div>
          )},
        ]}
      />

      {paymentModal && (
        <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="Encaissement" description={`${paymentModal.number} — ${paymentModal.patientName}`}
          footer={<><Button variant="ghost" onClick={() => setPaymentModal(null)}>Annuler</Button><Button onClick={processPayment}><Printer className="h-4 w-4" /> Valider et imprimer</Button></>}>
          <div className="space-y-4">
            <div className="rounded-lg bg-[var(--primary-50)] p-4 border border-teal-100">
              <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Montant à encaisser</div>
              <div className="text-3xl font-bold mt-1">{formatCurrency(paymentModal.patientShare)}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Dont part assurance: {formatCurrency(paymentModal.insurance)}
              </div>
            </div>
            <div><Label>Mode de paiement</Label>
              <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="mobile">Mobile Money (Orange Money / Wave)</option>
                <option value="cheque">Chèque</option>
              </Select>
            </div>
            <div><Label>Montant reçu</Label><Input type="number" value={amountReceived || ""} onChange={e => setAmountReceived(Number(e.target.value))} /></div>
            {amountReceived > paymentModal.patientShare && (
              <div className="text-sm text-green-600 font-semibold">Monnaie à rendre: {formatCurrency(amountReceived - paymentModal.patientShare)}</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
