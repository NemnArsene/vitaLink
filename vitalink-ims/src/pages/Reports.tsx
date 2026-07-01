import { BarChart3, Download, FileSpreadsheet, FileText, Calendar, TrendingUp } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useCharts } from "../hooks/useApi";
import { formatCurrency } from "../utils/cn";

export function Reports() {
  const { data: charts, isLoading } = useCharts();

  const performanceData = [
    { subject: "Hospitalisation", A: 95, B: 78 },
    { subject: "Consultation", A: 88, B: 92 },
    { subject: "Pharmacie", A: 76, B: 85 },
    { subject: "Dentaire", A: 82, B: 70 },
    { subject: "Optique", A: 68, B: 75 },
    { subject: "Maternité", A: 90, B: 88 },
  ];

  const reports = [
    { name: "Rapport mensuel - Sinistralité", type: "PDF", date: "01/11/2025", size: "2.4 MB" },
    { name: "Export Excel - Assurés actifs", type: "XLSX", date: "01/11/2025", size: "850 KB" },
    { name: "Rapport trimestriel - Conventions", type: "PDF", date: "30/09/2025", size: "4.1 MB" },
    { name: "Export hôpitaux partenaires", type: "CSV", date: "28/10/2025", size: "120 KB" },
    { name: "Audit RBAC Q3", type: "PDF", date: "30/09/2025", size: "1.8 MB" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporting & Analytics"
        description="Tableaux de bord, KPIs et exports"
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" icon={<Calendar className="h-4 w-4" />}>Période</Button>
            <Button icon={<Download className="h-4 w-4" />}>Exporter</Button>
          </>
        }
      />

      {/* KPIs synthétiques */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des encaissements</CardTitle>
            <CardDescription>12 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="shimmer h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={charts?.revenueEvolution}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d63ff" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3d63ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k€`} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="value" stroke="#3d63ff" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance par garantie</CardTitle>
            <CardDescription>Satisfaction vs délai</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Radar name="Satisfaction" dataKey="A" stroke="#3d63ff" fill="#3d63ff" fillOpacity={0.3} />
                <Radar name="Rapidité" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition actes</CardTitle>
            <CardDescription>Volume par type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="shimmer h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts?.claimsByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#3d63ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available reports */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Rapports disponibles</CardTitle>
            <CardDescription>Téléchargez les rapports générés automatiquement</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  r.type === "PDF" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                }`}>
                  {r.type === "PDF" ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.date} • {r.size}</p>
                </div>
                <Badge variant={r.type === "PDF" ? "danger" : "success"}>{r.type}</Badge>
                <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>Télécharger</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickStat label="Croissance YTD" value="+18.5%" trend="up" color="emerald" />
        <QuickStat label="Taux de rétention" value="92.4%" trend="up" color="emerald" />
        <QuickStat label="Coût moyen / assuré" value="186€" trend="down" color="amber" />
        <QuickStat label="NPS clients" value="68" trend="up" color="brand" />
      </div>
    </div>
  );
}

function QuickStat({ label, value, trend, color }: { label: string; value: string; trend: "up" | "down"; color: string }) {
  const colors: Record<string, string> = {
    brand: "from-brand-500/10 to-brand-500/5 text-brand-600 border-brand-200/50",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/50",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/50",
  };
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium opacity-80">{label}</p>
        <TrendingUp className={`h-4 w-4 ${trend === "down" ? "rotate-180" : ""}`} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}