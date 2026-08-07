"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/hooks/useApp";
import { ArrowRightIcon, BambiLogo, CheckIcon, XIcon } from "@/components/icons";
import type { Tour, TourStep } from "./tourTypes";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Breathing room around the spotlighted element so the glow never clips it. */
const PAD = 8;
/** Fallback target when a step doesn't name one — every page has an h1. */
const FALLBACK = "h1";
/** How long to keep polling for a target before skipping the step gracefully. */
const MAX_ATTEMPTS = 30;
/** Conservative card height used for placement (content rarely exceeds it). */
const CARD_H = 250;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CardPos {
  x: number;
  y: number;
}

interface GuidedTourProps {
  tour: Tour;
  onFinish: () => void;
  onSkip: () => void;
}

/**
 * GuidedTour — the spotlight engine behind BAMBI's tours.
 *
 * The overlay dims the interface with a warm scrim, cuts a softly glowing
 * hole around the current element, and shows an explanation card that
 * positions itself beside the hole (bottom-docked on small screens).
 * Steps can live on other routes: the tour navigates there and polls for
 * the target to appear before spotlighting it. If a target never shows up,
 * the step is skipped gracefully.
 *
 * Keyboard: Esc = skip · → = next · ← = back.
 */
export function GuidedTour({ tour, onFinish, onSkip }: GuidedTourProps) {
  const { state } = useApp();
  const dark = state.settings.theme === "dark";
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();

  const [index, setIndex] = useState(0);
  const step = tour.steps[index];
  const regular = step.kind !== "welcome" && step.kind !== "complete";
  const isLast = index === tour.steps.length - 1;

  const [rect, setRect] = useState<Rect | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const pollTimer = useRef(0);

  /* Adjusting state when the step changes (the React-sanctioned pattern):
     clear the spotlight + card before the next step's targeting kicks in. */
  const [prevStepId, setPrevStepId] = useState<string | null>(null);
  if (step.id !== prevStepId) {
    setPrevStepId(step.id);
    setRect(null);
  }

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const dim = dark ? "rgba(2, 6, 23, 0.62)" : "rgba(30, 27, 22, 0.40)";
  const ring = dark ? "rgba(139, 92, 246, 0.65)" : "rgba(124, 58, 237, 0.55)";
  const glow = dark ? "rgba(139, 92, 246, 0.28)" : "rgba(124, 58, 237, 0.20)";

  const goNext = useCallback(() => {
    if (indexRef.current >= tour.steps.length - 1) onFinish();
    else setIndex((i) => i + 1);
  }, [tour.steps.length, onFinish]);

  const goBack = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  /** Measure an element and move the spotlight onto it. */
  const measure = useCallback((el: Element) => {
    const r = el.getBoundingClientRect();
    setRect({
      x: r.left - PAD,
      y: r.top - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    });
  }, []);

  /** One targeting attempt: returns true once the target is spotlighted. */
  const locate = useCallback(
    (s: TourStep): boolean => {
      const el = document.querySelector(s.target ?? FALLBACK) ?? document.querySelector(FALLBACK);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      // Only scroll when the target isn't already comfortably in view.
      if (r.top < 96 || r.bottom > window.innerHeight - 96) {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
      measure(el);
      // Smooth scrolls fire scroll events continuously, so the scroll
      // listener below keeps the spotlight glued while the page settles.
      return true;
    },
    [reduce, measure]
  );

  /* On every step change: navigate to the step's route first (the h1
     fallback must never spotlight the *previous* page's title), then poll
     until the target is in the DOM (or skip the step gracefully). */
  useEffect(() => {
    if (!regular) return;
    if (step.route && pathname !== step.route) {
      router.push(step.route);
      return;
    }
    let attempts = 0;
    const tryLocate = () => {
      if (locate(step)) return;
      if (attempts >= MAX_ATTEMPTS) {
        goNext(); // graceful skip — the element never appeared
        return;
      }
      attempts += 1;
      pollTimer.current = window.setTimeout(tryLocate, 120);
    };
    tryLocate();
    return () => window.clearTimeout(pollTimer.current);
  }, [index, step, regular, locate, goNext, router, pathname]);

  /* Keep the spotlight glued during scrolling (smooth scrolls, user scrolls). */
  useEffect(() => {
    if (!rect || !regular) return;
    let raf = 0;
    const refresh = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = document.querySelector(step.target ?? FALLBACK);
        if (el) measure(el);
      });
    };
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rect, regular, step, measure]);

  /* Keyboard controls. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip, goNext, goBack]);

  /* Focus the active card so keyboard users land inside the dialog.
     `positioned` makes this re-run once a spotlight arrives (steps that
     navigate mount their card later than the step change). */
  const positioned = Boolean(rect && regular);
  useEffect(() => {
    const t = window.setTimeout(() => {
      (cardRef.current ?? centerRef.current)?.focus();
    }, reduce ? 0 : 160);
    return () => window.clearTimeout(t);
  }, [index, reduce, positioned]);

  /* Card placement — computed during render (the overlay only renders after
     hydration, so `window` is safe). The width matches the card's own
     `min(92vw, 26rem)` so the estimate is exact; height is conservative. */
  let placed: CardPos | null = null;
  if (rect && regular) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(vw * 0.92, 416);
    const gap = 16;
    let x: number;
    let y: number;
    if (vw < 640) {
      // Mobile: dock near the bottom, keeping the feature visible above.
      x = Math.max(12, (vw - w) / 2);
      y = Math.max(12, Math.min(vh - CARD_H - 12, rect.y + rect.height + gap));
    } else {
      // Desktop: below the target, flipped above when there's no room.
      let py = rect.y + rect.height + gap;
      if (py + CARD_H > vh - 20 && rect.y - gap - CARD_H >= 20) py = rect.y - gap - CARD_H;
      else if (py + CARD_H > vh - 20) py = vh - CARD_H - 20;
      x = Math.max(12, Math.min(rect.x + rect.width / 2 - w / 2, vw - w - 12));
      y = Math.max(12, py);
    }
    placed = { x, y };
  }

  const total = tour.steps.length;

  return (
    <motion.div
      className="fixed inset-0 z-[85]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-desc"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.22 }}
    >
      {/* Spotlight — a full-screen SVG scrim that dims everything except the
          target, draws the soft ring, and blocks interaction with the page
          behind the tour (the mask is visual only, so the whole SVG still
          swallows clicks). Geometry attributes glide via CSS transitions. */}
      {regular ? (
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          style={{
            transition: reduce
              ? "none"
              : "x 0.4s cubic-bezier(0.22, 1, 0.36, 1), y 0.4s cubic-bezier(0.22, 1, 0.36, 1), width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <defs>
            <mask id="bambi-tour-mask">
              <rect width="100%" height="100%" fill="#fff" />
              {rect ? (
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  rx={20}
                  fill="#000"
                />
              ) : null}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill={dim} mask="url(#bambi-tour-mask)" />
          {rect ? (
            <>
              {/* Soft halo — a wide, dim stroke that reads as gentle glow. */}
              <rect
                x={rect.x - 8}
                y={rect.y - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx={26}
                fill="none"
                stroke={glow}
                strokeWidth={10}
                opacity={0.55}
              />
              {/* Fine ring around the spotlighted element. */}
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx={20}
                fill="none"
                stroke={ring}
                strokeWidth={2}
              />
            </>
          ) : null}
        </svg>
      ) : (
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] dark:bg-[#020617]/55" />
      )}

      {/* Explanation card (regular steps). */}
      {regular && placed ? (
        <motion.div
          ref={cardRef}
          tabIndex={-1}
          className="fixed max-h-[calc(100vh-24px)] w-[min(92vw,26rem)] overflow-y-auto rounded-2xl border border-line bg-card p-5 shadow-lift outline-none dark:border-white/[0.1]"
          style={{ left: placed.x, top: placed.y }}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
              BAMBI tour · {index + 1}/{total}
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <XIcon size={13} />
              Skip
            </button>
          </div>

          {/* Progress dots. */}
          <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
            {tour.steps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-brand" : i < index ? "w-1.5 bg-brand/40" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>

          <h2 id="tour-title" className="font-display mt-4 text-lg font-bold tracking-tight text-ink">
            {step.title}
          </h2>
          <p id="tour-desc" className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            {step.description}
          </p>

          <div className="mt-5 flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={index === 0}
              aria-label="Previous step"
            >
              Back
            </Button>
            <div className="flex-1" />
            <Button size="sm" onClick={goNext}>
              {isLast ? "Start exploring" : "Next"}
              <ArrowRightIcon size={15} />
            </Button>
          </div>
        </motion.div>
      ) : null}

      {/* Welcome / completion moments — a centered card instead of a spotlight. */}
      {!regular ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            ref={centerRef}
            tabIndex={-1}
            className="relative w-full max-w-md rounded-3xl border border-line bg-card p-6 text-center shadow-lift outline-none dark:border-white/[0.1] sm:p-8"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {step.kind === "welcome" ? (
              <div className="flex justify-center">
                <BambiLogo size={56} />
              </div>
            ) : (
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-mint/10 text-good">
                <CheckIcon size={26} />
              </span>
            )}

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
              {step.kind === "welcome" ? "Learn BAMBI" : "BAMBI tour · complete"}
            </p>
            <h2 id="tour-title" className="font-display mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {step.title}
            </h2>
            <p id="tour-desc" className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              {step.description}
            </p>

            <div className="mt-7">
              <Button size="lg" fullWidth onClick={goNext}>
                {step.kind === "welcome" ? "Start the tour" : "Start exploring"}
                <ArrowRightIcon size={16} />
              </Button>
              {step.kind === "complete" ? (
                <Button variant="ghost" fullWidth className="mt-2.5" onClick={() => setIndex(0)}>
                  Replay tour
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={onSkip}
                  className="mt-3 w-full text-sm font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Maybe later
                </button>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}
