import type { AppState, Theme } from "@/types";
import { initialState } from "./appState";
import { parseState } from "./schema";
import { migrateBackup, BACKUP_VERSION } from "./migrations";
import { defaultStorage, type StorageAdapter } from "./storage";

/**
 * localStorage adapter for app state.
 * Swap target note: when a backend arrives, this module is replaced by
 * remote read/write calls — the reducer and UI stay the same. All reads go
 * through `parseState` (see db/schema.ts) so corrupt or imported data can
 * never crash the app or poison the store.
 */

export const STATE_KEY = "bambi:state:v1";
const THEME_KEY = "bambi:theme";

/** Load persisted state, validating and normalizing it against the schema. */
export function loadState(storage: StorageAdapter = defaultStorage): AppState {
  try {
    const raw = storage.getItem(STATE_KEY);
    if (!raw) return initialState();
    return parseState(JSON.parse(raw));
  } catch {
    // Corrupted JSON or an unavailable storage — start fresh, never crash.
    return initialState();
  }
}

/** Persist the current state. Silently tolerates quota/availability errors. */
export function saveState(state: AppState, storage: StorageAdapter = defaultStorage): void {
  try {
    storage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (private mode) — the app still works in-memory.
  }
}

export function readStoredTheme(storage: StorageAdapter = defaultStorage): Theme {
  try {
    return storage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function writeStoredTheme(theme: Theme, storage: StorageAdapter = defaultStorage): void {
  try {
    storage.setItem(THEME_KEY, theme);
  } catch {
    // Non-fatal.
  }
}

/* ---------- Export / import ---------- */

/** Serialize the current state to a downloadable JSON string. */
export function exportState(state: AppState): string {
  return JSON.stringify(
    {
      app: "bambi",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2
  );
}

/**
 * Validate, migrate and apply an imported state blob. Returns an error
 * string on failure, or the parsed state on success.
 */
export function importState(raw: string): { ok: true; state: AppState } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    const migrated = migrateBackup(parsed);
    if (!migrated.ok) return { ok: false, error: migrated.error };
    return { ok: true, state: parseState(migrated.state) };
  } catch {
    return { ok: false, error: "That file couldn't be read. Is it valid JSON?" };
  }
}
