import { useState } from "react";
import { BarChart3, Download, FileText, FileSpreadsheet, Calendar, Building2, Activity, Receipt, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Input";
import { toast } from "sonner";
import { ReportsService } from "@/services";

const REPORTS = [
  { id: "activity", apiType: "activity", name: "Rapport d'activité mensuel", description: "Nombre de patients, consultations, hospitalisations", icon: Activity, color: "text-sky-600 bg-sky-50" },
  { id: "billing", apiType: "billing", name: "Rapport de facturation", description: "Volume facturé, remboursements, recettes", icon: Receipt, color: "text-amber-600 bg-amber-50" },
  { id: "occupation", apiType: "occupation", name: "Rapport d'occupation", description: "Taux d'occupation par service, durée moyenne séjour", icon: Building2, color: "text-violet-600 bg-violet-50" },
  { id: "finances", apiType: "finances", name: "Rapport financier", description: "Revenus, dépenses, prévisions", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
  { id: "personnel", apiType: "personnel", name: "Rapport du personnel", description: "Effectifs par service et rôle", icon: BarChart3, color: "text-rose-600 bg-rose-50" },
  { id: "consultations", apiType: "consultations", name: "Rapport des consultations", description: "Par médecin, service, type", icon: Calendar, color: "text-indigo-600 bg-indigo-50" },
];

const PERIOD_LABELS: Record<string, string> = {
  today: "Aujourd'hui", week: "Cette semaine", month: "Ce mois",
  quarter: "Ce trimestre", year: "Cette année", custom: "Personnalisée",
};

function getDateRange(period: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  const start = new Date(now);
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    case "week":
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    case "month":
      start.setDate(1); start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    case "quarter":
      start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1); start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    case "year":
      start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    default:
      return {};
  }
}

function flattenStats(obj: any, prefix = ""): [string, string][] {
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const label = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      entries.push(...flattenStats(v, label));
    } else if (Array.isArray(v)) {
      entries.push([label, JSON.stringify(v)]);
    } else {
      entries.push([label, String(v ?? "")]);
    }
  }
  return entries;
}

function generateReportHTML(name: string, period: string, description: string, data: any): string {
  const date = new Date();
  const stats = flattenStats(data?.statistics || data || {});
  const rows = stats.map(([k, v]) =>
    `<tr><td>${k.replace(/_/g, " ")}</td><td>${v}</td></tr>`
  ).join("\n");

  return `
    <html><head><meta charset="utf-8"><title>${name}</title>
    <style>body{font-family:Arial,sans-serif;font-size:13px;padding:40px;color:#222}
    h1{font-size:20px;margin-bottom:4px}.sub{color:#666;font-size:12px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{background:#f5f5f5;padding:8px 12px;text-align:left;border-bottom:2px solid #ddd}
    td{padding:8px 12px;border-bottom:1px solid #eee}
    .footer{margin-top:32px;font-size:10px;color:#999;text-align:center;border-top:1px solid #ddd;padding-top:12px}
    </style></head><body>
    <h1>${name}</h1>
    <div class="sub">Période: ${PERIOD_LABELS[period]} · Généré le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR")}</div>
    <p>${description}</p>
    <table><thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="footer">Document généré par VitaLink · Hôpital Général de Dakar</div>
    </body></html>`;
}

function generateReportCSV(name: string, period: string, data: any): string {
  const date = new Date().toLocaleDateString("fr-FR");
  const stats = flattenStats(data?.statistics || data || {});
  const rows = stats.map(([k, v]) => `${k},${v}`).join("\n");
  return `Rapport,${name}\nPériode,${PERIOD_LABELS[period]}\nDate,${date}\n\nIndicateur,Valeur\n${rows}`;
}

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [loading, setLoading] = useState<string | null>(null);

  const downloadReport = async (report: typeof REPORTS[0]) => {
    setLoading(report.id);
    try {
      const dateRange = getDateRange(period);
      const result = await ReportsService.generate(report.apiType, dateRange.startDate, dateRange.endDate);
      const content = format === "pdf" ? generateReportHTML(report.name, period, report.description, result) : generateReportCSV(report.name, period, result);
      const type = format === "pdf" ? "text/html" : "text/csv";
      const ext = format === "pdf" ? "html" : "csv";
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${report.id}_${period}.${ext}`;
      a.click(); URL.revokeObjectURL(url);
      toast.success(`Rapport "${report.name}" téléchargé (${format.toUpperCase()})`);
    } catch {
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Rapports & Analyses" description="Génération de rapports décisionnels exportables" />

      <Card>
        <CardHeader>
          <CardTitle>Générer un rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-48">
              <Label>Période</Label>
              <Select value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
                <option value="custom">Personnalisée</option>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => setFormat("pdf")} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition ${format === "pdf" ? "border-[var(--primary)] bg-[var(--primary-50)] text-[var(--primary)]" : "border-[var(--border)]"}`}>
                  <FileText className="h-4 w-4" /> PDF
                </button>
                <button onClick={() => setFormat("excel")} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition ${format === "excel" ? "border-[var(--primary)] bg-[var(--primary-50)] text-[var(--primary)]" : "border-[var(--border)]"}`}>
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORTS.map(r => {
              const Icon = r.icon;
              return (
                <button key={r.id} className="card p-4 card-hover text-left" onClick={() => downloadReport(r)} disabled={loading !== null}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${r.color}`}>
                    {loading === r.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="text-sm font-semibold mb-1">{r.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{r.description}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <Download className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Télécharger {format.toUpperCase()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}