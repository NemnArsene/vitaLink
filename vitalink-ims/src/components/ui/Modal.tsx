import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-2xl bg-white shadow-2xl",
              "dark:bg-slate-900 dark:border dark:border-slate-800",
              sizeClasses[size]
            )}
            role="dialog"
            aria-modal
          >
            {(title || description) && (
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <div>
                  {title && <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-1" aria-label="Fermer">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6 scrollbar-thin">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}