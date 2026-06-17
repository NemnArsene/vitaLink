import { ShieldCheck, Pill, Stethoscope, Building2, Baby, Glasses, ScanLine, TestTube, Smile, AlertCircle } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/States";
import { useGuarantees } from "../hooks/useApi";
import { formatCurrency } from "../utils/cn";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2, Pill, Stethoscope, Baby, Glasses, ScanLine, TestTube, Smile,
};

function getColorBar(type: string) {
  const map: Record<string, string> = {
    hospitalization: "bg-gradient-to-r from-rose-500 to-rose-600",
    consultation: "bg-gradient-to-r from-brand-500 to-brand-600",
    pharmacy: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    dental: "bg-gradient-to-r from-cyan-500 to-cyan-600",
    optical: "bg-gradient-to-r from-violet-500 to-violet-600",
    maternity: "bg-gradient-to-r from-pink-500 to-pink-600",
    laboratory: "bg-gradient-to-r from-amber-500 to-amber-600",
    imaging: "bg-gradient-to-r from-indigo-500 to-indigo-600",
  };
  return map[type] || "bg-gradient-to-r from-slate-500 to-slate-600";
}

export function Guarantees() {
  const { data: guarantees = [], isLoading } = useGuarantees();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garanties"
        description="Catalogue des garanties et niveaux de couverture"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-48 rounded-xl" />
            ))
          : guarantees.map((g) => {
              const Icon = ICON_MAP[g.icon] || ShieldCheck;
              const usagePercent = (g.usedAmount / g.ceiling) * 100;
              return (
                <Card key={g.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className={`relative h-2 ${getColorBar(g.type)}`} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={g.included ? "success" : "neutral"} dot>
                        {g.included ? "Actif" : "Désactivé"}
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{g.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{g.description}</p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Plafond annuel</span>
                          <span className="font-semibold">{formatCurrency(g.ceiling)}</span>
                        </div>
                        <div className="mt-1.5">
                          <Progress
                            value={usagePercent}
                            variant={usagePercent > 80 ? "warning" : usagePercent > 95 ? "danger" : "brand"}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatCurrency(g.usedAmount)} utilisés ({usagePercent.toFixed(0)}%)
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-900/50">
                        <div>
                          <p className="text-[10px] text-slate-500">Co-paiement</p>
                          <p className="font-semibold">{g.copayPercent}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Carence</p>
                          <p className="font-semibold">{g.waitingDays} jours</p>
                        </div>
                      </div>

                      {g.exclusions.length > 0 && (
                        <div>
                          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <AlertCircle className="h-3 w-3" />
                            Exclusions
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {g.exclusions.map((e, idx) => (
                              <Badge key={idx} variant="danger" size="sm">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}