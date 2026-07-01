import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.id);
  const active = value ?? internal;

  const handle = (id: string) => {
    if (onChange) onChange(id);
    setInternal(id);
  };

  return (
    <div className={cn("border-b border-slate-200 dark:border-slate-800", className)}>
      <div className="flex gap-1 overflow-x-auto scrollbar-thin">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handle(t.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 rounded-t-lg",
                isActive
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold",
                  isActive ? "bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>{t.count}</span>
              )}
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600 dark:bg-brand-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}