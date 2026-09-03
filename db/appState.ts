import type {
  AppState,
  Challenge,
  FocusSession,
  Habit,
  JournalEntry,
  Profile,
  Reflection,
  Settings,
  Theme,
  VisionItem,
} from "@/types";
import { todayKey } from "@/utils/dates";
import { uid } from "@/utils/ids";

/**
 * Pure state logic for BAMBI.
 * The UI only ever dispatches actions — swap target note: this module is
 * the seam where a remote backend (Supabase) would plug in, keeping the
 * UI layer untouched.
 */

export function initialState(): AppState {
  return {
    profile: null,
    habits: [],
    completions: {},
    journal: [],
    questsDone: [],
    tendedDates: [],
    freezeUsed: {},
    focus: [],
    challenges: [],
    vision: [],
    reflections: [],
    settings: {
      theme: "light",
      accent: "violet",
      animatedBackground: true,
      starDensity: "medium",
      particles: true,
      reduceMotion: false,
      compactMode: false,
      sounds: false,
    },
  };
}

export type AppAction =
  | { type: "profile/set"; profile: Profile }
  | { type: "profile/update"; patch: Partial<Pick<Profile, "name" | "avatar" | "interests">> }
  | { type: "habits/add"; habit: Habit }
  | { type: "habits/update"; id: string; patch: Partial<Pick<Habit, "name" | "icon" | "color" | "schedule">> }
  | { type: "habits/remove"; id: string }
  | { type: "completion/toggle"; habitId: string; date: string }
  | { type: "journal/upsert"; entry: JournalEntry }
  | { type: "journal/remove"; id: string }
  | { type: "quest/toggle"; date: string }
  | { type: "tree/tend"; date: string }
  | { type: "freeze/use"; habitId: string; date: string }
  | { type: "focus/add"; session: FocusSession }
  | { type: "focus/remove"; id: string }
  | { type: "challenges/add"; challenge: Challenge }
  | { type: "challenges/checkin"; id: string; date: string }
  | { type: "challenges/remove"; id: string }
  | { type: "vision/add"; item: VisionItem }
  | { type: "vision/remove"; id: string }
  | { type: "reflection/upsert"; reflection: Reflection }
  | { type: "settings/update"; patch: Partial<Settings> }
  | { type: "theme/set"; theme: Theme }
  | { type: "app/import"; state: AppState }
  | { type: "app/reset" };

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "profile/set":
      return { ...state, profile: action.profile };

    case "profile/update": {
      if (!state.profile) return state;
      return { ...state, profile: { ...state.profile, ...action.patch } };
    }

    case "habits/add":
      return { ...state, habits: [...state.habits, action.habit] };

    case "habits/update":
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.id ? { ...h, ...action.patch } : h)),
      };

    case "habits/remove": {
      const completions = { ...state.completions };
      delete completions[action.id];
      const freezeUsed = { ...state.freezeUsed };
      delete freezeUsed[action.id];
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.id),
        completions,
        freezeUsed,
      };
    }

    case "completion/toggle": {
      // Guard against orphaned records: never record completions for a
      // habit that doesn't exist (data integrity at the write boundary).
      if (!state.habits.some((h) => h.id === action.habitId)) return state;
      const dates = state.completions[action.habitId] ?? [];
      const done = dates.includes(action.date);
      const next = done ? dates.filter((d) => d !== action.date) : [...dates, action.date].sort();
      return {
        ...state,
        completions: { ...state.completions, [action.habitId]: next },
      };
    }

    case "journal/upsert": {
      const rest = state.journal.filter((e) => e.date !== action.entry.date);
      return { ...state, journal: [...rest, action.entry] };
    }

    case "journal/remove":
      return { ...state, journal: state.journal.filter((e) => e.id !== action.id) };

    case "quest/toggle": {
      const done = state.questsDone.includes(action.date);
      return {
        ...state,
        questsDone: done
          ? state.questsDone.filter((d) => d !== action.date)
          : [...state.questsDone, action.date],
      };
    }

    case "tree/tend": {
      const tended = state.tendedDates.includes(action.date);
      return {
        ...state,
        tendedDates: tended
          ? state.tendedDates.filter((d) => d !== action.date)
          : [...state.tendedDates, action.date].sort(),
      };
    }

    case "freeze/use": {
      // Only spend a freeze on a habit that exists.
      if (!state.habits.some((h) => h.id === action.habitId)) return state;
      const dates = state.freezeUsed[action.habitId] ?? [];
      if (dates.includes(action.date)) return state;
      return {
        ...state,
        freezeUsed: {
          ...state.freezeUsed,
          [action.habitId]: [...dates, action.date].sort(),
        },
      };
    }

    case "focus/add":
      return { ...state, focus: [...state.focus, action.session] };

    case "focus/remove":
      return { ...state, focus: state.focus.filter((s) => s.id !== action.id) };

    case "challenges/add":
      return { ...state, challenges: [...state.challenges, action.challenge] };

    case "challenges/checkin": {
      return {
        ...state,
        challenges: state.challenges.map((c) => {
          if (c.id !== action.id) return c;
          const doneDates = c.doneDates.includes(action.date)
            ? c.doneDates.filter((d) => d !== action.date)
            : [...c.doneDates, action.date];
          const completed = doneDates.length >= c.days;
          return {
            ...c,
            doneDates,
            completedAt: completed ? c.completedAt ?? new Date().toISOString() : undefined,
          };
        }),
      };
    }

    case "challenges/remove":
      return { ...state, challenges: state.challenges.filter((c) => c.id !== action.id) };

    case "vision/add":
      return { ...state, vision: [...state.vision, action.item] };

    case "vision/remove":
      return { ...state, vision: state.vision.filter((v) => v.id !== action.id) };

    case "reflection/upsert": {
      const rest = state.reflections.filter((r) => r.weekKey !== action.reflection.weekKey);
      return { ...state, reflections: [...rest, action.reflection] };
    }

    case "settings/update":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "theme/set":
      return { ...state, settings: { ...state.settings, theme: action.theme } };

    case "app/import":
      return action.state;

    case "app/reset":
      return initialState();

    default:
      return state;
  }
}

/** Build a new Habit from form input. */
export function createHabit(input: { name: string; icon: string; color: string; schedule: number[] }): Habit {
  return {
    id: uid(),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    schedule: input.schedule,
    createdAt: todayKey(),
  };
}

/** Build a JournalEntry for `date` (upserts over any existing entry that day). */
export function createJournalEntry(date: string, mood: number, content: string): JournalEntry {
  return {
    id: uid(),
    date,
    mood,
    content,
    createdAt: new Date().toISOString(),
  };
}

/** Build a FocusSession for `date`. */
export function createFocusSession(date: string, minutes: number, label?: string): FocusSession {
  return {
    id: uid(),
    date,
    minutes,
    label,
    endedAt: new Date().toISOString(),
  };
}

/** Build a Challenge. */
export function createChallenge(input: { title: string; days: number; xpReward: number }): Challenge {
  return {
    id: uid(),
    title: input.title.trim(),
    days: Math.min(365, Math.max(1, Math.round(input.days))),
    startedAt: new Date().toISOString(),
    doneDates: [],
    xpReward: input.xpReward,
  };
}

/** Build a VisionItem. */
export function createVisionItem(text: string, category: string): VisionItem {
  return {
    id: uid(),
    text: text.trim(),
    category,
    createdAt: new Date().toISOString(),
  };
}

/** Build a Reflection for a week (upserts over any existing entry that week). */
export function createReflection(weekKey: string, fields: Omit<Reflection, "id" | "weekKey" | "createdAt">): Reflection {
  return {
    id: uid(),
    weekKey,
    ...fields,
    createdAt: new Date().toISOString(),
  };
}
