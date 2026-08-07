"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
}

/* iOS-style frosted glass: translucent fill + backdrop blur + a 1px light
   border + a bright 1px inner top highlight (the classic glass edge).
   Light mode = bright frost over the cream paper; dark mode = deeper tint. */
const VARIANTS: Record<Variant, string> = {
  primary:
    "border bg-white/55 text-ink border-white/80 backdrop-blur-xl " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_10px_24px_-12px_rgb(56_44_24/0.35)] " +
    "hover:bg-white/75 hover:-translate-y-0.5 " +
    "dark:bg-brand/30 dark:text-white dark:border-white/15 " +
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_24px_-10px_rgb(0_0_0/0.5)] " +
    "dark:hover:bg-brand/45",
  secondary:
    "border bg-white/50 text-ink border-white/80 backdrop-blur-xl " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] " +
    "hover:bg-white/70 hover:-translate-y-0.5 " +
    "dark:bg-white/[0.08] dark:border-white/15 " +
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] " +
    "dark:hover:bg-white/[0.14] dark:hover:border-white/25",
  ghost:
    "text-ink-soft backdrop-blur-xl hover:bg-white/10 hover:text-ink dark:hover:bg-white/10",
  danger:
    "border bg-white/50 text-bad border-white/80 backdrop-blur-xl " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] " +
    "hover:bg-white/70 hover:-translate-y-0.5 " +
    "dark:bg-bad/15 dark:border-bad/30 " +
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] " +
    "dark:hover:bg-bad/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-sm",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
};

/**
 * The exact class set a `Button` renders — exported so a `Link` (or any
 * element) can wear the same glass styles without duplicating them.
 */
export function buttonClasses(variant: Variant = "primary", size: Size = "md"): string {
  return [
    "inline-flex items-center justify-center rounded-xl font-semibold",
    "transition-all duration-200 ease-out",
    "active:translate-y-0 active:scale-[0.97]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        buttonClasses(variant, size),
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
