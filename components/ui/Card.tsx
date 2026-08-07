import type { HTMLAttributes } from "react";

export type CardTone =
  | "default"
  | "indigo"
  | "emerald"
  | "violet"
  | "sky"
  | "gold"
  | "warn";
export type CardSize = "default" | "compact" | "featured";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  /** Accent surface — a barely-there tint that groups cards by purpose. */
  tone?: CardTone;
  /** Compact surfaces: tighter padding for secondary info. Featured: roomy,
      for the dashboard's centerpieces. */
  size?: CardSize;
}

const TONES: Record<CardTone, string> = {
  default: "",
  indigo: "card-tone-indigo",
  emerald: "card-tone-emerald",
  violet: "card-tone-violet",
  sky: "card-tone-sky",
  gold: "card-tone-gold",
  warn: "card-tone-warn",
};

/**
 * The standard BAMBI surface. In dark mode it becomes a soft glass pane —
 * translucent, blurred over the animated sky — instead of a flat slab.
 */
export function Card({
  hover = false,
  tone = "default",
  size = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "border border-line bg-card shadow-card",
        "dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-[0_12px_40px_-14px_rgb(0_0_0/0.55)] dark:backdrop-blur-[16px]",
        size === "compact"
          ? "rounded-xl p-4"
          : size === "featured"
            ? "rounded-3xl p-6 sm:p-7"
            : "rounded-2xl",
        TONES[tone],
        hover ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
