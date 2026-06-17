import { cn } from "@/utils/cn";

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 h-12 w-12 rounded-full flex items-center justify-center bg-[var(--surface-2)]">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)} role="status" aria-label="Loading" />
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}