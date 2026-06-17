import { Activity as ActivityIcon, Search } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/States";
import { useActivity } from "../hooks/useApi";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const severityVariant: Record<string, "success" | "warning" | "danger" | "info"> = {
  success: "success",
  warning: "warning",
  error: "danger",
  info: "info",
};

const moduleColor: Record<string, string> = {
  claims: "bg-brand-50 text-brand-700",
  insureds: "bg-emerald-50 text-emerald-700",
  contracts: "bg-violet-50 text-violet-700",
  hospitals: "bg-cyan-50 text-cyan-700",
  guarantees: "bg-amber-50 text-amber-700",
  conventions: "bg-pink-50 text-pink-700",
  reports: "bg-indigo-50 text-indigo-700",
  auth: "bg-slate-100 text-slate-700",
};

export function Activity() {
  const { data: activity = [], isLoading } = useActivity();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const modules = Array.from(new Set(activity.map((a) => a.module)));

  const filtered = activity.filter((a) => {
    const matchSearch = !search || `${a.actor} ${a.action}`.toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === "all" || a.severity === severityFilter;
    const matchMod = moduleFilter === "all" || a.module === moduleFilter;
    return matchSearch && matchSev && matchMod;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activité"
        description="Traçabilité complète des actions sur la plateforme"
        icon={<ActivityIcon className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatBox label="Total actions" value={activity.length} color="brand" />
        <StatBox label="Aujourd'hui" value={activity.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length} color="emerald" />
        <StatBox label="Avertissements" value={activity.filter(a => a.severity === "warning").length} color="amber" />
        <StatBox label="Erreurs" value={activity.filter(a => a.severity === "error").length} color="rose" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input placeholder="Rechercher..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} options={[
              { value: "all", label: "Toutes sévérités" },
              { value: "info", label: "Info" },
              { value: "success", label: "Succès" },
              { value: "warning", label: "Avertissement" },
              { value: "error", label: "Erreur" },
            ]} />
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} options={[
              { value: "all", label: "Tous les modules" },
              ...modules.map((m) => ({ value: m, label: m })),
            ]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer h-16 rounded-lg" />)}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                  <Avatar name={log.actor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.actor}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${moduleColor[log.module] || "bg-slate-100"}`}>
                        {log.module}
                      </span>
                      <Badge variant={severityVariant[log.severity]} size="sm" dot>{log.severity}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{log.action}</p>
                    <p className="mt-1 text-[10px] text-slate-500" title={format(new Date(log.timestamp), "dd MMMM yyyy HH:mm:ss", { locale: fr })}>
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    brand: "border-brand-200 bg-brand-50 text-brand-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}