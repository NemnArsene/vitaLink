import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus,
  Users, FileText, Building2, Clock, Wallet, CheckCircle2, Timer,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "./Card";
import { cn, formatCurrency, formatNumber, formatPercent } from "../../utils/cn";
import type { DashboardKPI } from "../../types";

interface KpiCardProps {
  kpi: DashboardKPI;
  index?: number;
}

const ICONS: Record<string, LucideIcon> = {
  Users, FileText, Building2, Clock, TrendingUp, Wallet, CheckCircle2, Timer,
};

function formatValue(kpi: DashboardKPI) {
  if (kpi.format === "currency") return formatCurrency(kpi.value);
  if (kpi.format === "percent") return formatPercent(kpi.value);
  return formatNumber(kpi.value);
}

const softColorClasses: Record<DashboardKPI["color"], string> = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400",
};

export function KpiCard({ kpi, index = 0 }: KpiCardProps) {
  const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const trendColor = kpi.trend === "up"
    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30"
    : kpi.trend === "down"
    ? "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/30"
    : "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";

  const Icon = ICONS[kpi.icon] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", softColorClasses[kpi.color])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(kpi.change).toFixed(1)}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatValue(kpi)}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}