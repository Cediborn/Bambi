"use client";

import { BambiLogo } from "@/components/icons";
import { TreeLoadingState } from "@/components/tree/TreeLoadingState";
import { DynamicLoadingMessage } from "./DynamicLoadingMessage";

/** Leaves drifting around the splash — every one has its own rhythm. */
const LEAVES: Array<{
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: number;
  opacity: number;
}> = [
  { left: "16%", top: "30%", delay: "0s", duration: "6.2s", size: 13, opacity: 0.7 },
  { left: "80%", top: "26%", delay: "0.9s", duration: "7.1s", size: 11, opacity: 0.55 },
  { left: "22%", top: "62%", delay: "1.6s", duration: "5.6s", size: 9, opacity: 0.6 },
  { left: "74%", top: "58%", delay: "0.4s", duration: "6.8s", size: 14, opacity: 0.5 },
  { left: "52%", top: "18%", delay: "2.1s", duration: "7.4s", size: 10, opacity: 0.65 },
  { left: "38%", top: "76%", delay: "1.2s", duration: "6s", size: 12, opacity: 0.5 },
];

/**
 * GlobalLoader — BAMBI's branded boot sequence: wordmark, a sprout that
 * grows into place, and a few leaves drifting on their own timers.
 * Shown only while the app genuinely initialises; BootGate fades it out.
 */
export function GlobalLoader() {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center overflow-hidden bg-bg">
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="animate-leaf-float pointer-events-none absolute"
          style={{
            left: leaf.left,
            top: leaf.top,
            opacity: leaf.opacity,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
          }}
        >
          <span
            className="block"
            style={{
              width: leaf.size,
              height: leaf.size,
              background: "linear-gradient(135deg, #45bd7d, #2b915d)",
              borderRadius: "0 100% 0 100%",
            }}
          />
        </span>
      ))}

      <div className="flex flex-col items-center">
        <BambiLogo size={54} />
        <h1 className="font-display mt-4 text-2xl font-extrabold tracking-[0.28em] text-ink">
          BAMBI
        </h1>
      </div>

      <div className="mt-2">
        <TreeLoadingState />
      </div>

      <DynamicLoadingMessage className="mt-4" />
    </div>
  );
}
