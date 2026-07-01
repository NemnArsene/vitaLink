import { useState } from "react";
import { UserCog, Search, Plus, Mail, MoreVertical } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/States";
import { useUsers } from "../hooks/useApi";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ROLES } from "../mocks/faker";

import type { Variant } from "../components/ui/Badge";

const roleColors: Record<string, Variant> = {
  ROLE_SUPER_ADMIN: "brand",
  ROLE_INSURANCE_AGENT: "info",
  ROLE_SUPERVISOR: "violet",
  ROLE_DIRECTOR: "warning",
  ROLE_AUDITOR: "neutral",
};

export function Users() {
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch = !search || `${u.fullName} ${u.email} ${u.department}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    agents: users.filter((u) => u.role === "ROLE_INSURANCE_AGENT").length,
    supervisors: users.filter((u) => u.role === "ROLE_SUPERVISOR").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des agents, superviseurs et directeurs"
        icon={<UserCog className="h-5 w-5" />}
        actions={<Button icon={<Plus className="h-4 w-4" />}>Nouvel utilisateur</Button>}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total utilisateurs" value={stats.total} color="brand" />
        <Stat label="Actifs" value={stats.active} color="emerald" />
        <Stat label="Agents" value={stats.agents} color="cyan" />
        <Stat label="Superviseurs" value={stats.supervisors} color="violet" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input placeholder="Rechercher..." icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={[
              { value: "all", label: "Tous les rôles" },
              ...ROLES.map((r) => ({ value: r.id, label: r.label })),
            ]} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer h-44 rounded-xl" />) :
          filtered.map((u) => (
            <Card key={u.id} className="transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} size="lg" />
                    <div>
                      <p className="font-bold">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.department}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700" aria-label="Plus d'options">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{u.email}</p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={roleColors[u.role]} size="sm">{u.role.replace("ROLE_", "").replace(/_/g, " ")}</Badge>
                  <Badge variant={u.active ? "success" : "neutral"} size="sm" dot>{u.active ? "actif" : "inactif"}</Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500 dark:border-slate-800">
                  <span>Dernière connexion</span>
                  <span className="font-semibold">{formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true, locale: fr })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    brand: "border-brand-200 bg-brand-50 text-brand-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}