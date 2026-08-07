"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GlobalLoader } from "./GlobalLoader";
import { TodaySkeleton } from "@/features/today/TodaySkeleton";
import { STATE_KEY } from "@/db/persistence";

/** Subscription that never fires — used only to detect client hydration. */
function emptySubscribe() {
  return () => {};
}

function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !window.localStorage.getItem(STATE_KEY);
  } catch {
    return false;
  }
}

function routeIsToday(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/today");
}

/**
 * BootGate — BAMBI's entrance.
 *
 * A pure overlay, never a blocker: the real app renders underneath while
 * the splash covers the first paint. First visits play the branded
 * sprout sequence (slightly longer — it's the "opening a game" moment);
 * returning users get a brief page-shaped skeleton so it reads as content
 * arriving, not a loading ritual. Reduced motion skips the wait entirely,
 * and the overlay always uses the theme background so the hand-off is
 * seamless even on slow networks.
 */
export function BootGate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [firstVisit] = useState(isFirstVisit);
  // `mounted` is false on the server and during hydration, so the overlay
  // always starts with the branded loader (matching server HTML). Once
  // hydrated, returning /today users see the page-shaped skeleton instead
  // — same visual intent, no hydration mismatch, no state-in-effect.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const today = mounted && routeIsToday();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const min = reduce ? 0 : firstVisit ? 950 : 380;
    const t = window.setTimeout(() => setShow(false), min);
    return () => window.clearTimeout(t);
  }, [reduce, firstVisit]);

  return (
    <>
      <AnimatePresence>
        {show ? (
          <motion.div
            key="bambi-boot"
            className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-bg"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: "easeInOut" }}
          >
            {firstVisit || !today ? <GlobalLoader /> : <TodaySkeleton />}
          </motion.div>
        ) : null}
      </AnimatePresence>
      {children}
    </>
  );
}
