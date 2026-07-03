import { useQuery } from "@tanstack/react-query";
import { Activity, FlaskConical, ScanLine, Stethoscope } from "lucide-react";
import { ActsService } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/format";

const TYPE_ICON = { CARE: Stethoscope, EXAM: Activity, IMAGING: ScanLine, LAB: FlaskConical };
const TYPE_COLOR: Record<string, "info" | "warning" | "primary" | "success"> = { CARE: "success", EXAM: "primary", IMAGING: "info", LAB: "warning" };

export default function Acts() {
  const { data: acts = [] } = useQuery({ queryKey: ["acts"], queryFn: ActsService.list });

  const stats = {
    CARE: acts.filter(a => a.type === "CARE").length,
    EXAM: acts.filter(a => a.type === "EXAM").length,
    IMAGING: acts.filter(a => a.type === "IMAGING").length,
    LAB: acts.filter(a => a.type === "LAB").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actes médicaux"
        description={`${acts.length} actes réalisés · Soins, examens, imagerie, laboratoire`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([type, count]) => {
          const Icon = TYPE_ICON[type as keyof typeof TYPE_ICON];
          return (
            <div key={type} className="card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--primary-50)", color: "var(--primary)" }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{type}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            </div>
          );
        })}
      </div>

      <DataTable
        data={acts}
        searchable
        searchPlaceholder="Rechercher un acte..."
        emptyIcon={<Activity className="h-6 w-6" />}
        emptyTitle="Aucun acte médical"
        rowKey={(a) => a.id}
        columns={[
          { key: "code", label: "Code", width: "120px", render: a => <span className="font-mono text-xs">{a.code}</span> },
          { key: "label", label: "Acte", sortable: true },
          { key: "type", label: "Type", render: a => <Badge variant={TYPE_COLOR[a.type]}>{a.type}</Badge> },
          { key: "performedBy", label: "Réalisé par" },
          { key: "performedAt", label: "Date", sortable: true, render: a => <span className="text-xs">{formatDateTime(a.performedAt)}</span> },
          { key: "cost", label: "Coût", render: a => <span className="font-semibold">{formatCurrency(a.cost)}</span> },
          { key: "status", label: "Statut", render: a => <StatusBadge status={a.status} /> },
        ]}
      />
    </div>
  );
}