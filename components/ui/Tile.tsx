import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

type Accent = "default" | "gold" | "green" | "red" | "ink";

const accents: Record<Accent, string> = {
  default: "hover:border-black/10",
  gold: "hover:border-brand-gold/50",
  green: "hover:border-brand-green/40",
  red: "hover:border-brand-red/40",
  ink: "hover:border-ink/30",
};

type TileProps = {
  title: string;
  value?: string | number;
  helper?: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: Accent;
  href?: string;
  onClick?: () => void;
  wash?: string;
  className?: string;
  children?: ReactNode;
};

export function Tile({
  title,
  value,
  helper,
  subtitle,
  icon,
  accent = "default",
  href,
  onClick,
  wash,
  className,
  children,
}: TileProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
            {icon}
          </div>
        ) : (
          <span />
        )}
        {subtitle ? (
          <span className="rounded-[10px] bg-surface-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {subtitle}
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <p className="text-sm text-muted">{title}</p>
        {value !== undefined ? (
          <p className="mt-1 text-4xl font-bold tracking-tight text-ink tabular-nums md:text-5xl">
            {value}
          </p>
        ) : null}
        {helper ? <p className="mt-2 text-sm text-muted">{helper}</p> : null}
        {children}
      </div>
    </>
  );

  const classes = cn(
    "flex min-h-[160px] flex-col rounded-[10px] border border-transparent bg-white p-6 panel-shadow transition-colors duration-200",
    accents[accent],
    wash,
    (href || onClick) && "cursor-pointer",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, "text-left")}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
