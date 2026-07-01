import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  ArrowRight, Activity, Receipt, Building2,
  TrendingUp, Users,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { KpiCard } from "../components/ui/KpiCard";
import { Badge } from "../components/ui/Badge";
import { Avatar, Skeleton } from "../components/ui/States";
import { useAuthStore } from "../store";
import { useKPIs, useCharts, useActivity, useClaims, useHospitals, useInsureds } from "../hooks/useApi";
import { formatCurrency, formatNumber } from "../utils/cn";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { BadgeProps } from "../components/ui/Badge";

type Variant = NonNullable<BadgeProps["variant"]>;

const STATUS_COLORS: Record<string, string> = {
  received: "#f59e0b",
  review: "#06b6d4",
  approved: "#10b981",
  rejected: "#ef4444",
  disputed: "#f43f5e",
  paid: "#3b82f6",
};

export function Dashboard() {
  const user = useAuthStore((state) => state.currentUser);
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: charts, isLoading: chartsLoading } = useCharts();
  const { data: activity = [] } = useActivity();
  const { data: claims = [] } = useClaims();
  const { data: hospitals = [] } = useHospitals();
  const { data: insureds = [] } = useInsureds();

  const recentClaims = claims.slice(0, 5);
  const pendingClaims = claims.filter((c) => c.status === "received" || c.status === "under_review");

  const isDirector = user?.role === "ROLE_DIRECTOR";
  const isActuary = user?.role === "ROLE_AUDITOR";

  const getStatusVariant = (status: string): Variant => {
    if (status === "approved" || status === "paid") return "success";
    if (status === "rejected") return "danger";
    if (status === "disputed") return "warning";
    return "brand";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDirector ? "Pilotage Stratégique" : "Tableau de bord"}
        description={isDirector ? "Analyse de la sinistralité et performances réseau" : "Vue d'ensemble de l'activité quotidienne"}
        icon={<Activity className="h-5 w-5" />}
        actions={
          <>
            <Badge variant="success" dot>API Gateway connectée</Badge>
            {(isDirector || isActuary) && (
              <Link to="/reports" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                Analyses avancées
              <ArrowRight className="h-4 w-4" />
            </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : kpis?.map((kpi, i) => <KpiCard key={kpi.label} kpi={kpi} index={i} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Évolution des demandes de remboursement</CardTitle>
              <CardDescription>Demandes reçues et traitées sur 12 mois</CardDescription>
            </div>
            <Badge variant="brand">Mensuel</Badge>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts?.monthlyClaims} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d63ff" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3d63ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#3d63ff" strokeWidth={2.5} fill="url(#colorClaims)" name="Demandes" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Statut des demandes</CardTitle>
              <CardDescription>Répartition en cours</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={charts?.claimsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">
                    {charts?.claimsByStatus.map((entry) => (
                      <Cell key={entry.date} fill={STATUS_COLORS[entry.category || "received"]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 space-y-1.5">
              {charts?.claimsByStatus.map((s) => (
                <div key={s.date} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.category || "received"] }} />
                    <span className="text-slate-700 dark:text-slate-300">{s.date}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenus & Coûts mensuels</CardTitle>
              <CardDescription>Évolution du chiffre d'affaires</CardDescription>
            </div>
            <Badge variant="success" dot>+12.4% YoY</Badge>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={charts?.revenueEvolution} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k€`} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="value" stroke="#3d63ff" strokeWidth={2.5} dot={{ fill: "#3d63ff", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Hôpitaux partenaires</CardTitle>
              <CardDescription>Par volume de demandes traitées</CardDescription>
            </div>
            <Link to="/hospitals" className="text-xs font-medium text-brand-600 hover:underline">Voir tout →</Link>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts?.hospitalRanking} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="value" fill="#3d63ff" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Demandes récentes</CardTitle>
              <CardDescription>Dernières soumissions reçues via l'API Gateway</CardDescription>
            </div>
            <Link to="/claims" className="text-xs font-medium text-brand-600 hover:underline">Voir tout →</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentClaims.map((claim) => {
                const insured = insureds.find((i) => i.id === claim.insuredId);
                const hospital = hospitals.find((h) => h.id === claim.hospitalId);
                return (
                  <div key={claim.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                    <Avatar name={insured ? `${insured.firstName} ${insured.lastName}` : "NA"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {insured ? `${insured.firstName} ${insured.lastName}` : "Assuré inconnu"}
                        </p>
                        <Badge variant={getStatusVariant(claim.status)} size="sm">{claim.status}</Badge>
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {claim.medicalAct} • {hospital?.name || "Hôpital inconnu"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(claim.claimedAmount)}</p>
                      <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(claim.submissionDate), { addSuffix: true, locale: fr })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Journal des actions</CardDescription>
            </div>
            <Link to="/activity" className="text-xs font-medium text-brand-600 hover:underline">Voir →</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {activity.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b border-slate-100 px-5 py-3 last:border-0 dark:border-slate-800">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    log.severity === "success" ? "bg-emerald-500" :
                    log.severity === "warning" ? "bg-amber-500" :
                    log.severity === "error" ? "bg-rose-500" : "bg-cyan-500"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.actor}</span> {log.action}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={Users} label="Nouveaux assurés" value={formatNumber(insureds.filter(i => (Date.now() - new Date(i.joinDate).getTime()) / 86400000 <= 30).length)} color="brand" />
        <StatTile icon={Receipt} label="Demandes à traiter" value={formatNumber(pendingClaims.length)} color="amber" />
        <StatTile icon={Building2} label="Hôpitaux actifs" value={formatNumber(hospitals.filter(h => h.active).length)} color="violet" />
        <StatTile icon={TrendingUp} label="Taux d'approbation" value="78.5%" color="emerald" />
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    brand: "from-brand-500/10 to-brand-500/5 text-brand-600 border-brand-200/50",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/50",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/50",
    violet: "from-violet-500/10 to-violet-500/5 text-violet-600 border-violet-200/50",
  };
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <Icon className="mb-2 h-5 w-5" />
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-0.5 text-2xl font-bold">{value}</p>
    </div>
  );
}