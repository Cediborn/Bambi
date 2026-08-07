"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { BoltIcon, PauseIcon, PlayIcon, RestartIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { todayKey } from "@/utils/dates";

type Mode = "focus" | "short" | "long";

const MODES: Record<Mode, { label: string; minutes: number }> = {
  focus: { label: "Deep work", minutes: 25 },
  short: { label: "Short break", minutes: 5 },
  long: { label: "Long break", minutes: 15 },
};

const MODE_ORDER: Mode[] = ["focus", "short", "long"];

export function PomodoroTimer() {
  const { api } = useApp();
  const sounds = useSounds();
  const today = todayKey();

  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [toast, setToast] = useState(false);

  // Mirror of secondsLeft for reads inside the async tick.
  const secondsRef = useRef(MODES.focus.minutes * 60);
  // Ensure a finished focus round is logged exactly once.
  const loggedRef = useRef(false);

  const total = MODES[mode].minutes * 60;
  const progress = 1 - secondsLeft / total;

  // Tick once per second while running; finish + log inside the callback.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      secondsRef.current = Math.max(0, secondsRef.current - 1);
      setSecondsLeft(secondsRef.current);
      if (secondsRef.current === 0) {
        window.clearInterval(id);
        setRunning(false);
        if (mode === "focus" && !loggedRef.current) {
          loggedRef.current = true;
          api.addFocusSession(today, MODES.focus.minutes);
          sounds.complete();
          setToast(true);
          window.setTimeout(() => setToast(false), 2500);
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, mode, today, api, sounds]);

  const resetTimer = (nextMode: Mode) => {
    secondsRef.current = MODES[nextMode].minutes * 60;
    setSecondsLeft(secondsRef.current);
    setRunning(false);
    loggedRef.current = false;
    setToast(false);
  };

  const selectMode = (m: Mode) => {
    if (m === mode && secondsLeft === 0) {
      resetTimer(m);
      return;
    }
    setMode(m);
    resetTimer(m);
  };

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <Card tone="sky" size="featured" className="flex flex-col items-center text-center">
      {/* Mode picker */}
      <div role="group" aria-label="Timer mode" className="flex rounded-full border border-line bg-surface p-1 dark:border-white/[0.08]">
        {MODE_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => selectMode(m)}
            className={[
              "rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              mode === m
                ? "bg-brand text-white shadow-card"
                : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="mt-8">
        <ProgressRing progress={progress} size={200} stroke={10} tone="text-brand">
          <div className="text-center">
            <p className="font-mono text-5xl font-bold tabular-nums tracking-tight text-ink">
              {mm}:{ss}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {running ? MODES[mode].label : secondsLeft === 0 ? "Round complete" : "Ready when you are"}
            </p>
          </div>
        </ProgressRing>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => resetTimer(mode)}
          aria-label="Reset timer"
          icon={<RestartIcon size={18} />}
        >
          Reset
        </Button>
        <Button
          size="lg"
          onClick={() => {
            if (secondsLeft === 0) resetTimer(mode);
            setRunning((r) => !r);
          }}
          icon={running ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        >
          {running ? "Pause" : secondsLeft === 0 ? "Start again" : "Start"}
        </Button>
      </div>

      {toast ? (
        <p className="animate-fade-in mt-5 inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1.5 text-sm font-bold text-good">
          <BoltIcon size={14} />
          +{MODES.focus.minutes} min of deep work logged
        </p>
      ) : null}
    </Card>
  );
}
