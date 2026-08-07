"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

const ANCHOR: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };
const STEM_ORIGIN: CSSProperties = { transformBox: "fill-box", transformOrigin: "50% 100%" };

/**
 * TreeLoadingState — the garden's own loading mark.
 *
 * A sprout breaks the soil, stems upward, and unfurls its leaves before
 * settling into a slow sway. Loading reads as growth rather than a
 * spinner. Reduced motion renders the grown sprout statically.
 */
export function TreeLoadingState({ label }: { label?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      role="status"
      aria-label={label ?? "Growing"}
      className="flex flex-col items-center"
    >
      <svg viewBox="0 0 200 160" className="h-36 w-auto sm:h-40" aria-hidden="true">
        <defs>
          <linearGradient id="sprout-stem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5a3a" />
            <stop offset="100%" stopColor="#5b3f28" />
          </linearGradient>
        </defs>

        {/* Soil */}
        <ellipse cx="100" cy="146" rx="72" ry="9" fill="#3b2f23" />
        <ellipse cx="100" cy="144" rx="72" ry="7" fill="#4c3b2a" />

        {/* The sprout — grows in once, then sways gently forever */}
        <motion.g
          animate={reduce ? undefined : { rotate: [0, 1.4, 0, -1.2, 0] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.6,
          }}
        >
          <motion.path
            d="M98 146 C 97 122 99 108 100 96 C 101 108 103 122 102 146 Z"
            fill="url(#sprout-stem)"
            style={STEM_ORIGIN}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.ellipse
            cx="94"
            cy="108"
            rx="13"
            ry="6.5"
            fill="#37a86c"
            style={ANCHOR}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
          />
          <motion.ellipse
            cx="106"
            cy="106"
            rx="13"
            ry="6.5"
            fill="#45bd7d"
            style={ANCHOR}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
          />
          <motion.ellipse
            cx="100"
            cy="92"
            rx="10"
            ry="5"
            fill="#2b915d"
            style={ANCHOR}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.05, duration: 0.5, ease: "easeOut" }}
          />
        </motion.g>
      </svg>
      {label ? (
        <p className="mt-3 text-xs font-semibold tracking-wide text-ink-soft">{label}</p>
      ) : null}
    </div>
  );
}
