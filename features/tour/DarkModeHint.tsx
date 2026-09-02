"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MoonIcon, XIcon } from "@/components/icons";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HINT_KEY = "bambi:dark-hint-dismissed";

/**
 * DarkModeHint — a friendly nudge that appears once near the theme toggle
 * on the first Settings visit. Shows "Looks better in dark mode" with a
 * dismiss (X) button. Never shows again after being dismissed.
 *
 * The hint is positioned relative to the theme toggle Row. It uses a
 * ref-based approach to measure the toggle's position and anchor the bubble.
 */
export function DarkModeHint({ themeRef }: { themeRef?: React.RefObject<HTMLDivElement | null> }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Check if hint has been dismissed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HINT_KEY);
      if (stored === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      // Storage unavailable
    }

    // Show the hint after a short delay so the Settings page has rendered
    const t = window.setTimeout(() => {
      setVisible(true);
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  // Position the bubble relative to the theme toggle
  useEffect(() => {
    if (!visible || !themeRef?.current) return;
    const el = themeRef.current;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.top + r.height / 2,
      left: Math.min(r.right + 12, window.innerWidth - 280),
    });
  }, [visible, themeRef]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
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
      {visible && pos ? (
        <motion.div
          ref={bubbleRef}
          className="fixed z-[95] flex items-center gap-2.5 rounded-2xl border border-brand/20 bg-white px-4 py-3 shadow-lg dark:border-brand/30 dark:bg-card"
          style={{ top: pos.top - 20, left: pos.left }}
          initial={reduce ? false : { opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: EASE }}
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
