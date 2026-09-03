"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MoodGlyph } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { bannerMessage } from "@/utils/banner";
import { todayKey } from "@/utils/dates";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * FocusBanner — one contextual insight near the top of the Today page.
 * Reads real data (goals left, streak, quest, focus minutes…) and shows a
 * single short, warm line. Quiet encouragement, not a notification.
 */
export function FocusBanner() {
  const { state } = useApp();
  const banner = bannerMessage(state, todayKey());
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-live="polite"
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex"
    >
      <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 py-2 pl-3 pr-4 text-sm font-semibold text-ink shadow-card backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
        <span aria-hidden="true" className="leading-none">
          <MoodGlyph name={banner.icon} size={16} />
        </span>
        {banner.text}
      </span>
    </motion.div>
  );
}
