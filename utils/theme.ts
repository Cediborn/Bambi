import type { AccentKey } from "@/types";

/**
 * Accent palette — the user's chosen personality color. The primary drives
 * actions, focus, and highlights across the whole interface; the secondary
 * is its soft partner. Applied at runtime via CSS variables (see AppProvider).
 */
export const ACCENTS: Record<AccentKey, { primary: string; secondary: string; label: string }> = {
  violet: { primary: "#8B5CF6", secondary: "#A78BFA", label: "Violet" },
  emerald: { primary: "#22C55E", secondary: "#4ADE80", label: "Emerald" },
  sky: { primary: "#3B82F6", secondary: "#60A5FA", label: "Sky" },
  tangerine: { primary: "#FB923C", secondary: "#FDBA74", label: "Ember" },
  gold: { primary: "#FACC15", secondary: "#FDE047", label: "Gold" },
  rose: { primary: "#F472B6", secondary: "#F9A8D4", label: "Rose" },
};

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

/** Apply the accent to the document root so every utility referencing
    `var(--color-brand)` picks it up (overrides the @theme default). */
export function applyAccent(accent: AccentKey): void {
  if (typeof document === "undefined") return;
  const a = ACCENTS[accent];
  const root = document.documentElement;
  root.style.setProperty("--color-brand", a.primary);
  root.style.setProperty("--color-brand-2", a.secondary);
}
