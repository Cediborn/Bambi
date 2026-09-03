"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { useApp } from "@/hooks/useApp";

/** Subscription that never fires — used only to detect client hydration. */
function emptySubscribe() {
  return () => {};
}

/**
 * SparkleField — the night sky behind BAMBI.
 *
 * Star motion is driven by a requestAnimationFrame loop: each frame the
 * engine writes `transform` + `opacity` directly on the star elements, so
 * the sky always moves — no dependence on CSS variables inside keyframes
 * (an unreliable pattern). Each star drifts along its own vector with a
 * sway, fades in and out, and optionally twinkles and pulses — all at
 * its own speed. Transform/opacity only, so the work stays on the
 * compositor.
 *
 * Respects `prefers-reduced-motion` and the settings toggles (animated
 * background, particles, star density). A throttled pointer listener
 * gently brightens nearby stars by writing a CSS variable — no React
 * state, no re-renders.
 */

type Glyph = "star4" | "star5" | "plus" | "dot" | "diamond";

interface StarSpec {
  /** Anchor position, in % of the viewport. */
  left: number;
  top: number;
  size: number;
  /** Drift vector — distance in vw / vh (negative = up / left). */
  dx: number;
  dy: number;
  /** Seconds for one full drift loop. */
  dur: number;
  /** 0..1 — where in the loop the star starts. */
  phase: number;
  /** Total rotation over one loop, in degrees. */
  rot: number;
  /** Peak opacity (0..1). */
  opacity: number;
  /** Lateral sway amplitude, in vw. */
  sway: number;
  /** Glow radius (px) — more glow = brighter star. */
  glow: number;
  /** Depth blur (px) — far stars are softer. */
  blur: number;
  glyph: Glyph;
  color: string;
  /** Twinkles per loop (0 = steady). */
  twinkleCycles: number;
  /** Pulses (scale swells) per loop (0 = steady). */
  pulseCycles: number;
}

/* Six archetypes across three depths — tiny background dots, slow
   twinklers, mid drifters, glowers, and near-layer fast stars.
   Motion is deliberately noticeable: real drift distances, 14-46s loops. */
const STARS: StarSpec[] = [
  /* --- far layer: tiny, dim, slow, soft --- */
  { left: 3, top: 30, size: 5, dx: 2.4, dy: -11, dur: 40, phase: 0.3, rot: 24, opacity: 0.3, sway: 0.9, glow: 2, blur: 1.2, glyph: "star4", color: "var(--color-brand-2)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 12, top: 72, size: 4, dx: -1.8, dy: -6, dur: 46, phase: 0.7, rot: -14, opacity: 0.26, sway: 0.7, glow: 0, blur: 1.4, glyph: "dot", color: "var(--color-brand)", twinkleCycles: 0, pulseCycles: 0 },
  { left: 20, top: 18, size: 6, dx: 3.6, dy: -13, dur: 38, phase: 0.12, rot: 18, opacity: 0.32, sway: 1.1, glow: 3, blur: 1.1, glyph: "plus", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 1.5 },
  { left: 30, top: 58, size: 5, dx: -2.6, dy: -9, dur: 42, phase: 0.55, rot: -20, opacity: 0.28, sway: 0.8, glow: 2, blur: 1.3, glyph: "diamond", color: "var(--color-brand-2)", twinkleCycles: 3, pulseCycles: 0 },
  { left: 41, top: 26, size: 4, dx: 1.2, dy: -5, dur: 50, phase: 0.2, rot: 12, opacity: 0.28, sway: 0.5, glow: 0, blur: 1.2, glyph: "dot", color: "var(--color-warn)", twinkleCycles: 0, pulseCycles: 0 },
  { left: 53, top: 66, size: 5, dx: 3, dy: -12, dur: 40, phase: 0.9, rot: -16, opacity: 0.28, sway: 1, glow: 2, blur: 1.4, glyph: "star5", color: "var(--color-brand)", twinkleCycles: 2, pulseCycles: 0 },
  { left: 63, top: 20, size: 4, dx: -1.6, dy: -7, dur: 44, phase: 0.42, rot: 15, opacity: 0.3, sway: 0.6, glow: 0, blur: 1.1, glyph: "dot", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 2 },
  { left: 74, top: 70, size: 5, dx: 3.4, dy: -10, dur: 41, phase: 0.05, rot: -22, opacity: 0.28, sway: 1, glow: 2, blur: 1.3, glyph: "plus", color: "var(--color-brand-2)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 84, top: 34, size: 6, dx: -2.8, dy: -9, dur: 39, phase: 0.65, rot: 17, opacity: 0.32, sway: 0.9, glow: 3, blur: 1.2, glyph: "diamond", color: "var(--color-tangerine)", twinkleCycles: 0, pulseCycles: 0 },
  { left: 93, top: 64, size: 4, dx: 0.8, dy: -4, dur: 52, phase: 0.35, rot: -12, opacity: 0.26, sway: 0.4, glow: 0, blur: 1.4, glyph: "dot", color: "var(--color-brand)", twinkleCycles: 1.5, pulseCycles: 0 },
  { left: 7, top: 88, size: 5, dx: -3.2, dy: -13, dur: 38, phase: 0.78, rot: 20, opacity: 0.28, sway: 1.2, glow: 2, blur: 1.3, glyph: "star4", color: "var(--color-warn)", twinkleCycles: 0, pulseCycles: 0 },
  { left: 47, top: 10, size: 4, dx: 1.8, dy: -6, dur: 48, phase: 0.15, rot: -15, opacity: 0.28, sway: 0.6, glow: 0, blur: 1.1, glyph: "dot", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 0 },
  { left: 58, top: 88, size: 5, dx: 3.8, dy: -9, dur: 40, phase: 0.5, rot: 14, opacity: 0.28, sway: 1, glow: 2, blur: 1.4, glyph: "star5", color: "var(--color-brand-2)", twinkleCycles: 0, pulseCycles: 1.8 },
  { left: 88, top: 12, size: 4, dx: -1, dy: -5, dur: 46, phase: 0.25, rot: -13, opacity: 0.26, sway: 0.5, glow: 0, blur: 1.2, glyph: "dot", color: "var(--color-brand)", twinkleCycles: 2, pulseCycles: 0 },

  /* --- mid layer: clear drifters with character --- */
  { left: 8, top: 44, size: 7, dx: 5, dy: -18, dur: 30, phase: 0.4, rot: 20, opacity: 0.42, sway: 1.4, glow: 4, blur: 0.4, glyph: "star4", color: "var(--color-brand)", twinkleCycles: 2, pulseCycles: 1 },
  { left: 17, top: 14, size: 6, dx: -4.2, dy: -15, dur: 28, phase: 0.7, rot: -16, opacity: 0.4, sway: 1.2, glow: 3, blur: 0.5, glyph: "plus", color: "var(--color-brand-2)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 26, top: 62, size: 8, dx: 3.4, dy: -20, dur: 32, phase: 0.1, rot: 22, opacity: 0.44, sway: 1.6, glow: 5, blur: 0.4, glyph: "star5", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 1.6 },
  { left: 35, top: 30, size: 6, dx: -5, dy: -14, dur: 29, phase: 0.85, rot: -18, opacity: 0.4, sway: 1.3, glow: 3, blur: 0.5, glyph: "diamond", color: "var(--color-warn)", twinkleCycles: 2, pulseCycles: 0 },
  { left: 46, top: 48, size: 7, dx: 2.6, dy: -16, dur: 31, phase: 0.6, rot: 15, opacity: 0.42, sway: 1.2, glow: 4, blur: 0.4, glyph: "star4", color: "var(--color-brand)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 56, top: 12, size: 6, dx: -3.4, dy: -12, dur: 28, phase: 0.3, rot: -19, opacity: 0.4, sway: 1, glow: 3, blur: 0.5, glyph: "plus", color: "var(--color-tangerine)", twinkleCycles: 0, pulseCycles: 1.4 },
  { left: 67, top: 52, size: 8, dx: 4.4, dy: -19, dur: 33, phase: 0.95, rot: 18, opacity: 0.44, sway: 1.5, glow: 5, blur: 0.4, glyph: "star5", color: "var(--color-brand-2)", twinkleCycles: 2, pulseCycles: 1.2 },
  { left: 76, top: 24, size: 6, dx: -2, dy: -10, dur: 30, phase: 0.45, rot: -12, opacity: 0.4, sway: 0.9, glow: 3, blur: 0.5, glyph: "diamond", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 0 },
  { left: 86, top: 58, size: 7, dx: 3.2, dy: -17, dur: 32, phase: 0.2, rot: 14, opacity: 0.42, sway: 1.3, glow: 4, blur: 0.4, glyph: "star4", color: "var(--color-warn)", twinkleCycles: 2, pulseCycles: 0 },
  { left: 94, top: 20, size: 6, dx: -4.6, dy: -13, dur: 27, phase: 0.75, rot: -17, opacity: 0.4, sway: 1.2, glow: 3, blur: 0.5, glyph: "plus", color: "var(--color-brand)", twinkleCycles: 0, pulseCycles: 1.6 },
  { left: 14, top: 92, size: 7, dx: 3.6, dy: -15, dur: 31, phase: 0.5, rot: 20, opacity: 0.42, sway: 1.1, glow: 4, blur: 0.4, glyph: "star5", color: "var(--color-brand-2)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 60, top: 36, size: 6, dx: -3, dy: -11, dur: 29, phase: 0.05, rot: -14, opacity: 0.4, sway: 1, glow: 3, blur: 0.5, glyph: "diamond", color: "var(--color-brand)", twinkleCycles: 0, pulseCycles: 0 },

  /* --- near layer: bigger, brighter, faster, clearly alive --- */
  { left: 5, top: 60, size: 11, dx: 7, dy: -24, dur: 20, phase: 0.35, rot: 24, opacity: 0.55, sway: 2, glow: 6, blur: 0, glyph: "star4", color: "var(--color-brand)", twinkleCycles: 2, pulseCycles: 1.2 },
  { left: 13, top: 22, size: 9, dx: -5.4, dy: -18, dur: 17, phase: 0.65, rot: -18, opacity: 0.5, sway: 1.7, glow: 5, blur: 0, glyph: "plus", color: "var(--color-brand-2)", twinkleCycles: 0, pulseCycles: 1.4 },
  { left: 23, top: 80, size: 10, dx: 6, dy: -21, dur: 22, phase: 0.15, rot: 16, opacity: 0.53, sway: 1.8, glow: 6, blur: 0, glyph: "star5", color: "var(--color-mint)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 33, top: 40, size: 8, dx: -7, dy: -16, dur: 18, phase: 0.8, rot: -20, opacity: 0.48, sway: 1.6, glow: 4, blur: 0, glyph: "diamond", color: "var(--color-warn)", twinkleCycles: 2, pulseCycles: 0 },
  { left: 43, top: 16, size: 10, dx: 3.6, dy: -20, dur: 21, phase: 0.5, rot: 18, opacity: 0.53, sway: 1.5, glow: 6, blur: 0, glyph: "star4", color: "var(--color-brand)", twinkleCycles: 0, pulseCycles: 1.6 },
  { left: 50, top: 58, size: 9, dx: -6.2, dy: -17, dur: 19, phase: 0.25, rot: -16, opacity: 0.5, sway: 1.7, glow: 5, blur: 0, glyph: "plus", color: "var(--color-tangerine)", twinkleCycles: 2, pulseCycles: 0 },
  { left: 60, top: 24, size: 11, dx: 5, dy: -22, dur: 23, phase: 0.7, rot: 20, opacity: 0.55, sway: 1.9, glow: 7, blur: 0, glyph: "star5", color: "var(--color-brand-2)", twinkleCycles: 2, pulseCycles: 1.3 },
  { left: 70, top: 66, size: 8, dx: -4.2, dy: -14, dur: 17, phase: 0.4, rot: -22, opacity: 0.48, sway: 1.4, glow: 4, blur: 0, glyph: "diamond", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 1.5 },
  { left: 80, top: 30, size: 10, dx: 6.4, dy: -18, dur: 20, phase: 0.1, rot: 14, opacity: 0.53, sway: 1.8, glow: 6, blur: 0, glyph: "star4", color: "var(--color-brand)", twinkleCycles: 2.5, pulseCycles: 0 },
  { left: 90, top: 78, size: 9, dx: -5.6, dy: -15, dur: 18, phase: 0.55, rot: -14, opacity: 0.5, sway: 1.5, glow: 5, blur: 0, glyph: "plus", color: "var(--color-warn)", twinkleCycles: 2, pulseCycles: 0 },
  { left: 38, top: 92, size: 10, dx: 4.4, dy: -13, dur: 21, phase: 0.9, rot: 22, opacity: 0.53, sway: 1.4, glow: 6, blur: 0, glyph: "star5", color: "var(--color-mint)", twinkleCycles: 0, pulseCycles: 1.7 },
  { left: 98, top: 44, size: 8, dx: -1.8, dy: -9, dur: 19, phase: 0.3, rot: -18, opacity: 0.48, sway: 1, glow: 4, blur: 0, glyph: "star4", color: "var(--color-brand-2)", twinkleCycles: 2, pulseCycles: 0 },
];

/** Always render the full star field. */
const STAR_COUNT = 40;

/** Distance (px) within which stars respond to the cursor. */
const BRIGHT_RADIUS = 240;

function Glyph({ kind, size }: { kind: Glyph; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      {kind === "star4" ? (
        <path d="M6 0 7.2 4.8 12 6 7.2 7.2 6 12 4.8 7.2 0 6l4.8-1.2z" />
      ) : kind === "star5" ? (
        <path d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6z" />
      ) : kind === "plus" ? (
        <path d="M5 0h2v5h5v2H7v5H5V7H0V5h5z" />
      ) : kind === "diamond" ? (
        <path d="M6 0 12 6 6 12 0 6z" />
      ) : (
        <circle cx="6" cy="6" r="2.6" />
      )}
    </svg>
  );
}

/** Does this session want motion? (OS preference or the settings toggle.) */
function wantsMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !document.documentElement.classList.contains("reduce-motion")
  );
}

export function SparkleField() {
  const { state } = useApp();
  const { animatedBackground, particles, reduceMotion } = state.settings;
  const refs = useRef<Array<HTMLSpanElement | null>>([]);
  const brightFrame = useRef<number | null>(null);
  // The star count depends on persisted settings (localStorage), which is
  // only readable after hydration — gate rendering so the server HTML and
  // the first client render match, then the sky appears.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  /* The motion engine — writes transform + opacity every frame. */
  useEffect(() => {
    if (!mounted || !animatedBackground || !particles) return;
    const els = refs.current;
    const active = STARS.slice(0, STAR_COUNT);

    // Reduced motion → place the stars once, gently, and stop.
    // `reduceMotion` (the settings toggle) is checked from state rather
    // than the DOM class, because AppProvider applies that class in a
    // parent effect that runs after this one on the same commit.
    if (reduceMotion || !wantsMotion()) {
      active.forEach((s, i) => {
        const el = els[i];
        if (!el) return;
        el.style.transform = "";
        el.style.opacity = String(s.opacity);
      });
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      for (let i = 0; i < active.length; i++) {
        const el = els[i];
        if (!el) continue;
        const s = active[i];
        const p = (t / s.dur + s.phase) % 1;
        const x = s.dx * p + s.sway * Math.sin(p * Math.PI * 4);
        const y = s.dy * p;
        let o = s.opacity * Math.pow(Math.sin(p * Math.PI), 1.4);
        if (s.twinkleCycles > 0) {
          o *= 0.55 + 0.45 * Math.sin(p * Math.PI * 2 * s.twinkleCycles);
        }
        const scale = s.pulseCycles > 0 ? 1 + 0.35 * Math.sin(p * Math.PI * 2 * s.pulseCycles) : 1;
        const rot = s.rot * p;
        el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, animatedBackground, particles, reduceMotion]);

  /* Hover brighten — throttled with rAF, writes a CSS variable only. */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (brightFrame.current !== null) return;
      brightFrame.current = requestAnimationFrame(() => {
        brightFrame.current = null;
        for (const el of refs.current) {
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(e.clientX - cx, e.clientY - cy);
          const bright = Math.max(0, 1 - d / BRIGHT_RADIUS);
          el.style.setProperty("--bright", bright.toFixed(2));
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (brightFrame.current !== null) cancelAnimationFrame(brightFrame.current);
    };
  }, []);

  if (!mounted || !animatedBackground) return null;

  const stars = particles ? STARS.slice(0, STAR_COUNT) : [];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Aurora — two slow bands, barely there, 40-60s cycles */}
      <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.16]">
        <div
          className="aurora-a absolute -top-[25%] left-[-15%] h-[70vh] w-[130vw] rounded-full"
          style={{
            background:
              "linear-gradient(115deg, rgb(139 92 246 / 0.35), rgb(59 130 246 / 0.22) 40%, rgb(34 197 94 / 0.16) 70%, transparent)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="aurora-b absolute bottom-[-30%] right-[-10%] h-[60vh] w-[110vw] rounded-full"
          style={{
            background:
              "linear-gradient(120deg, transparent, rgb(167 139 250 / 0.24) 45%, rgb(251 146 60 / 0.14) 75%, transparent)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Ambient color glows */}
      <div className="absolute -top-44 right-[-12%] size-[36rem] rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-[-10%] size-[32rem] rounded-full bg-brand-2/10 blur-3xl" />
      <div className="absolute right-[6%] top-[55%] size-80 rounded-full bg-mint/[0.08] blur-3xl" />

      {/* Grain */}
      <div className="grain-overlay absolute inset-0 opacity-[0.045] dark:opacity-[0.07]" />

      {/* Drifting stars — positions & opacity are written by the rAF loop */}
      {stars.map((s, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="star-body absolute"
          style={{ left: `${s.left}%`, top: `${s.top}%`, color: s.color }}
        >
          <span
            className="star-glyph block"
            style={{ "--glow": `${s.glow}px`, "--blur": `${s.blur}px` } as CSSProperties}
          >
            <Glyph kind={s.glyph} size={s.size} />
          </span>
        </span>
      ))}
    </div>
  );
}
