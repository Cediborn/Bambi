import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Tiny metadata line under the title, e.g. a date or count. */
  meta?: string;
  actions?: ReactNode;
}

/** Page heading block — large display type, quiet subtitle, optional action slot. */
export function PageHeader({ title, subtitle, meta, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {meta ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft/80">{meta}</p>
        ) : null}
        {subtitle ? (
          <p className="max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
