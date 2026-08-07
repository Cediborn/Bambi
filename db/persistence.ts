import type { AppState, Settings, Theme } from "@/types";
import { initialState } from "./appState";

/**
 * localStorage adapter for app state.
 * Swap target note: when a backend arrives, this module is replaced by
 * remote read/write calls — the reducer and UI stay the same.
 */

const STATE_KEY = "bambi:state:v1";
const THEME_KEY = "bambi:theme";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Coerce unknown settings into a complete Settings object (defaults win). */
function sanitizeSettings(raw: unknown): Settings {
  const base = initialState().settings;
  if (!isRecord(raw)) return base;
  const s = raw;
  const theme: Theme = s.theme === "dark" || s.theme === "light" ? s.theme : base.theme;
  return {
    theme,
    accent:
      s.accent === "violet" || s.accent === "emerald" || s.accent === "sky" ||
      s.accent === "tangerine" || s.accent === "gold" || s.accent === "rose"
        ? s.accent
        : base.accent,
    animatedBackground: typeof s.animatedBackground === "boolean" ? s.animatedBackground : base.animatedBackground,
    starDensity:
      s.starDensity === "low" || s.starDensity === "medium" || s.starDensity === "high"
        ? s.starDensity
        : base.starDensity,
    particles: typeof s.particles === "boolean" ? s.particles : base.particles,
    reduceMotion: typeof s.reduceMotion === "boolean" ? s.reduceMotion : base.reduceMotion,
    compactMode: typeof s.compactMode === "boolean" ? s.compactMode : base.compactMode,
    sounds: typeof s.sounds === "boolean" ? s.sounds : base.sounds,
  };
}

/**
 * Build a complete, safe state from a plain object — tolerant of missing,
 * old or corrupt fields so data from a previous version never crashes.
 */
function sanitizeState(parsed: Record<string, unknown>): AppState {
  const base = initialState();
  return {
    profile: isRecord(parsed.profile)
      ? {
          name: typeof parsed.profile.name === "string" ? parsed.profile.name : "",
          avatar: typeof parsed.profile.avatar === "string" ? parsed.profile.avatar : "fawn",
          interests: Array.isArray(parsed.profile.interests)
            ? (parsed.profile.interests as string[]).filter((i) => typeof i === "string")
            : [],
          onboardedAt:
            typeof parsed.profile.onboardedAt === "string" ? parsed.profile.onboardedAt : "",
        }
      : base.profile,
    habits: Array.isArray(parsed.habits) ? (parsed.habits as AppState["habits"]) : [],
    completions: isRecord(parsed.completions)
      ? (parsed.completions as Record<string, string[]>)
      : {},
    journal: Array.isArray(parsed.journal) ? (parsed.journal as AppState["journal"]) : [],
    questsDone: Array.isArray(parsed.questsDone)
      ? (parsed.questsDone as string[]).filter((d) => typeof d === "string")
      : [],
    tendedDates: Array.isArray(parsed.tendedDates)
      ? (parsed.tendedDates as string[]).filter((d) => typeof d === "string")
      : [],
    freezeUsed: isRecord(parsed.freezeUsed)
      ? Object.fromEntries(
          Object.entries(parsed.freezeUsed).map(([habitId, dates]) => [
            habitId,
            Array.isArray(dates)
              ? (dates as string[]).filter((d) => typeof d === "string")
              : [],
          ])
        )
      : {},
    focus: Array.isArray(parsed.focus) ? (parsed.focus as AppState["focus"]) : [],
    challenges: Array.isArray(parsed.challenges)
      ? (parsed.challenges as AppState["challenges"])
      : [],
    vision: Array.isArray(parsed.vision) ? (parsed.vision as AppState["vision"]) : [],
    reflections: Array.isArray(parsed.reflections)
      ? (parsed.reflections as AppState["reflections"])
      : [],
    settings: sanitizeSettings(parsed.settings),
  };
}

/** Load persisted state, merging over defaults so old/corrupt data never crashes. */
export function loadState(): AppState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return initialState();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return initialState();
    return sanitizeState(parsed);
  } catch {
    return initialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (private mode) — the app still works in-memory.
  }
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function writeStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // non-fatal
  }
}

/* ---------- Export / import ---------- */

/** Serialize the current state to a downloadable JSON string. */
export function exportState(state: AppState): string {
  return JSON.stringify(
    {
      app: "bambi",
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2
  );
}

/**
 * Validate and apply an imported state blob. Returns an error string on
 * failure, or the parsed state on success.
 */
export function importState(raw: string): { ok: true; state: AppState } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { ok: false, error: "That file doesn't look like a BAMBI backup." };
    if (parsed.app !== "bambi") return { ok: false, error: "That file doesn't look like a BAMBI backup." };
    if (!isRecord(parsed.state)) return { ok: false, error: "The backup is missing its data." };
    return { ok: true, state: sanitizeState(parsed.state) };
  } catch {
    return { ok: false, error: "That file couldn't be read. Is it valid JSON?" };
  }
}
