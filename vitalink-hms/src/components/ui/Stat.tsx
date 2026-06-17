import * as React from "react";
import { cn } from "@/utils/cn";

export function StatCard({
  label, value, icon, trend, trendLabel, color = "primary",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: "primary" | "info" | "warning" | "danger" | "success";
}) {
  const tints = {
    primary: { bg: "var(--primary-50)", fg: "var(--primary-700)" },
    info: { bg: "var(--info-50)", fg: "var(--info)" },
    warning: { bg: "var(--warning-50)", fg: "var(--warning)" },
    danger: { bg: "var(--danger-50)", fg: "var(--danger)" },
    success: { bg: "var(--success-50)", fg: "var(--success)" },
  }[color];

  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                trend >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
              </span>
              {trendLabel && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{trendLabel}</span>}
            </div>
          )}
        </div>
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center"
          style={{ background: tints.bg, color: tints.fg }}
        >
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10" style={{ background: tints.fg }} />
    </div>
  );
}