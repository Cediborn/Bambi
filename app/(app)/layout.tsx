"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/hooks/useApp";

/** Subscription that never fires — used only to detect client hydration. */
function emptySubscribe() {
  return () => {};
}

/**
 * Gate for the main app: users without a profile are sent to onboarding.
 *
 * `mounted` is false on the server and during hydration, so both the server
 * HTML and the first client render output null (profile state lives in
 * localStorage and is only readable after hydration) — no mismatch.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (mounted && !state.profile) router.replace("/onboarding");
  }, [mounted, state.profile, router]);

  if (!mounted || !state.profile) return null;

  return <AppShell>{children}</AppShell>;
}
