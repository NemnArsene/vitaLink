import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, LogIn, LogOut, Plus, Pencil, Trash2, Eye, Download, SendHorizonal, Ban, Banknote, Filter } from "lucide-react";
import { AuditAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { AuditLogEntry, AuditAction } from "@/types";

const ACTION_ICONS: Record<AuditAction, typeof Shield> = {
  LOGIN: LogIn, LOGOUT: LogOut,
  CREATE: Plus, UPDATE: Pencil, DELETE: Trash2,
  APPROVE: CheckCircle, REJECT: XCircle, PAY: Banknote,
  SUBMIT: SendHorizonal, DISPUTE: Ban,
  VIEW: Eye, EXPORT: Download,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "info", LOGOUT: "neutral",
  CREATE: "success", UPDATE: "primary", DELETE: "danger",
  APPROVE: "success", REJECT: "danger", PAY: "success",
  SUBMIT: "primary", DISPUTE: "warning",
  VIEW: "neutral", EXPORT: "info",
};

function ActionBadge({ action }: { action: AuditAction }) {
  const Icon = ACTION_ICONS[action] || Shield;
  const color = ACTION_COLORS[action] || "neutral";
  return (
    <Badge variant={color as any} className="gap-1">
      <Icon className="h-3 w-3" />
      {action}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AuditLogEntry["status"] }) {
  const map = {
    SUCCESS: { label: "Succès", variant: "success" as const },
    FAILURE: { label: "Échec", variant: "danger" as const },
    ERROR: { label: "Erreur", variant: "danger" as const },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const { data: logs = [] } = useQuery({ queryKey: ["audit-logs"], queryFn: AuditAPI.list });
  const { data: stats } = useQuery({ queryKey: ["audit-stats"], queryFn: AuditAPI.stats });

  const filtered = useMemo(() => {
    let result = logs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.actorName.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.entityName && l.entityName.toLowerCase().includes(q)) ||
        (l.patientName && l.patientName.toLowerCase().includes(q))
      );
    }
    if (actionFilter) result = result.filter(l => l.action === actionFilter);
    if (entityFilter) result = result.filter(l => l.entity === entityFilter);
    return result;
  }, [logs, search, actionFilter, entityFilter]);

  const actions = useMemo(() => [...new Set(logs.map(l => l.action))], [logs]);
  const entities = useMemo(() => [...new Set(logs.map(l => l.entity))], [logs]);

  const actionOptions = [
    { value: "", label: "Toutes les actions" },
    ...actions.map(a => ({ value: a, label: a })),
  ];

  const entityOptions = [
    { value: "", label: "Tous les modules" },
    ...entities.map(e => ({ value: e, label: e })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'audit"
        description="Traçabilité complète de toutes les opérations système"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Événements totaux</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.successCount || 0}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Succès</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.failureCount || 0}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Échecs / Erreurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(stats?.byAction || {}).length}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Types d'actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                <Input
                  placeholder="Rechercher par acteur, description, patient..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-44">
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              >
                {actionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="w-44">
              <select
                value={entityFilter}
                onChange={e => setEntityFilter(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              >
                {entityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={filtered}
        rowKey={(l: AuditLogEntry) => l.id}
        columns={[
          {
            key: "createdAt", label: "Date", sortable: true,
            render: (l: AuditLogEntry) => (
              <span className="text-xs whitespace-nowrap font-mono">
                {new Date(l.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            ),
          },
          {
            key: "actorName", label: "Acteur", sortable: true,
            render: (l: AuditLogEntry) => (
              <div>
                <div className="text-sm font-medium">{l.actorName}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{l.actorRole.replace("ROLE_", "")}</div>
              </div>
            ),
          },
          {
            key: "action", label: "Action",
            render: (l: AuditLogEntry) => <ActionBadge action={l.action} />,
          },
          {
            key: "entity", label: "Module",
            render: (l: AuditLogEntry) => (
              <Badge variant="neutral" className="capitalize">{l.entity}</Badge>
            ),
          },
          {
            key: "description", label: "Description",
            render: (l: AuditLogEntry) => (
              <div className="max-w-xs">
                <div className="text-sm truncate">{l.description}</div>
                {l.patientName && (
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Patient: {l.patientName}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "status", label: "Statut",
            render: (l: AuditLogEntry) => <StatusBadge status={l.status} />,
          },
          ...(search ? [{
            key: "ip" as const, label: "IP",
            render: (l: AuditLogEntry) => (
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{l.ip || "-"}</span>
            ),
          }] : []),
        ]}
      />
    </div>
  );
}
