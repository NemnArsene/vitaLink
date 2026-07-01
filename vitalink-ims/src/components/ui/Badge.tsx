import { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type Variant = "default" | "brand" | "success" | "warning" | "danger" | "info" | "violet" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
  size?: "sm" | "md";
}

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  info: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const dotColors: Record<Variant, string> = {
  default: "bg-slate-500",
  brand: "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-cyan-500",
  violet: "bg-violet-500",
  neutral: "bg-slate-500",
};

export function Badge({ variant = "default", dot, size = "sm", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}