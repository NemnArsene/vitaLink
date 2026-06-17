import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function hashColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = [
    "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-cyan-500",
    "bg-indigo-500", "bg-pink-500", "bg-teal-500", "bg-violet-500",
    "bg-orange-500", "bg-lime-500", "bg-fuchsia-500", "bg-sky-500",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizeClasses[size],
        hashColor(name),
        className
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  info: { icon: Info, bg: "bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/30 dark:border-cyan-900 dark:text-cyan-200" },
  success: { icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200" },
  warning: { icon: AlertCircle, bg: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200" },
  error: { icon: XCircle, bg: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200" },
};

export function Alert({ variant = "info", title, children, icon, onClose, className }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start gap-3 rounded-lg border p-4", config.bg, className)}
      role="alert"
    >
      <div className="shrink-0">{icon || <Icon className="h-5 w-5" />}</div>
      <div className="flex-1 text-sm">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn("text-xs", title && "mt-1")}>{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Fermer">×</button>
      )}
    </motion.div>
  );
}

interface ProgressProps {
  value: number; // 0-100
  variant?: "brand" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  showLabel?: boolean;
}

const progressColors = {
  brand: "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export function Progress({ value, variant = "brand", size = "md", showLabel }: ProgressProps) {
  return (
    <div className="w-full">
      <div className={cn("w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800", size === "sm" ? "h-1.5" : "h-2")}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", progressColors[variant])}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-slate-500">{Math.round(value)}%</p>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("shimmer rounded-md", className)} />;
}