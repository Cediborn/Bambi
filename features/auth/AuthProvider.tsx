"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthState } from "@/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { clearAuth, loadAuth, saveAuth } from "@/lib/auth";

interface AuthApi {
  mode: AuthState["mode"];
  email?: string;
  userId?: string;
  /** Whether Supabase keys are present — false means guest-only. */
  configured: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  clearMessages: () => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Turn Supabase's terse errors into warm, human copy. */
function friendlyError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "That email and password don't match. Give it another go?";
  if (/already registered/i.test(message))
    return "That email already has an account — sign in instead.";
  if (/password should be at least/i.test(message))
    return "Passwords need at least 6 characters.";
  if (/email not confirmed/i.test(message))
    return "Confirm your email first — check your inbox.";
  return message;
}

/**
 * AuthProvider — identity, not data. Signing in or out never touches the
 * garden (app state stays in its own store); this provider only tracks
 * who the user is and hands auth calls to Supabase when it's configured.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  // When Supabase is configured, its session is the source of truth.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        const next: AuthState = {
          mode: "account",
          email: user.email ?? undefined,
          userId: user.id,
        };
        setAuth(next);
        saveAuth(next);
      } else {
        setAuth((prev) => {
          if (prev.mode === "account") {
            const next: AuthState = { mode: "guest" };
            saveAuth(next);
            return next;
          }
          return prev;
        });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      const next: AuthState = user
        ? { mode: "account", email: user.email ?? undefined, userId: user.id }
        : { mode: "guest" };
      setAuth(next);
      saveAuth(next);
    });

    return () => sub.subscription.unsubscribe();
  }, [configured]);

  const clearMessages = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setNotice(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError(
        "Accounts aren't switched on in this build yet — add the Supabase keys to enable them. You can keep growing as a guest."
      );
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(friendlyError(err.message));
      else setNotice("Signed in. Your garden is exactly where you left it.");
    } finally {
      setBusy(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    setNotice(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError(
        "Accounts aren't switched on in this build yet — add the Supabase keys to enable them. You can keep growing as a guest."
      );
      return;
    }
    setBusy(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) {
        setError(friendlyError(err.message));
      } else if (data.session) {
        setNotice("Account created. Welcome to the garden.");
      } else {
        setNotice(`Check ${email} to confirm, then sign in.`);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setNotice(null);
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setAuth({ mode: "guest" });
    clearAuth();
  }, []);

  const continueAsGuest = useCallback(() => {
    setError(null);
    setNotice(null);
    setAuth({ mode: "guest" });
    clearAuth();
  }, []);

  const value = useMemo<AuthApi>(
    () => ({
      mode: auth.mode,
      email: auth.email,
      userId: auth.userId,
      configured,
      busy,
      error,
      notice,
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      clearMessages,
    }),
    [auth, configured, busy, error, notice, signIn, signUp, signOut, continueAsGuest, clearMessages]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
