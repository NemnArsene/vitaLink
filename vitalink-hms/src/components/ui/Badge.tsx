import * as React from "react";
import { cn } from "@/utils/cn";

type Variant = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

export function Badge({ variant = "neutral", className, children, dot }: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  const cls = {
    neutral: "badge-neutral",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
    primary: "badge-primary",
  }[variant];

  return (
    <span className={cn("badge", cls, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    ACTIVE: "success", INACTIVE: "neutral", DECEASED: "danger",
    PAID: "success", ISSUED: "info", PARTIALLY_PAID: "warning", OVERDUE: "danger", CANCELLED: "neutral", DRAFT: "neutral",
    SUBMITTED: "info", PROCESSING: "warning", APPROVED: "primary", REJECTED: "danger", DISPUTED: "warning",
    SCHEDULED: "info", IN_PROGRESS: "warning", COMPLETED: "success",
    MILD: "info", MODERATE: "warning", SEVERE: "danger",
    RESOLVED: "success", CHRONIC: "warning",
    PENDING: "warning",
    EXPIRED: "danger",
  };
  return <Badge variant={map[status] || "neutral"} dot>{status.replace(/_/g, " ")}</Badge>;
}