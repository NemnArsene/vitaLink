import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Receipt, Banknote, TrendingUp, BedDouble, Activity, AlertCircle, Calendar, Building2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { DashboardAPI } from "@/api/client";
import { StatCard } from "@/components/ui/Stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { HOSPITAL, MEDICAL_SERVICES } from "@/mocks/seed";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PageSpinner } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { Link } from "react-router-dom";

const PIE_COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#ec4899"];

export default function Dashboard() {
  const user = useAuthStore(s => s.user);

  const { data: kpi, isLoading } = useQuery({ queryKey: ["kpi"], queryFn: DashboardAPI.kpi });
  const { data: revenue } = useQuery({ queryKey: ["revenue"], queryFn: DashboardAPI.revenue });
  const { data: occupancy } = useQuery({ queryKey: ["occupancy"], queryFn: DashboardAPI.occupancy });

  if (isLoading || !kpi) return <PageSpinner />;

  const insuranceDistribution = [
    { name: "NSIA Assurances", value: 32 },
    { name: "SUNU Assurances", value: 24 },
    { name: "AXA Afrique", value: 18 },
    { name: "CNSS Sénégal", value: 14 },
    { name: "Allianz Africa", value: 12 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user?.firstName ?? "—"} 👋`}
        description="Voici l'état de votre hôpital aujourd'hui — Mercredi 18 février 2026"
        actions={
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <span className="font-medium">{HOSPITAL.name}</span>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Patients" value={formatNumber(kpi.totalPatients)} icon={<Users className="h-5 w-5" />} trend={kpi.trends.patients} trendLabel="ce mois" color="primary" />
        <StatCard label="Admissions" value={kpi.todayAdmissions} icon={<UserPlus className="h-5 w-5" />} trend={kpi.trends.admissions} trendLabel="aujourd'hui" color="info" />
        <StatCard label="Factures en attente" value={kpi.pendingInvoices} icon={<Receipt className="h-5 w-5" />} trend={kpi.trends.invoices} trendLabel="vs mois-1" color="warning" />
        <StatCard label="Remboursements" value={kpi.pendingRefunds} icon={<Banknote className="h-5 w-5" />} trend={kpi.trends.refunds} trendLabel="en cours" color="warning" />
        <StatCard label="Revenus" value={formatCurrency(kpi.monthlyRevenue)} icon={<TrendingUp className="h-5 w-5" />} trend={kpi.trends.revenue} trendLabel="janvier" color="success" />
        <StatCard label="Occupation" value={`${kpi.bedOccupancyRate}%`} icon={<BedDouble className="h-5 w-5" />} trend={kpi.trends.occupancy} trendLabel="lits" color="primary" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Évolution financière</CardTitle>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Revenus, remboursements et net sur 8 mois</p>
            </div>
            <Badge variant="primary">Mensuel</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ref" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `${v / 1000000}M`} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#rev)" name="Revenus" />
                  <Area type="monotone" dataKey="refunds" stroke="#f59e0b" strokeWidth={2} fill="url(#ref)" name="Remboursements" />
                  <Area type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} fill="url(#net)" name="Net" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition assureurs</CardTitle>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Volume par partenaire</p>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={insuranceDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                    {insuranceDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {insuranceDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span>{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Occupation par service</CardTitle>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{HOSPITAL.totalBeds - HOSPITAL.availableBeds} lits occupés sur {HOSPITAL.totalBeds}</p>
            </div>
            <Link to="/consultations" className="text-xs font-medium" style={{ color: "var(--primary)" }}>Voir détails →</Link>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="service" stroke="var(--text-muted)" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v) => `${v}%`} />
                  <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                    {occupancy?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Flux temps réel</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Dr. Mamadou Sow", action: "a terminé une consultation", target: "Aïssatou Diallo", time: "il y a 2 min", icon: Activity, color: "text-emerald-600" },
              { name: "Fatou Ndiaye", action: "a soumis un remboursement", target: "INV-2025-00142", time: "il y a 12 min", icon: Banknote, color: "text-amber-600" },
              { name: "NSIA Assurances", action: "a approuvé un dossier", target: "REF-A8B3C9D", time: "il y a 28 min", icon: AlertCircle, color: "text-sky-600" },
              { name: "Cheikh Fall", action: "a créé un nouveau patient", target: "P-20240985", time: "il y a 1 h", icon: UserPlus, color: "text-violet-600" },
              { name: "Dr. Awa Mbaye", action: "a planifié une intervention", target: "Mariama Cissé", time: "il y a 2 h", icon: Calendar, color: "text-rose-600" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <Avatar name={a.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">
                    <span className="font-semibold">{a.name}</span>{" "}
                    <span style={{ color: "var(--text-muted)" }}>{a.action}</span>{" "}
                    <span className={`font-medium ${a.color}`}>{a.target}</span>
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-subtle)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services médicaux</CardTitle>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{MEDICAL_SERVICES.length} services actifs</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {MEDICAL_SERVICES.map(s => (
              <div key={s.id} className="rounded-xl border border-[var(--border)] p-3 hover:border-[var(--primary)] transition cursor-pointer">
                <div className="h-9 w-9 rounded-lg bg-[var(--primary-50)] flex items-center justify-center mb-2" style={{ color: "var(--primary)" }}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold truncate">{s.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.code}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${Math.random() * 60 + 30}%` }} />
                  </div>
                  <span className="text-[10px] font-medium">{s.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}