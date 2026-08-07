/**
 * Rotating, deterministic messages — the greeting and quote change daily
 * (seeded by the date key) so a returning user never sees the same line
 * twice in a session, without any randomness at render time.
 */

/** A small hash so each date picks a different line deterministically. */
export function daySeed(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Time-of-day greeting, e.g. "Good afternoon". */
export function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Companion lines that pair with the greeting — rotate daily. */
const GREETING_LINES = [
  "Let's build on yesterday.",
  "Progress loves consistency.",
  "Another day, another step forward.",
  "Welcome back.",
  "Small steps, every day.",
  "The streak only knows today.",
  "Make today quietly count.",
  "One thing at a time.",
];

/** Daily companion line for the greeting. */
export function greetingLine(dateKey: string): string {
  return GREETING_LINES[daySeed(dateKey) % GREETING_LINES.length];
}

/** Calm, original reflections shown on the dashboard — rotate daily. */
const QUOTES = [
  "The garden grows one quiet morning at a time.",
  "Discipline is remembering what you want.",
  "Rest is part of the routine, not a break from it.",
  "You're not behind. You're just consistent.",
  "Small things, done daily, become the whole story.",
  "Progress is honesty with a schedule.",
  "Today's effort is tomorrow's evidence.",
  "Every streak is a promise kept to yourself.",
];

/** Daily quote for the dashboard. */
export function dailyQuote(dateKey: string): string {
  return QUOTES[daySeed(dateKey + ":q") % QUOTES.length];
}
