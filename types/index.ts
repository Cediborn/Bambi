/**
 * BAMBI — domain types.
 *
 * These types describe the entire local data model. The data layer
 * (`db/`) is intentionally small and isolated so a remote backend
 * (e.g. Supabase) can be plugged in later without touching the UI.
 */

export interface Profile {
  name: string;
  /** Buddy avatar key — see components/ui/Avatar.tsx */
  avatar: string;
  /** Interests selected during onboarding, e.g. "study", "fitness" */
  interests: string[];
  onboardedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  /** Key into the habit icon set (see utils/habitMeta.ts) */
  icon: string;
  /** Hex color key, e.g. "#4F46E5" */
  color: string;
  /** Days of the week the habit is scheduled: 0 (Sunday) .. 6 (Saturday) */
  schedule: number[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  /** YYYY-MM-DD — one entry per day (upserted) */
  date: string;
  /** 1..5 mood scale (1 = tough, 5 = amazing) */
  mood: number;
  content: string;
  createdAt: string;
}

export type Theme = "light" | "dark";

/** Accent colors — see utils/theme.ts for the palette. */
export type AccentKey = "violet" | "emerald" | "sky" | "tangerine" | "gold" | "rose";

export interface Settings {
  theme: Theme;
  accent: AccentKey;
  /** Master switch for the animated night sky. */
  animatedBackground: boolean;
  /** Sparkle/star particles (distinct from the aurora + glows). */
  particles: boolean;
  /** Manual "reduce motion" — mirrors the OS-level preference. */
  reduceMotion: boolean;
  /** Tighter spacing across the whole interface. */
  compactMode: boolean;
  /** Tiny WebAudio feedback chimes. */
  sounds: boolean;
}

/** One completed focus (pomodoro) session. */
export interface FocusSession {
  id: string;
  /** YYYY-MM-DD the session ended */
  date: string;
  minutes: number;
  label?: string;
  endedAt: string;
}

/** A challenge (30-day or custom). */
export interface Challenge {
  id: string;
  title: string;
  /** Total days in the challenge. */
  days: number;
  startedAt: string;
  /** Dates (YYYY-MM-DD) the user checked in. */
  doneDates: string[];
  xpReward: number;
  /** Set when doneDates reaches `days` — XP granted exactly once. */
  completedAt?: string;
}

/** A vision-board item — a dream goal on a tinted tile. */
export interface VisionItem {
  id: string;
  text: string;
  category: string;
  createdAt: string;
}

/** Weekly reflection — one per week, upserted by weekKey. */
export interface Reflection {
  id: string;
  /** Monday of the week, YYYY-MM-DD */
  weekKey: string;
  wentWell: string;
  wentWrong: string;
  win: string;
  lesson: string;
  nextWeek: string;
  createdAt: string;
}

export interface AppState {
  profile: Profile | null;
  habits: Habit[];
  /** habitId -> list of completed dates ("YYYY-MM-DD") */
  completions: Record<string, string[]>;
  journal: JournalEntry[];
  /** Dates (YYYY-MM-DD) on which the daily quest was completed. */
  questsDone: string[];
  /** Dates (YYYY-MM-DD) on which the tree was tended (watered). */
  tendedDates: string[];
  /** habitId -> dates (YYYY-MM-DD) a streak freeze was applied to. A frozen
      date counts as completed for that habit's streak only. */
  freezeUsed: Record<string, string[]>;
  focus: FocusSession[];
  challenges: Challenge[];
  vision: VisionItem[];
  reflections: Reflection[];
  settings: Settings;
}

/* ---------- Auth ----------
   Kept separate from AppState on purpose: signing in or out must never
   touch the garden data itself. */

export type AuthMode = "guest" | "account";

/** Lightweight auth identity, persisted under its own key. */
export interface AuthState {
  mode: AuthMode;
  email?: string;
  userId?: string;
}
