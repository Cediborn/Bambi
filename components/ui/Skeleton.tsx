import type { CSSProperties } from "react";

/**
 * Skeleton — a quiet, theme-aware loading block.
 *
 * Pure CSS: a soft ink-tinted shape with a single shimmer sweep. Pair it
 * with `rounded-*` to match the surface it replaces (no default radius).
 * The global reduced-motion rules collapse the shimmer to a static block.
 */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div aria-hidden="true" className={`skeleton ${className}`} style={style} />;
}
