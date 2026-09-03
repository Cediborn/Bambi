import type { AppState } from "@/types";
import { XP_PER_QUEST } from "./xp";

/**
 * Daily Quest — one meaningful task generated per day.
 *
 * The quest is picked deterministically from a small, achievable pool
 * (seeded by the date), so the same task returns on the same day but the
 * rotation never feels mechanical. When the user has chosen interests at
 * onboarding, quests matching those interests get first pick — a study
 * streak won't keep drawing "meditate". Completion is stored as the date
 * in `state.questsDone`; XP is derived (see utils/xp).
 */

export interface Quest {
  id: string;
  title: string;
  hint: string;
  /** Icon key rendered via HabitGlyph. */
  icon: string;
  /** Interest keys (see features/onboarding/starterHabits.ts) this quest serves. */
  tags: string[];
  rewardXp: number;
}

const QUEST_POOL: Array<Omit<Quest, "rewardXp">> = [
  { id: "read", title: "Read 15 pages", hint: "Any book. Paper counts double.", icon: "book", tags: ["study", "mind"] },
  { id: "water", title: "Drink two liters of water", hint: "Small sips, all day long.", icon: "droplet", tags: ["wellbeing", "fitness"] },
  { id: "walk", title: "Walk outside for 20 minutes", hint: "No headphones needed.", icon: "dumbbell", tags: ["fitness", "wellbeing"] },
  { id: "meditate", title: "Meditate for 5 minutes", hint: "Just sit and breathe.", icon: "brain", tags: ["mind", "focus"] },
  { id: "journal", title: "Write one journal entry", hint: "Three honest sentences.", icon: "heart", tags: ["mind", "creativity"] },
  { id: "move", title: "Move your body for 15 minutes", hint: "Stretch, dance, anything.", icon: "target", tags: ["fitness"] },
  { id: "learn", title: "Learn one new thing", hint: "A page, a video, a question.", icon: "book", tags: ["study", "creativity"] },
  { id: "tidy", title: "Tidy one small corner", hint: "One desk. One drawer. Enough.", icon: "moon", tags: ["focus", "wellbeing"] },
  { id: "connect", title: "Message someone you miss", hint: "A line is plenty.", icon: "music", tags: ["wellbeing", "creativity", "social"] },
  { id: "sleep", title: "Wind down 30 minutes earlier", hint: "Screens away, lights low.", icon: "moon", tags: ["sleep", "wellbeing"] },
  { id: "sun", title: "Get 10 minutes of daylight", hint: "Step out, look up.", icon: "coffee", tags: ["wellbeing", "fitness"] },
  { id: "gratitude", title: "Name three good things", hint: "Write them down somewhere.", icon: "leaf", tags: ["mind", "wellbeing"] },
  { id: "social-checkin", title: "Check in with a friend", hint: "A quick hello counts.", icon: "users", tags: ["social", "wellbeing"] },
  { id: "plan-tomorrow", title: "Plan tomorrow's top 3 tasks", hint: "Write them before bed.", icon: "clipboard-list", tags: ["organization", "focus"] },
  { id: "track-spending", title: "Log today's spending", hint: "Every cent counts.", icon: "wallet", tags: ["finance"] },
  { id: "inbox-zero", title: "Clear one inbox or notification", hint: "Email, messages, anything.", icon: "clipboard-list", tags: ["organization"] },
  { id: "call-someone", title: "Call or voice-message someone", hint: "Hear a real voice.", icon: "users", tags: ["social"] },
  { id: "save-something", title: "Move $5 to savings", hint: "Small amounts add up.", icon: "wallet", tags: ["finance", "organization"] },
];

/** Deterministic hash so each date picks a stable quest. */
function daySeed(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * The quest assigned to a given date. When `interests` is provided, quests
 * tagged with those interests form a preferred pool; a matching quest is
 * drawn from it (still deterministically per date — rotation is now a
 * function of date × interests). Without interests — or if nothing
 * matches — the full pool is used.
 *
 * A too-narrow interest (e.g. only "sleep") is padded back up with general
 * quests so the rotation never collapses to a single task forever.
 */
export function dailyQuest(dateKey: string, interests: string[] = []): Quest {
  const full = QUEST_POOL;
  const relevant = interests.length
    ? full.filter((q) => q.tags.some((t) => interests.includes(t)))
    : [];
  const pool = relevant.length > 0 ? [...relevant] : [...full];
  // Guarantee variety: pad a narrow interest pool with general quests.
  if (pool.length < 4) {
    for (const q of full) {
      if (pool.length >= 4) break;
      if (!pool.some((p) => p.id === q.id)) pool.push(q);
    }
  }
  const base = pool[daySeed(dateKey) % pool.length];
  return { ...base, rewardXp: XP_PER_QUEST };
}

/** Has today's quest already been completed? */
export function isQuestDone(state: AppState, dateKey: string): boolean {
  return state.questsDone.includes(dateKey);
}

/** Total quests completed (all time) — used by achievements. */
export function totalQuestsDone(state: AppState): number {
  return state.questsDone.length;
}
