import { KeyRound, X, Shield } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ROLES } from "../mocks/faker";

const modules = [
  { id: "insureds", label: "Assurés" },
  { id: "contracts", label: "Contrats" },
  { id: "claims", label: "Remboursements" },
  { id: "hospitals", label: "Hôpitaux" },
  { id: "reports", label: "Rapports" },
  { id: "users", label: "Utilisateurs" },
  { id: "audit", label: "Audit" },
  { id: "settings", label: "Paramètres" },
];

const permissionMatrix: Record<string, Record<string, string[]>> = {
  ROLE_SUPER_ADMIN: Object.fromEntries(modules.map((m) => [m.id, ["*"]])),
  ROLE_INSURANCE_AGENT: {
    insureds: ["read", "write"],
    contracts: ["read", "write"],
    claims: ["read", "write"],
    hospitals: ["read"],
    reports: ["read"],
  },
  ROLE_SUPERVISOR: {
    insureds: ["read", "write"],
    contracts: ["read", "write", "suspend"],
    claims: ["read", "write", "validate", "reject"],
    hospitals: ["read", "write"],
    reports: ["read"],
    users: ["read"],
  },
  ROLE_DIRECTOR: Object.fromEntries(modules.map((m) => [m.id, ["*"]])),
  ROLE_AUDITOR: {
    insureds: ["read"],
    contracts: ["read"],
    claims: ["read"],
    hospitals: ["read"],
    reports: ["read"],
    audit: ["read"],
    users: ["read"],
  },
};

export function RBAC() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="RBAC - Contrôle d'accès"
        description="Gestion des rôles et permissions granulaires"
        icon={<KeyRound className="h-5 w-5" />}
      />

      {/* Roles overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {ROLES.map((role) => (
          <Card key={role.id} className="transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
                  <Shield className="h-5 w-5" />
                </div>
                <Badge variant={role.permissions.includes("*") ? "brand" : "neutral"} size="sm">
                  {role.permissions.includes("*") ? "Tous droits" : `${role.permissions.length} droits`}
                </Badge>
              </div>
              <h3 className="mt-3 text-sm font-bold">{role.label}</h3>
              <p className="mt-1 text-xs text-slate-500">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h3 className="text-base font-bold">Matrice des permissions</h3>
            <p className="mt-0.5 text-xs text-slate-500">Visualisation des droits par rôle et module</p>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                    Rôle / Module
                  </th>
                  {ROLES.map((r) => (
                    <th key={r.id} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono">{r.id.replace("ROLE_", "")}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {modules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-slate-900 dark:bg-slate-900 dark:text-white">
                      {m.label}
                    </td>
                    {ROLES.map((r) => {
                      const perms = permissionMatrix[r.id]?.[m.id] || [];
                      const hasAll = perms.includes("*");
                      const hasNone = perms.length === 0;
                      return (
                        <td key={r.id} className="px-3 py-3 text-center">
                          {hasAll ? (
                            <Badge variant="success" size="sm">Tous</Badge>
                          ) : hasNone ? (
                            <X className="mx-auto h-4 w-4 text-slate-300" />
                          ) : (
                            <div className="flex flex-wrap justify-center gap-1">
                              {perms.map((p) => (
                                <Badge key={p} variant="brand" size="sm">{p}</Badge>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permission legend */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-bold">Légende des permissions</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <LegendItem label="read" description="Lecture seule" />
            <LegendItem label="write" description="Création / modification" />
            <LegendItem label="delete" description="Suppression" />
            <LegendItem label="validate" description="Validation" />
            <LegendItem label="reject" description="Rejet" />
            <LegendItem label="suspend" description="Suspension" />
            <LegendItem label="*" description="Tous les droits" />
            <LegendItem label="audit" description="Logs d'audit" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LegendItem({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900/50">
      <Badge variant="brand" size="sm">{label}</Badge>
      <span className="text-xs text-slate-600 dark:text-slate-400">{description}</span>
    </div>
  );
}