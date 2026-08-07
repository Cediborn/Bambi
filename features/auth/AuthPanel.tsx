"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, FieldError, Input } from "@/components/ui/Input";
import {
  CloudIcon,
  LockIcon,
  LogOutIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/icons";
import { useAuth } from "./AuthProvider";

/**
 * AuthPanel — the account card. Renders either the signed-in state or the
 * sign-in / create-account forms, plus an honest note about what accounts
 * do (and don't do) today. `showGuestCta` exposes the "continue as guest"
 * path — used on the standalone /auth page.
 */
export function AuthPanel({
  showGuestCta = false,
  onGuest,
}: {
  showGuestCta?: boolean;
  onGuest?: () => void;
}) {
  const auth = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setFormError("Both an email and a password are needed.");
      return;
    }
    setFormError(null);
    if (tab === "signin") await auth.signIn(email.trim(), password);
    else await auth.signUp(email.trim(), password);
  };

  if (auth.mode === "account") {
    return (
      <Card size="featured" className="space-y-5">
        <div className="flex items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <UserIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-ink">Signed in</p>
            <p className="truncate text-sm text-ink-soft">{auth.email}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          Accounts are the first step toward syncing your garden between devices —
          your data still lives in this browser for now.
        </p>
        <Button
          variant="secondary"
          onClick={() => void auth.signOut()}
          icon={<LogOutIcon size={16} />}
        >
          Sign out
        </Button>
      </Card>
    );
  }

  return (
    <Card size="featured" className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-soft">
          <CloudIcon size={20} />
        </span>
        <div>
          <p className="font-bold text-ink">Account</p>
          <p className="text-sm text-ink-soft">
            {showGuestCta ? "Create an account, or grow as a guest." : "You're growing as a guest."}
          </p>
        </div>
      </div>

      {!auth.configured ? (
        <p className="rounded-xl border border-warn/30 bg-warn/5 px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
          Accounts aren&apos;t switched on in this build yet — add the Supabase
          keys to enable them. Until then, BAMBI runs happily as a guest.
        </p>
      ) : (
        <div>
          <div
            role="group"
            aria-label="Account"
            className="flex rounded-full border border-line bg-surface p-1"
          >
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => {
                  setTab(t);
                  auth.clearMessages();
                }}
                className={[
                  "flex-1 rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  tab === t ? "bg-brand text-white shadow-card" : "text-ink-soft hover:text-ink",
                ].join(" ")}
              >
                {t === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-4">
            <Field label="Email" htmlFor="auth-email">
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError(null);
                  auth.clearMessages();
                }}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field
              label="Password"
              htmlFor="auth-password"
              hint={tab === "signup" ? "At least 6 characters" : undefined}
            >
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError(null);
                  auth.clearMessages();
                }}
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </Field>

            {formError || auth.error ? (
              <FieldError>{formError ?? auth.error}</FieldError>
            ) : null}
            {auth.notice ? (
              <p className="text-sm font-semibold text-good" role="status">
                {auth.notice}
              </p>
            ) : null}

            <Button
              type="submit"
              fullWidth
              disabled={auth.busy}
              icon={tab === "signin" ? <LockIcon size={16} /> : <SparklesIcon size={16} />}
            >
              {auth.busy ? "One moment…" : tab === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>
      )}

      {showGuestCta ? (
        <div className="border-t border-line pt-4 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              auth.continueAsGuest();
              onGuest?.();
            }}
            className="w-full text-center text-sm font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Continue as guest
          </button>
        </div>
      ) : null}
    </Card>
  );
}
