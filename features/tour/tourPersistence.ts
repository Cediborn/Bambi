/**
 * Tour preferences — kept under their own storage key so resetting garden
 * data (or signing in/out) never disturbs them.
 */

export type TourStatus = "never" | "skipped" | "completed" | "active";

export interface TourPrefs {
  status: TourStatus;
  /** Which tour was last run. */
  lastTour?: string;
  completedAt?: string;
}

const KEY = "bambi:tour:v1";

function isStatus(value: unknown): value is TourStatus {
  return value === "never" || value === "skipped" || value === "completed" || value === "active";
}

export function loadTourPrefs(): TourPrefs {
  if (typeof window === "undefined") return { status: "never" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { status: "never" };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { status: "never" };
    const p = parsed as Record<string, unknown>;
    return {
      status: isStatus(p.status) ? p.status : "never",
      lastTour: typeof p.lastTour === "string" ? p.lastTour : undefined,
      completedAt: typeof p.completedAt === "string" ? p.completedAt : undefined,
    };
  } catch {
    return { status: "never" };
  }
}

export function saveTourPrefs(prefs: TourPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable (private mode) — the tour still works, it just
    // won't remember preferences for this session.
  }
}
