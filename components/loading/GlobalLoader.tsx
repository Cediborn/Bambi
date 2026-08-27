"use client";

import { BambiLogo } from "@/components/icons";
import { AirplaneLoader } from "./AirplaneLoader";
import { DynamicLoadingMessage } from "./DynamicLoadingMessage";

/**
 * GlobalLoader — BAMBI's branded boot sequence: wordmark, animated
 * airplane with clouds and speed lines, and a quiet loading message.
 * Shown only while the app genuinely initialises; BootGate fades it out.
 */
export function GlobalLoader() {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center overflow-hidden bg-bg">
      <div className="absolute inset-0">
        <AirplaneLoader />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <BambiLogo size={54} />
        <h1 className="font-display mt-4 text-2xl font-extrabold tracking-[0.28em] text-ink">
          BAMBI
        </h1>
      </div>

      <div className="relative z-10 mt-16">
        <DynamicLoadingMessage className="mt-4" />
      </div>
    </div>
  );
}
