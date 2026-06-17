import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, FileCheck, Building2, Network, CheckCircle2 } from "lucide-react";
import { InsuranceAPI } from "@/api/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export default function Insurance() {
  const { data: companies = [] } = useQuery({ queryKey: ["insurance-companies"], queryFn: InsuranceAPI.companies });
  const { data: contracts = [] } = useQuery({ queryKey: ["insurance-contracts"], queryFn: InsuranceAPI.contracts });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assurances"
        description="Partenaires et contrats connectés via API Gateway"
      />

      {/* Gateway architecture diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Network className="h-4 w-4" /> Architecture d'intégration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
            <div className="rounded-xl border-2 border-[var(--primary)] p-4 w-full md:w-48">
              <Building2 className="h-7 w-7 mx-auto mb-2" style={{ color: "var(--primary)" }} />
              <div className="text-sm font-bold">Hôpital</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>MediCore HMS</div>
            </div>
            <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-[var(--primary)] via-indigo-400 to-violet-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--surface)] border rounded text-[10px] font-semibold" style={{ color: "var(--primary)" }}>HTTPS</div>
            </div>
            <div className="md:hidden">↓</div>
            <div className="rounded-xl border-2 border-indigo-500 bg-indigo-50 p-4 w-full md:w-48">
              <ShieldCheck className="h-7 w-7 mx-auto mb-2 text-indigo-600" />
              <div className="text-sm font-bold">API Gateway</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Secure Router</div>
            </div>
            <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-violet-500 to-emerald-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[var(--surface)] border rounded text-[10px] font-semibold text-violet-600">OAuth2 / JWT</div>
            </div>
            <div className="md:hidden">↓</div>
            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 w-full md:w-48">
              <FileCheck className="h-7 w-7 mx-auto mb-2 text-emerald-600" />
              <div className="text-sm font-bold">Assureurs</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{companies.length} partenaires</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {["Chiffrement TLS 1.3", "Authentification OAuth2", "Webhooks temps réel", "Logs d'audit"].map(f => (
              <div key={f} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {f}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Compagnies partenaires ({companies.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {companies.map(c => (
              <div key={c.id} className="card p-4 card-hover">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-10 w-10 rounded-lg bg-[var(--primary-50)] flex items-center justify-center" style={{ color: "var(--primary)" }}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{c.code}</div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>API</span><span className="font-mono truncate ml-2">{c.apiEndpoint}</span></div>
                  <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Contact</span><span>{c.contactEmail}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contrats actifs</CardTitle></CardHeader>
        <CardContent>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>N° Contrat</th><th>Compagnie</th><th>Début</th><th>Fin</th><th>Taux</th><th>Statut</th></tr></thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.contractNumber}</td>
                    <td className="font-semibold">{c.companyName}</td>
                    <td>{formatDate(c.startDate)}</td>
                    <td>{formatDate(c.endDate)}</td>
                    <td><Badge variant="primary">{c.coverageRate}%</Badge></td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}