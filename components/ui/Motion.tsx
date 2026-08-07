"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Gentle entrance helpers built on framer-motion.
 *
 * `Reveal` fades and slides content up when it first appears — used with a
 * per-item `delay` for staggered card entrances. `HoverLift` gives a card
 * a soft lift + deeper shadow on hover.
 *
 * Both respect the user's motion preference: with reduced motion they
 * render statically and hover effects are disabled.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  delay = 0,
  className,
  y = 14,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero entrance — fades up while a soft blur clears. Used only for the
 * dashboard's centerpiece so it feels like the page comes into focus.
 */
export function RevealBlur({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Slide-in from a side — the quest card's signature entrance. */
export function SlideIn({
  children,
  delay = 0,
  className,
  from = "left",
  distance = 22,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "left" | "right";
  distance?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x: from === "left" ? -distance : distance }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Scale-in entrance — the tree card grows into place like a seedling. */
export function ScaleReveal({
  children,
  delay = 0,
  className,
  from = 0.95,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, scale: from }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp — animates a number from its previous value to `value`.
 * Pure display: no state changes, just a smooth count. Respects
 * reduced motion by jumping straight to the final value.
 */
export function CountUp({
  value,
  duration = 1.1,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const shown = useRef(0);

  useEffect(() => {
    // Reduced motion: jump to the final value without a count-up. The
    // display is already the value (initial state), so no setState here.
    if (reduce) {
      shown.current = value;
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = shown.current;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      shown.current = next;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);

  return <span className={className}>{display}</span>;
}

const staggerItem: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/** Stagger — children appear one after another. Pair with `StaggerItem`. */
export function Stagger({
  children,
  className,
  delayChildren = 0.05,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren } } }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

/** One step inside a `Stagger`. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
  lift = -3,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift }}
      whileTap={{ y: 0, scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
