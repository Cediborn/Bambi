/**
 * features/habits/habitLibrary.ts
 *
 * BAMBI's curated habit library. Every habit a user can add comes from
 * here — onboarding shows habits from the selected categories, and the
 * "+ New Habits" picker browses the full library category by category.
 *
 * Structure: category key → habits[]. Each category keeps its **5 most
 * important habits** — quality over quantity. Each habit carries light
 * metadata (difficulty, estimated minutes, frequency suitability) so the
 * UI can show a hint without the interface getting busy. Add, remove, or
 * tweak habits by editing the arrays below — nothing is hardcoded in the
 * visual components.
 */

/** All glyph keys HabitGlyph can render (mirrors components/icons.tsx). */
export const LIBRARY_GLYPHS = [
  "book",
  "brain",
  "dumbbell",
  "droplet",
  "heart",
  "moon",
  "music",
  "palette",
  "target",
  "coffee",
  "users",
  "clipboard-list",
  "wallet",
  "leaf",
  "compass",
  "activity",
  "medal",
  "pencil",
] as const;

export interface HabitCategory {
  key: string;
  label: string;
  /** Glyph key rendered via HabitGlyph on the category card. */
  glyph: string;
}

export type Difficulty = "easy" | "medium" | "hard";
export type Frequency = "daily" | "weekly";

export interface LibraryHabit {
  id: string;
  /** Category key (see HABIT_CATEGORIES). */
  category: string;
  title: string;
  difficulty: Difficulty;
  /** Estimated duration in minutes. */
  minutes: number;
  /** How often the habit suits being done. */
  frequency: Frequency;
  icon: string;
  color: string;
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  { key: "study", label: "Study", glyph: "book" },
  { key: "fitness", label: "Fitness", glyph: "dumbbell" },
  { key: "mindfulness", label: "Mindfulness", glyph: "brain" },
  { key: "productivity", label: "Productivity", glyph: "clipboard-list" },
  { key: "sleep", label: "Sleep", glyph: "moon" },
  { key: "focus", label: "Focus", glyph: "coffee" },
  { key: "work", label: "Work", glyph: "compass" },
  { key: "social", label: "Social", glyph: "users" },
  { key: "football", label: "Football", glyph: "target" },
  { key: "coding", label: "Coding", glyph: "activity" },
  { key: "photography", label: "Photography", glyph: "palette" },
  { key: "skills", label: "Skills", glyph: "medal" },
  { key: "art", label: "Art", glyph: "pencil" },
];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function categoryFor(key: string): HabitCategory | undefined {
  return HABIT_CATEGORIES.find((c) => c.key === key);
}

export function habitsFor(categoryKey: string): LibraryHabit[] {
  return HABIT_LIBRARY[categoryKey] ?? [];
}

/* ------------------------------------------------------------------ *
 *  Legacy interest mapping                                            *
 * ------------------------------------------------------------------ */

const LEGACY_KEY_MAP: Record<string, string> = {
  mind: "mindfulness",
  wellbeing: "mindfulness",
  "well-being": "mindfulness",
  wellness: "mindfulness",
};

/**
 * Maps any stored interest value to a current category key:
 * exact keys pass through, legacy keys ("mind", "wellbeing") are mapped,
 * and category labels ("Football", "Coding") are matched case-insensitively.
 * Returns null for anything that isn't a real category anymore.
 */
export function normalizeInterest(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (categoryFor(raw)) return raw;
  if (LEGACY_KEY_MAP[raw]) return LEGACY_KEY_MAP[raw];
  const lower = raw.toLowerCase();
  const byLabel = HABIT_CATEGORIES.find((c) => c.label.toLowerCase() === lower);
  return byLabel ? byLabel.key : null;
}

/** Normalizes a list of interests, dropping unknowns and duplicates. */
export function normalizeInterests(values: string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    const key = normalizeInterest(value);
    if (key && !out.includes(key)) out.push(key);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 *  Onboarding selection                                               *
 * ------------------------------------------------------------------ */

export interface StarterSelection {
  category: string;
  habits: LibraryHabit[];
}

/**
 * Habits offered on the onboarding picker, grouped by selected category
 * (in selection order). The user chooses what fits — BAMBI gives choices,
 * not instructions.
 */
export function onboardingSelections(interests: string[]): StarterSelection[] {
  return normalizeInterests(interests).map((key) => ({
    category: key,
    habits: habitsFor(key),
  }));
}

/* ------------------------------------------------------------------ *
 *  The library — 13 categories × 5 important habits each              *
 * ------------------------------------------------------------------ */

export const HABIT_LIBRARY: Record<string, LibraryHabit[]> = {
  /* ---------------- Study ---------------- */
  study: [
    { id: "study-01", category: "study", title: "Study one topic for 30 minutes", difficulty: "medium", minutes: 30, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "study-02", category: "study", title: "Review today's lecture notes", difficulty: "easy", minutes: 15, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-03", category: "study", title: "Complete 5 practice questions", difficulty: "medium", minutes: 25, frequency: "daily", icon: "target", color: "#4F46E5" },
    { id: "study-04", category: "study", title: "Use active recall for one topic", difficulty: "medium", minutes: 20, frequency: "daily", icon: "brain", color: "#4F46E5" },
    { id: "study-05", category: "study", title: "Prepare tomorrow's study plan", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
  ],

  /* ---------------- Fitness ---------------- */
  fitness: [
    { id: "fitness-01", category: "fitness", title: "Do a 20-minute workout", difficulty: "medium", minutes: 20, frequency: "daily", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-02", category: "fitness", title: "Do 30 push-ups", difficulty: "easy", minutes: 10, frequency: "daily", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-03", category: "fitness", title: "Go for a run", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#F97316" },
    { id: "fitness-04", category: "fitness", title: "Walk 5,000 steps", difficulty: "easy", minutes: 45, frequency: "daily", icon: "activity", color: "#F97316" },
    { id: "fitness-05", category: "fitness", title: "Stretch for 10 minutes", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#F97316" },
  ],

  /* ---------------- Mindfulness ---------------- */
  mindfulness: [
    { id: "mindfulness-01", category: "mindfulness", title: "Meditate for 10 minutes", difficulty: "easy", minutes: 10, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-02", category: "mindfulness", title: "Do one breathing exercise", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-03", category: "mindfulness", title: "Journal for 5 minutes", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#8B5CF6" },
    { id: "mindfulness-04", category: "mindfulness", title: "Notice three things you're grateful for", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#8B5CF6" },
    { id: "mindfulness-05", category: "mindfulness", title: "Practice a body scan", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#8B5CF6" },
  ],

  /* ---------------- Productivity ---------------- */
  productivity: [
    { id: "productivity-01", category: "productivity", title: "Plan tomorrow's top 3 tasks", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-02", category: "productivity", title: "Complete one important task first", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "productivity-03", category: "productivity", title: "Do a 25-minute focus sprint", difficulty: "medium", minutes: 25, frequency: "daily", icon: "coffee", color: "#F59E0B" },
    { id: "productivity-04", category: "productivity", title: "Time-block your day", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-05", category: "productivity", title: "Do a 5-minute end-of-day shutdown", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#F59E0B" },
  ],

  /* ---------------- Sleep ---------------- */
  sleep: [
    { id: "sleep-01", category: "sleep", title: "Get into bed by 11 PM", difficulty: "medium", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-02", category: "sleep", title: "Stop using your phone 30 minutes before bed", difficulty: "medium", minutes: 30, frequency: "daily", icon: "coffee", color: "#0EA5E9" },
    { id: "sleep-03", category: "sleep", title: "Keep a consistent bedtime", difficulty: "medium", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-04", category: "sleep", title: "Start your bedtime routine at 10:30 PM", difficulty: "easy", minutes: 15, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-05", category: "sleep", title: "Read a paper book before sleep", difficulty: "easy", minutes: 20, frequency: "daily", icon: "book", color: "#0EA5E9" },
  ],

  /* ---------------- Focus ---------------- */
  focus: [
    { id: "focus-01", category: "focus", title: "Do deep work for 60 minutes", difficulty: "hard", minutes: 60, frequency: "weekly", icon: "coffee", color: "#14B8A6" },
    { id: "focus-02", category: "focus", title: "Do a 25-minute focus sprint", difficulty: "medium", minutes: 25, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-03", category: "focus", title: "Put your phone on airplane mode during work", difficulty: "medium", minutes: 60, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-04", category: "focus", title: "Protect your first 90 minutes of the day", difficulty: "hard", minutes: 90, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-05", category: "focus", title: "Use the Pomodoro technique", difficulty: "easy", minutes: 30, frequency: "daily", icon: "coffee", color: "#14B8A6" },
  ],

  /* ---------------- Work ---------------- */
  work: [
    { id: "work-01", category: "work", title: "Complete one important task", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#4F46E5" },
    { id: "work-02", category: "work", title: "Plan tomorrow's priorities", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-03", category: "work", title: "Learn something related to your field", difficulty: "medium", minutes: 20, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "work-04", category: "work", title: "Network with someone", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "work-05", category: "work", title: "Work on your CV", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
  ],

  /* ---------------- Social ---------------- */
  social: [
    { id: "social-01", category: "social", title: "Reach out to a friend", difficulty: "easy", minutes: 10, frequency: "daily", icon: "users", color: "#EC4899" },
    { id: "social-02", category: "social", title: "Call a family member", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-03", category: "social", title: "Make plans with someone this week", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-04", category: "social", title: "Ask someone how they're really doing", difficulty: "easy", minutes: 5, frequency: "daily", icon: "heart", color: "#EC4899" },
    { id: "social-05", category: "social", title: "Send a thoughtful message to someone", difficulty: "easy", minutes: 5, frequency: "daily", icon: "users", color: "#EC4899" },
  ],

  /* ---------------- Football ---------------- */
  football: [
    { id: "football-01", category: "football", title: "Practice ball control for 20 minutes", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-02", category: "football", title: "Practice shooting", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-03", category: "football", title: "Practice passing", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-04", category: "football", title: "Practice weak foot", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-05", category: "football", title: "Practice ball juggling", difficulty: "easy", minutes: 10, frequency: "daily", icon: "target", color: "#22C55E" },
  ],

  /* ---------------- Coding ---------------- */
  coding: [
    { id: "coding-01", category: "coding", title: "Code for 30 minutes", difficulty: "medium", minutes: 30, frequency: "daily", icon: "activity", color: "#14B8A6" },
    { id: "coding-02", category: "coding", title: "Solve one programming problem", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "coding-03", category: "coding", title: "Learn one programming concept", difficulty: "easy", minutes: 20, frequency: "daily", icon: "book", color: "#14B8A6" },
    { id: "coding-04", category: "coding", title: "Build one small feature", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-05", category: "coding", title: "Fix one bug", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "target", color: "#14B8A6" },
  ],

  /* ---------------- Photography ---------------- */
  photography: [
    { id: "photography-01", category: "photography", title: "Take 10 intentional photos", difficulty: "easy", minutes: 20, frequency: "daily", icon: "palette", color: "#0EA5E9" },
    { id: "photography-02", category: "photography", title: "Practice composition", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#0EA5E9" },
    { id: "photography-03", category: "photography", title: "Practice lighting", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-04", category: "photography", title: "Shoot in manual mode", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "coffee", color: "#0EA5E9" },
    { id: "photography-05", category: "photography", title: "Edit one photograph", difficulty: "medium", minutes: 30, frequency: "daily", icon: "palette", color: "#0EA5E9" },
  ],

  /* ---------------- Skills ---------------- */
  skills: [
    { id: "skills-01", category: "skills", title: "Practice a skill for 20 minutes", difficulty: "medium", minutes: 20, frequency: "daily", icon: "medal", color: "#F59E0B" },
    { id: "skills-02", category: "skills", title: "Learn one new technique", difficulty: "easy", minutes: 20, frequency: "daily", icon: "book", color: "#F59E0B" },
    { id: "skills-03", category: "skills", title: "Watch one tutorial", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "book", color: "#F59E0B" },
    { id: "skills-04", category: "skills", title: "Practice the weakest part of the skill", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "skills-05", category: "skills", title: "Review previous work", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
  ],

  /* ---------------- Art ---------------- */
  art: [
    { id: "art-01", category: "art", title: "Draw for 20 minutes", difficulty: "easy", minutes: 20, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-02", category: "art", title: "Paint for 20 minutes", difficulty: "medium", minutes: 20, frequency: "daily", icon: "palette", color: "#EC4899" },
    { id: "art-03", category: "art", title: "Practice shading", difficulty: "medium", minutes: 20, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-04", category: "art", title: "Practice proportions", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#EC4899" },
    { id: "art-05", category: "art", title: "Draw from observation", difficulty: "medium", minutes: 20, frequency: "daily", icon: "palette", color: "#EC4899" },
  ],
};

/** Every habit in the library, flattened. */
export const ALL_LIBRARY_HABITS: LibraryHabit[] = Object.values(HABIT_LIBRARY).flat();