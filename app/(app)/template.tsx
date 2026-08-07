"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Route transition — Next remounts this template on every navigation
 * inside the app, so sections fade up 8px into place in about a third of
 * a second. Quiet enough that it's felt rather than noticed; the
 * MotionConfig in AppProvider already honours the reduce-motion setting.
 */
export default function RouteTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
