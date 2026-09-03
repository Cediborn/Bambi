import type { AuthState } from "@/types";
import { defaultStorage, type StorageAdapter } from "@/db/storage";

/**
 * Persisted auth identity — kept apart from app data (see `bambi:state`)
 * so signing in or out never touches the garden itself. Reads/writes go
 * through the shared StorageAdapter boundary (see db/storage.ts).
 */
const AUTH_KEY = "bambi:auth";

export function loadAuth(storage: StorageAdapter = defaultStorage): AuthState {
  try {
    const raw = storage.getItem(AUTH_KEY);
    if (!raw) return { mode: "guest" };
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      mode: parsed.mode === "account" ? "account" : "guest",
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      userId: typeof parsed.userId === "string" ? parsed.userId : undefined,
    };
  } catch {
    return { mode: "guest" };
  }
}

export function saveAuth(auth: AuthState, storage: StorageAdapter = defaultStorage): void {
  try {
    storage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    // Storage unavailable (private mode) — auth still works in memory.
  }
}

export function clearAuth(storage: StorageAdapter = defaultStorage): void {
  try {
    storage.removeItem(AUTH_KEY);
  } catch {
    // Non-fatal.
  }
}
