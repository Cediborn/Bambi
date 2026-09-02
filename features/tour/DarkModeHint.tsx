"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MoonIcon, XIcon } from "@/components/icons";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const DARK_HINT_KEY = "bambi:dark-hint-dismissed";

interface DarkModeHintProps {
  /** When true, the hint becomes eligible to show (tour just completed). */
  show: boolean;
}

/**
 * DarkModeHint — a friendly nudge that appears once after the guided tour
 * finishes. Shows "Looks better in dark mode" as a floating bubble with a
 * dismiss (X) button. Never shows again after being dismissed.
 *
 * This component is rendered globally in AppShell so it works on any page.
 */
export function DarkModeHint({ show }: DarkModeHintProps) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if hint has been dismissed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DARK_HINT_KEY);
      if (stored === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Show the hint when the tour completes (if not already dismissed)
  useEffect(() => {
    if (!show || dismissed) return;
    const t = window.setTimeout(() => {
      setVisible(true);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [show, dismissed]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DARK_HINT_KEY, "1");
    } catch {
      // Non-fatal
    }
  }, []);

  // Auto-dismiss after 8 seconds if not interacted with
  useEffect(() => {
    if (!visible || dismissed) return;
    const t = window.setTimeout(dismiss, 8000);
    return () => window.clearTimeout(t);
  }, [visible, dismissed, dismiss]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed bottom-24 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-brand/20 bg-white px-4 py-3 shadow-lg dark:border-brand/30 dark:bg-card sm:bottom-28"
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.3, ease: EASE }}
          role="status"
          aria-live="polite"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <MoonIcon size={14} />
          </span>
          <p className="text-sm font-semibold text-ink">Looks better in dark mode</p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <XIcon size={14} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
