import type { ReactNode } from "react";
import { Card } from "./Card";

interface EmptyStateProps {
  icon?: ReactNode;
  /** Renders a tiny garden scene (seed or sprout) instead of the icon. */
  illustration?: "seed" | "sprout";
  title: string;
  description: string;
  action?: ReactNode;
}

/** A small hand-drawn sprout scene — every forest starts with one seed. */
function SeedArt({ stage }: { stage: "seed" | "sprout" }) {
  return (
    <svg viewBox="0 0 64 64" className="h-20 w-20" role="img" aria-label="A small sprout">
      <ellipse cx="32" cy="50" rx="20" ry="4.5" fill="color-mix(in srgb, var(--color-mint) 20%, transparent)" />
      <ellipse cx="32" cy="49" rx="20" ry="4" fill="color-mix(in srgb, var(--color-mint) 14%, transparent)" />
      {stage === "seed" ? (
        <ellipse cx="32" cy="45" rx="5" ry="6.5" fill="#8a6a45" />
      ) : (
        <>
          <path d="M32 49 V34" stroke="#5b7a3f" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="26" cy="32" rx="7" ry="3.5" fill="#37a86c" transform="rotate(-28 26 32)" />
          <ellipse cx="38" cy="32" rx="7" ry="3.5" fill="#45bd7d" transform="rotate(28 38 32)" />
        </>
      )}
    </svg>
  );
}

export function EmptyState({ icon, illustration, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      {illustration ? (
        <div className="flex size-20 items-center justify-center rounded-full bg-mint/[0.08]">
          <SeedArt stage={illustration} />
        </div>
      ) : (
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          {icon}
        </span>
      )}
      <div className="space-y-1.5">
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
      {action}
    </Card>
  );
}
