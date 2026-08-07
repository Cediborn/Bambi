/**
 * Tiny synthesized sound effects — no audio files, ~2kb, generated with
 * the Web Audio API. Each chime is a short soft tone arpeggio. Callers
 * gate playback on the user's `settings.sounds` toggle (see hooks/useSounds).
 */

export type ChimeKind = "complete" | "quest" | "levelup" | "checkin" | "badge";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Schedule a soft sine tone. */
function tone(
  ac: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

const PATTERNS: Record<ChimeKind, Array<[freq: number, start: number, dur: number]>> = {
  /* A habit done: one quick pop. */
  complete: [[660, 0, 0.18]],
  /* Quest complete: a small rising pair. */
  quest: [
    [523.25, 0, 0.16],
    [783.99, 0.1, 0.22],
  ],
  /* Level up: a gentle three-note rise. */
  levelup: [
    [523.25, 0, 0.18],
    [659.25, 0.12, 0.18],
    [880, 0.24, 0.3],
  ],
  /* Mood checked in: two soft tones. */
  checkin: [
    [440, 0, 0.15],
    [587.33, 0.09, 0.2],
  ],
  /* Achievement unlocked: a bright little pair. */
  badge: [
    [880, 0, 0.14],
    [1174.66, 0.09, 0.26],
  ],
};

/** Play a chime. Returns immediately — never throws. */
export function playChime(kind: ChimeKind): void {
  try {
    const ac = getCtx();
    if (!ac) return;
    const now = ac.currentTime;
    for (const [freq, start, dur] of PATTERNS[kind]) {
      tone(ac, freq, now + start, dur, 0.05);
    }
  } catch {
    // Audio unavailable (rare) — feedback is a nicety, never an error.
  }
}
