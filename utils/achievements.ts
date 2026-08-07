import type { AppState } from "@/types";
import {
  completionsInLastDays,
  journalStreak,
  topStreak,
  totalCompletions,
} from "./streaks";
import { computeXp } from "./xp";
import { totalQuestsDone } from "./quests";

export type AchievementCategory =
  | "growth"
  | "habits"
  | "learning"
  | "journal"
  | "consistency"
  | "health"
  | "social"
  | "special";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** How close the user is (0..target). */
  progress: number;
  target: number;
  unlocked: boolean;
  category: AchievementCategory;
  /** Icon key used by the UI. */
  icon: "flame" | "trophy" | "bolt" | "target" | "pen" | "star" | "crown" | "book" | "leaf" | "medal" | "heart";
}

/** Order + copy for the grouped achievements page. */
export const ACHIEVEMENT_CATEGORIES: Array<{
  key: AchievementCategory;
  label: string;
  blurb: string;
}> = [
  { key: "growth", label: "Growth", blurb: "The long game — totals and XP." },
  { key: "habits", label: "Habits", blurb: "Building the structure." },
  { key: "consistency", label: "Consistency", blurb: "Showing up beats showing off." },
  { key: "learning", label: "Learning", blurb: "Focus and new skills." },
  { key: "journal", label: "Journal", blurb: "Writing things down." },
  { key: "health", label: "Health", blurb: "Body and mind, gently." },
  { key: "social", label: "Social", blurb: "For the people in your corner." },
  { key: "special", label: "Special", blurb: "The rare ones." },
];

type Rule = (state: AppState) => number;

interface Definition {
  id: string;
  title: string;
  description: string;
  icon: Achievement["icon"];
  category: AchievementCategory;
  target: number;
  value: Rule;
}

const CATALOG: Definition[] = [
  /* --- habits --- */
  {
    id: "first-step",
    title: "First step",
    description: "Complete your first goal.",
    icon: "target",
    category: "habits",
    target: 1,
    value: (s) => totalCompletions(s.completions),
  },
  {
    id: "habit-3",
    title: "Builder",
    description: "Create 3 habits.",
    icon: "book",
    category: "habits",
    target: 3,
    value: (s) => s.habits.length,
  },
  {
    id: "habit-5",
    title: "Collection",
    description: "Keep 5 habits alive at once.",
    icon: "book",
    category: "habits",
    target: 5,
    value: (s) => s.habits.length,
  },

  /* --- consistency --- */
  {
    id: "streak-3",
    title: "On a roll",
    description: "Keep any habit going for 3 days.",
    icon: "flame",
    category: "consistency",
    target: 3,
    value: (s) => topStreak(s.habits, s.completions, s.freezeUsed),
  },
  {
    id: "streak-7",
    title: "Full week",
    description: "Reach a 7-day streak on any habit.",
    icon: "flame",
    category: "consistency",
    target: 7,
    value: (s) => topStreak(s.habits, s.completions, s.freezeUsed),
  },
  {
    id: "streak-14",
    title: "Fortnight",
    description: "Keep a habit alive for 14 days straight.",
    icon: "crown",
    category: "consistency",
    target: 14,
    value: (s) => topStreak(s.habits, s.completions, s.freezeUsed),
  },
  {
    id: "streak-30",
    title: "Unbreakable",
    description: "A 30-day streak on any habit.",
    icon: "crown",
    category: "consistency",
    target: 30,
    value: (s) => topStreak(s.habits, s.completions, s.freezeUsed),
  },
  {
    id: "week-10",
    title: "Big week",
    description: "Complete 10 goals within 7 days.",
    icon: "trophy",
    category: "consistency",
    target: 10,
    value: (s) => completionsInLastDays(s.completions, 7),
  },
  {
    id: "quest-3",
    title: "Daily quests",
    description: "Complete 3 daily quests.",
    icon: "star",
    category: "consistency",
    target: 3,
    value: totalQuestsDone,
  },

  /* --- growth --- */
  {
    id: "goals-25",
    title: "Momentum",
    description: "Complete 25 goals in total.",
    icon: "bolt",
    category: "growth",
    target: 25,
    value: (s) => totalCompletions(s.completions),
  },
  {
    id: "goals-100",
    title: "Century club",
    description: "Complete 100 goals in total.",
    icon: "star",
    category: "growth",
    target: 100,
    value: (s) => totalCompletions(s.completions),
  },
  {
    id: "xp-100",
    title: "Rising",
    description: "Earn 100 XP.",
    icon: "bolt",
    category: "growth",
    target: 100,
    value: computeXp,
  },
  {
    id: "xp-300",
    title: "Unstoppable",
    description: "Earn 300 XP.",
    icon: "crown",
    category: "growth",
    target: 300,
    value: computeXp,
  },

  /* --- learning --- */
  {
    id: "focus-60",
    title: "Deep focus",
    description: "Log 60 minutes of focus sessions.",
    icon: "target",
    category: "learning",
    target: 60,
    value: (s) => s.focus.reduce((sum, f) => sum + f.minutes, 0),
  },
  {
    id: "focus-300",
    title: "Flow state",
    description: "Log 5 hours of focus sessions.",
    icon: "bolt",
    category: "learning",
    target: 300,
    value: (s) => s.focus.reduce((sum, f) => sum + f.minutes, 0),
  },

  /* --- journal --- */
  {
    id: "journal-1",
    title: "Reflect",
    description: "Write your first journal entry.",
    icon: "pen",
    category: "journal",
    target: 1,
    value: (s) => s.journal.length,
  },
  {
    id: "journal-7",
    title: "Journal keeper",
    description: "Write 7 journal entries.",
    icon: "pen",
    category: "journal",
    target: 7,
    value: (s) => s.journal.length,
  },
  {
    id: "journal-streak-3",
    title: "Clear mind",
    description: "Journal 3 days in a row.",
    icon: "leaf",
    category: "journal",
    target: 3,
    value: (s) => journalStreak(s.journal),
  },
  {
    id: "reflection-1",
    title: "Weekly review",
    description: "Write your first weekly reflection.",
    icon: "pen",
    category: "journal",
    target: 1,
    value: (s) => s.reflections.length,
  },

  /* --- health --- */
  {
    id: "mood-3",
    title: "In touch",
    description: "Log your mood 3 days in a row.",
    icon: "heart",
    category: "health",
    target: 3,
    value: (s) => journalStreak(s.journal),
  },

  /* --- special --- */
  {
    id: "challenge-1",
    title: "Commitment",
    description: "Complete a challenge.",
    icon: "medal",
    category: "special",
    target: 1,
    value: (s) => s.challenges.filter((c) => c.completedAt).length,
  },
];

/** Evaluate every achievement against the current state. */
export function evaluateAchievements(state: AppState): Achievement[] {
  return CATALOG.map((def) => {
    const value = def.value(state);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      progress: Math.min(value, def.target),
      target: def.target,
      unlocked: value >= def.target,
    };
  });
}

export function unlockedCount(state: AppState): number {
  return evaluateAchievements(state).filter((a) => a.unlocked).length;
}
