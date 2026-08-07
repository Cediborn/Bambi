"use client";

import { useRouter } from "next/navigation";
import { BambiLogo } from "@/components/icons";
import { SparkleField } from "@/components/decor/SparkleField";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { useApp } from "@/hooks/useApp";

/**
 * Standalone account page — sign in, create an account, or continue as a
 * guest. Reachable from onboarding and Settings; routes back to where the
 * user came from (onboarding if they haven't finished it yet).
 */
export default function AuthPage() {
  const router = useRouter();
  const { state } = useApp();
  const back = state.profile ? "/today" : "/onboarding";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10 text-ink">
      <SparkleField />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BambiLogo size={56} />
          <h1 className="font-display mt-4 text-3xl font-extrabold tracking-tight">
            Your garden, anywhere.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Create an account, or keep growing quietly as a guest.
          </p>
        </div>

        <AuthPanel showGuestCta onGuest={() => router.replace(back)} />

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.replace(back)}
            className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Back to {state.profile ? "BAMBI" : "getting started"}
          </button>
        </div>
      </div>
    </main>
  );
}
