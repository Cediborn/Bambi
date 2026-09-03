/**
 * db/schema.ts — runtime validation for everything that crosses the
 * persistence boundary (localStorage, imported backups, and future
 * external/API data).
 *
 *   external data → parseState() → validated AppState
 *
 * Strategy: every field parses with a tolerant fallback, so one corrupt
 * slice never takes down the whole state — malformed entries are dropped
 * or reset to defaults while the rest of the data survives. Unknown keys
 * are stripped (a future-format field is normalized away rather than kept
 * half-understood — real format changes belong in db/migrations.ts), date
 * lists are deduplicated and sorted (a set, not an array), and domain
 * rules (mood 1..5, challenge days 1..365, schedule days 0..6) are
 * enforced here — the only place external data enters the app.
 * `parseState` never throws.
 *
 * Note: this module imports `initialState` from ./appState (defaults for
 * corrupted slices). Keep that direction — appState must never import the
 * schema, or the modules become circular.
 */
import { z } from "zod";
import type { AppState } from "@/types";
import { initialState } from "./appState";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_KEY_RE.test(value);
}

/** Dedupe + sort a list of date keys, silently dropping malformed entries. */
function normalizeDates(items: unknown[]): string[] {
  return [...new Set(items.filter(isDateKey))].sort();
}

/** Parse each item of an unknown array with `schema`, keeping only valid ones. */
function collectValid<T>(schema: z.ZodType<T>, items: unknown[]): T[] {
  const out: T[] = [];
  for (const item of items) {
    const parsed = schema.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** A list of date keys (deduped, sorted, malformed entries dropped). */
const dateList = z
  .array(z.unknown())
  .transform((items) => normalizeDates(items))
  .catch([]);

/** Tolerant array-of-records: each item is validated independently. */
const listOf = <T>(schema: z.ZodType<T>) =>
  z
    .array(z.unknown())
    .transform((items) => collectValid(schema, items))
    .catch([] as T[]);

/** Dedupe a list of records by a key — first occurrence wins. */
function uniqueBy<T>(key: (item: T) => string): (items: T[]) => T[] {
  return (items: T[]) => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of items) {
      const k = key(item);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  };
}

const profileSchema = z.object({
  name: z.string().catch(""),
  avatar: z.string().catch("fawn"),
  interests: z.array(z.string()).catch([]),
  onboardedAt: z.string().catch(""),
});

const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  schedule: z
    .array(z.number().int().min(0).max(6))
    .transform((days) => [...new Set(days)].sort((a, b) => a - b)),
  createdAt: z.string(),
});

const journalEntrySchema = z.object({
  id: z.string(),
  date: z.string().refine(isDateKey),
  mood: z.number().int().min(1).max(5),
  content: z.string(),
  createdAt: z.string(),
});

const focusSessionSchema = z.object({
  id: z.string(),
  date: z.string().refine(isDateKey),
  minutes: z.number().int().min(1),
  label: z.string().optional(),
  endedAt: z.string(),
});

const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  days: z.number().int().min(1).max(365),
  startedAt: z.string(),
  doneDates: dateList,
  xpReward: z.number().int().min(0),
  completedAt: z.string().optional(),
});

const visionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string(),
  createdAt: z.string(),
});

const reflectionSchema = z.object({
  id: z.string(),
  weekKey: z.string(),
  wentWell: z.string(),
  wentWrong: z.string(),
  win: z.string(),
  lesson: z.string(),
  nextWeek: z.string(),
  createdAt: z.string(),
});

const settingsSchema = z.object({
  theme: z.enum(["light", "dark"]).catch("light"),
  accent: z
    .enum(["violet", "emerald", "sky", "tangerine", "gold", "rose"])
    .catch("violet"),
  animatedBackground: z.boolean().catch(true),
  particles: z.boolean().catch(true),
  reduceMotion: z.boolean().catch(false),
  compactMode: z.boolean().catch(false),
  sounds: z.boolean().catch(false),
});

const appStateSchema = z.object({
  profile: profileSchema.nullable().catch(() => null),
  habits: listOf(habitSchema).transform(uniqueBy((h) => h.id)),
  completions: z.record(z.string(), dateList).catch({}),
  journal: listOf(journalEntrySchema).transform(uniqueBy((e) => e.date)),
  questsDone: dateList,
  tendedDates: dateList,
  freezeUsed: z.record(z.string(), dateList).catch({}),
  focus: listOf(focusSessionSchema),
  challenges: listOf(challengeSchema).transform(uniqueBy((c) => c.id)),
  vision: listOf(visionItemSchema),
  reflections: listOf(reflectionSchema).transform(uniqueBy((r) => r.weekKey)),
  settings: settingsSchema.catch(() => initialState().settings),
});

/**
 * Parse external data into a complete, valid AppState. Tolerant by design:
 * each slice falls back to defaults independently, so a corrupt field
 * never discards the rest of the user's data. Never throws.
 */
export function parseState(raw: unknown): AppState {
  const result = appStateSchema.safeParse(raw);
  if (result.success) return result.data;
  // Top-level garbage (not even an object) — start from a blank state.
  return initialState();
}
