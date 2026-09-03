"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, BoltIcon, CompassIcon, XIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { TOURS } from "./tourSteps";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface TourWelcomeProps {
  /** "welcome" = first visit; "guide" = user reopened it from the app. */
  mode: "welcome" | "guide";
  onStart: (tourId: string) => void;
  onClose: () => void;
}

/**
 * The welcome / chooser card. On first visit it introduces BAMBI and offers
 * a Quick or Full tour; the same card is reused as the replay entry point
 * (TopBar help button, Settings) so there's exactly one chooser in the app.
 */
export function TourWelcome({ mode, onStart, onClose }: TourWelcomeProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Focus the close button so keyboard users land inside the dialog.
  useEffect(() => {
    const t = window.setTimeout(() => closeRef.current?.focus(), reduce ? 0 : 150);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-welcome-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      {/* Warm dim — same family as the spotlight dim. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm dark:bg-[#020617]/60"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-lift dark:border-white/[0.1] sm:p-7"
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <XIcon size={18} />
        </button>

        <div className="flex items-center gap-3">
          <BrandLogo size={40} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">Learn BAMBI</p>
            <p className="font-display text-lg font-extrabold tracking-tight text-ink">BAMBI</p>
          </div>
        </div>

        <h2 id="tour-welcome-title" className="font-display mt-5 text-2xl font-extrabold tracking-tight text-ink">
          {mode === "welcome" ? "Welcome to BAMBI" : "Let's take another look"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {mode === "welcome"
            ? "Your space for growing, planning, learning and keeping your life together. Want a quick walkthrough?"
            : "Re-walk the tour whenever you like — from the big picture to the little details."}
        </p>

        <div className="mt-6 space-y-3">
          {TOURS.map((tour) => {
            const Icon = tour.id === "quick" ? BoltIcon : CompassIcon;
            return (
              <button
                key={tour.id}
                type="button"
                onClick={() => onStart(tour.id)}
                className={[
                  "group flex w-full items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4 text-left",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/[0.06]",
                  "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                ].join(" ")}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-ink">{tour.label}</span>
                    <span className="rounded-full bg-line/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                      {tour.duration}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{tour.tagline}</span>
                </span>
                <ArrowRightIcon
                  size={18}
                  className="shrink-0 text-ink-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full text-center text-sm font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
}
