import type { AuthState } from "@/types";

/**
 * Persisted auth identity — kept apart from app data (see `bambi:state`)
 * so signing in or out never touches the garden itself.
 */
const AUTH_KEY = "bambi:auth";

export function loadAuth(): AuthState {
  if (typeof window === "undefined") return { mode: "guest" };
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
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

export function saveAuth(auth: AuthState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    // Storage unavailable (private mode) — auth still works in memory.
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTH_KEY);
  } catch {
    // non-fatal
  }
}
