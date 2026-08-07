"use client";

import { useEffect, useState } from "react";

const FALLBACKS = [
  "Growing your day…",
  "Still tending the garden…",
  "Getting everything ready…",
];

/**
 * DynamicLoadingMessage — quiet reassurance when a real load genuinely
 * takes a while. Nothing appears until `afterMs`, so fast loads never see
 * it; after that, short copy rotates slowly instead of a spinning wheel.
 */
export function DynamicLoadingMessage({
  afterMs = 2000,
  className = "",
}: {
  afterMs?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const first = window.setTimeout(() => setShow(true), afterMs);
    const rotate = window.setInterval(() => setStep((s) => (s + 1) % FALLBACKS.length), 2800);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(rotate);
    };
  }, [afterMs]);

  if (!show) return null;

  return (
    <p
      key={step}
      role="status"
      className={`animate-fade-up text-xs font-semibold text-ink-soft ${className}`}
    >
      {FALLBACKS[step]}
    </p>
  );
}
