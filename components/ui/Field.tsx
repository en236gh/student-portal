import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-sm text-brand-red">{error}</p> : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  auth?: boolean;
};

export function Input({ className, auth = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full text-sm text-ink outline-none transition-colors duration-200 placeholder:text-muted/70",
        auth
          ? "h-11 rounded-none border border-black/20 bg-white px-3 focus:border-ink focus:ring-2 focus:ring-ink/10"
          : "rounded-[10px] border border-black/8 bg-surface-muted px-4 py-3 focus:border-ink/20 focus:bg-white focus:ring-4 focus:ring-ink/5",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-[10px] border border-black/8 bg-surface-muted px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 focus:border-ink/20 focus:bg-white focus:ring-4 focus:ring-ink/5",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[10px] border border-black/8 bg-surface-muted px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 focus:border-ink/20 focus:bg-white focus:ring-4 focus:ring-ink/5",
        className,
      )}
      {...props}
    />
  );
}
