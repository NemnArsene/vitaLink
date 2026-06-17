import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions, icon }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300">/</span>}
                <span className={cn(i === breadcrumbs.length - 1 && "font-medium text-slate-700 dark:text-slate-300")}>{b.label}</span>
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}