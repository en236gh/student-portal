import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  success: "bg-brand-green/10 text-brand-green",
  warning: "bg-brand-gold/15 text-amber-800",
  danger: "bg-brand-red/10 text-brand-red",
  info: "bg-slate-900/5 text-ink",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
