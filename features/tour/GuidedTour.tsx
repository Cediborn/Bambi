"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/hooks/useApp";
import { ArrowRightIcon, XIcon } from "@/components/icons";
import { TourGuide } from "./TourGuide";
import type { Tour, TourStep } from "./tourTypes";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Breathing room around the spotlighted element so the glow never clips it. */
const PAD = 8;
/** Fallback target when a step doesn't name one — every page has an h1. */
const FALLBACK = "h1";
/** How long to keep polling for a target before skipping the step gracefully. */
const MAX_ATTEMPTS = 30;
/** Conservative card height used for placement (content rarely exceeds it). */
const CARD_H = 320;

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
 * hole around the current element, and shows an explanation card with the
 * user's avatar as a living tour guide. The avatar appears in a speech
 * bubble beside the spotlighted feature, adapting its position based on
 * where the element is on screen.
 *
 * Keyboard: Esc = skip · → = next · ← = back.
 */
export function GuidedTour({ tour, onFinish, onSkip }: GuidedTourProps) {
  const { state } = useApp();
  const dark = state.settings.theme === "dark";
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const avatar = state.profile?.avatar ?? "fawn";

  const [index, setIndex] = useState(0);
  const step = tour.steps[index];
  const regular = step.kind !== "welcome" && step.kind !== "complete";
  const isLast = index === tour.steps.length - 1;
  const isFirst = index === 0;

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
    if (indexRef.current >= tour.steps.length - 1) {
      // Navigate back to the home page before finishing the tour
      router.push("/today");
      onFinish();
    } else setIndex((i) => i + 1);
  }, [tour.steps.length, onFinish, router]);

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

  /* Focus the active card so keyboard users land inside the dialog. */
  const positioned = Boolean(rect && regular);
  useEffect(() => {
    const t = window.setTimeout(() => {
      (cardRef.current ?? centerRef.current)?.focus();
    }, reduce ? 0 : 160);
    return () => window.clearTimeout(t);
  }, [index, reduce, positioned]);

  /**
   * Card placement — positioned beside the spotlighted element.
   * The card is taller now (avatar + speech bubble), so we account for that.
   * On mobile, the card docks at the bottom. On desktop, it positions itself
   * to the right of the target, or to the left if there's no room.
   */
  let placed: CardPos | null = null;
  if (rect && regular) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(vw * 0.92, 380);
    const gap = 20;
    let x: number;
    let y: number;
    if (vw < 640) {
      // Mobile: dock near the bottom, keeping the feature visible above.
      x = Math.max(12, (vw - w) / 2);
      y = Math.max(12, Math.min(vh - CARD_H - 12, rect.y + rect.height + gap));
    } else {
      // Desktop: try right side, then left, then below, then above.
      const rightX = rect.x + rect.width + gap;
      const leftX = rect.x - gap - w;
      
      if (rightX + w <= vw - 20) {
        // Right side has room
        x = rightX;
        y = Math.max(20, Math.min(vh - CARD_H - 20, rect.y + rect.height / 2 - CARD_H / 2));
      } else if (leftX >= 20) {
        // Left side has room
        x = leftX;
        y = Math.max(20, Math.min(vh - CARD_H - 20, rect.y + rect.height / 2 - CARD_H / 2));
      } else {
        // Fall back to below/above
        let py = rect.y + rect.height + gap;
        if (py + CARD_H > vh - 20 && rect.y - gap - CARD_H >= 20) py = rect.y - gap - CARD_H;
        else if (py + CARD_H > vh - 20) py = vh - CARD_H - 20;
        x = Math.max(12, Math.min(rect.x + rect.width / 2 - w / 2, vw - w - 12));
        y = Math.max(12, py);
      }
    }
    placed = { x, y };
  }

  const total = tour.steps.length;

  // Determine the guide's mood based on the step
  const guideMood = useMemo(() => {
    if (isFirst) return "wave" as const;
    if (isLast) return "celebrate" as const;
    return "idle" as const;
  }, [isFirst, isLast]);

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
          behind the tour. */}
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
              {/* Soft halo */}
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
              {/* Fine ring */}
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

      {/* Explanation card with avatar guide (regular steps). */}
      {regular && placed ? (
        <motion.div
          ref={cardRef}
          tabIndex={-1}
          className="fixed max-h-[calc(100vh-24px)] w-[min(92vw,24rem)] overflow-y-auto rounded-2xl border border-line bg-white p-0 shadow-lift outline-none dark:border-white/[0.1] dark:bg-card"
          style={{ left: placed.x, top: placed.y }}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {/* Avatar guide header */}
          <div className="flex items-start gap-3 border-b border-line/60 p-4 pb-3 dark:border-white/[0.06]">
            <TourGuide avatar={avatar} mood={guideMood} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
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
              {/* Progress dots */}
              <div className="mt-2 flex items-center gap-1" aria-hidden="true">
                {tour.steps.map((s, i) => (
                  <span
                    key={s.id}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === index ? "w-4 bg-brand" : i < index ? "w-1 bg-brand/40" : "w-1 bg-line"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Speech bubble content */}
          <div className="p-4">
            {/* Speech bubble tail pointing up toward the avatar */}
            <div className="relative ml-6 mb-3">
              <div
                aria-hidden="true"
                className="absolute -top-2 left-4"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderBottom: "6px solid white",
                  filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.05))",
                }}
              />
              <div className="rounded-xl bg-surface/60 px-4 py-3 dark:bg-white/[0.04]">
                <h2 id="tour-title" className="font-display text-base font-bold tracking-tight text-ink">
                  {step.title}
                </h2>
                <p id="tour-desc" className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
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
          </div>
        </motion.div>
      ) : null}

      {/* Welcome / completion moments — centered card with avatar. */}
      {!regular ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            ref={centerRef}
            tabIndex={-1}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white text-center shadow-lift outline-none dark:border-white/[0.1] dark:bg-card sm:p-8"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {step.kind === "welcome" ? (
              <div className="flex flex-col items-center p-6 pb-0 sm:p-8">
                <TourGuide avatar={avatar} mood="wave" size={80} />
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 pb-0 sm:p-8">
                <TourGuide avatar={avatar} mood="celebrate" size={80} />
              </div>
            )}

            <div className="p-6 pt-4 sm:p-8 sm:pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
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
            </div>
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}
