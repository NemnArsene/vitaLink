import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
            "placeholder:text-slate-400",
            "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800",
            icon && "pl-10",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
          "placeholder:text-slate-400",
          "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          error && "border-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
          "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          error && "border-rose-500",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";