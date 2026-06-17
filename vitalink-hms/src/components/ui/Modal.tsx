import * as React from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-up" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full card overflow-hidden", widths[size])} style={{ boxShadow: "var(--shadow-lg)" }}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-[var(--border)]">
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>}
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--surface-2)] transition" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--surface-2)]">{footer}</div>}
      </div>
    </div>
  );
}