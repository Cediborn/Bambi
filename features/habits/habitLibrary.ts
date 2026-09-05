/**
 * features/habits/habitLibrary.ts
 *
 * BAMBI's curated habit library. Every habit a user can add comes from
 * here — onboarding shows habits from the selected categories, and the
 * "+ New Habits" picker browses the full library category by category.
 *
 * Structure: category key → habits[]. Each habit carries light metadata
 * (difficulty, estimated minutes, frequency suitability) so the UI can
 * show a hint without the interface getting busy. Add, remove, or tweak
 * habits by editing the arrays below — nothing is hardcoded in the
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
 *  The library — 13 categories × ~30 curated habits                   *
 * ------------------------------------------------------------------ */

export const HABIT_LIBRARY: Record<string, LibraryHabit[]> = {
  /* ---------------- Study ---------------- */
  study: [
    { id: "study-01", category: "study", title: "Study one topic for 30 minutes", difficulty: "medium", minutes: 30, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "study-02", category: "study", title: "Review today's lecture notes", difficulty: "easy", minutes: 15, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-03", category: "study", title: "Review yesterday's material", difficulty: "easy", minutes: 10, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "study-04", category: "study", title: "Complete 5 practice questions", difficulty: "medium", minutes: 25, frequency: "daily", icon: "target", color: "#4F46E5" },
    { id: "study-05", category: "study", title: "Complete one past-question set", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "study-06", category: "study", title: "Summarize a topic in your own words", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#4F46E5" },
    { id: "study-07", category: "study", title: "Use active recall for one topic", difficulty: "medium", minutes: 20, frequency: "daily", icon: "brain", color: "#4F46E5" },
    { id: "study-08", category: "study", title: "Create flashcards", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-09", category: "study", title: "Review flashcards", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-10", category: "study", title: "Teach a concept to yourself", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "study-11", category: "study", title: "Study without your phone for 30 minutes", difficulty: "medium", minutes: 30, frequency: "daily", icon: "coffee", color: "#4F46E5" },
    { id: "study-12", category: "study", title: "Prepare tomorrow's study plan", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-13", category: "study", title: "Review mistakes from a previous quiz", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "study-14", category: "study", title: "Read one textbook section", difficulty: "medium", minutes: 30, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "study-15", category: "study", title: "Complete one assignment task", difficulty: "medium", minutes: 30, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-16", category: "study", title: "Start an assignment before the deadline", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "study-17", category: "study", title: "Organize study materials", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "study-18", category: "study", title: "Rewrite confusing notes", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#4F46E5" },
    { id: "study-19", category: "study", title: "Watch one educational lecture", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "book", color: "#4F46E5" },
    { id: "study-20", category: "study", title: "Take notes while studying", difficulty: "easy", minutes: 15, frequency: "daily", icon: "pencil", color: "#4F46E5" },
    { id: "study-21", category: "study", title: "Test yourself before checking answers", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "brain", color: "#4F46E5" },
    { id: "study-22", category: "study", title: "Study your weakest topic", difficulty: "hard", minutes: 30, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "study-23", category: "study", title: "Spend 20 minutes on difficult questions", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#4F46E5" },
    { id: "study-24", category: "study", title: "Review key formulas", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "brain", color: "#4F46E5" },
    { id: "study-25", category: "study", title: "Create a one-page topic summary", difficulty: "medium", minutes: 25, frequency: "weekly", icon: "palette", color: "#4F46E5" },
    { id: "study-26", category: "study", title: "Do a focused revision session", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "coffee", color: "#4F46E5" },
    { id: "study-27", category: "study", title: "Study at a consistent time", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#4F46E5" },
    { id: "study-28", category: "study", title: "Take a proper study break", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#4F46E5" },
    { id: "study-29", category: "study", title: "Review what you learned at the end of the day", difficulty: "easy", minutes: 10, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "study-30", category: "study", title: "Complete one small academic task", difficulty: "easy", minutes: 20, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
  ],

  /* ---------------- Fitness ---------------- */
  fitness: [
    { id: "fitness-01", category: "fitness", title: "Do a 20-minute workout", difficulty: "medium", minutes: 20, frequency: "daily", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-02", category: "fitness", title: "Do 30 push-ups", difficulty: "easy", minutes: 10, frequency: "daily", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-03", category: "fitness", title: "Go for a run", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#F97316" },
    { id: "fitness-04", category: "fitness", title: "Walk 5,000 steps", difficulty: "easy", minutes: 45, frequency: "daily", icon: "activity", color: "#F97316" },
    { id: "fitness-05", category: "fitness", title: "Stretch for 10 minutes", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#F97316" },
    { id: "fitness-06", category: "fitness", title: "Train legs", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-07", category: "fitness", title: "Train upper body", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-08", category: "fitness", title: "Do a mobility session", difficulty: "easy", minutes: 15, frequency: "daily", icon: "heart", color: "#F97316" },
    { id: "fitness-09", category: "fitness", title: "Practice a specific exercise", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#F97316" },
    { id: "fitness-10", category: "fitness", title: "Take a recovery day", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "heart", color: "#F97316" },
    { id: "fitness-11", category: "fitness", title: "Track a workout", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#F97316" },
    { id: "fitness-12", category: "fitness", title: "Do one set of pull-ups or rows", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-13", category: "fitness", title: "Hold a plank for 1 minute", difficulty: "easy", minutes: 5, frequency: "daily", icon: "target", color: "#F97316" },
    { id: "fitness-14", category: "fitness", title: "Do 20 squats", difficulty: "easy", minutes: 5, frequency: "daily", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-15", category: "fitness", title: "Go for a brisk walk after lunch", difficulty: "easy", minutes: 20, frequency: "daily", icon: "activity", color: "#F97316" },
    { id: "fitness-16", category: "fitness", title: "Try one new exercise", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "target", color: "#F97316" },
    { id: "fitness-17", category: "fitness", title: "Do a 10-minute HIIT session", difficulty: "hard", minutes: 10, frequency: "weekly", icon: "activity", color: "#F97316" },
    { id: "fitness-18", category: "fitness", title: "Increase one weight or add reps", difficulty: "medium", minutes: 10, frequency: "weekly", icon: "target", color: "#F97316" },
    { id: "fitness-19", category: "fitness", title: "Practice proper form on one lift", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#F97316" },
    { id: "fitness-20", category: "fitness", title: "Do a core workout", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "dumbbell", color: "#F97316" },
    { id: "fitness-21", category: "fitness", title: "Take the stairs instead of the elevator", difficulty: "easy", minutes: 5, frequency: "daily", icon: "activity", color: "#F97316" },
    { id: "fitness-22", category: "fitness", title: "Plan your workouts for the week", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#F97316" },
    { id: "fitness-23", category: "fitness", title: "Do a cooldown after training", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#F97316" },
    { id: "fitness-24", category: "fitness", title: "Hit your protein target", difficulty: "easy", minutes: 5, frequency: "daily", icon: "droplet", color: "#F97316" },
    { id: "fitness-25", category: "fitness", title: "Do one balance exercise", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "target", color: "#F97316" },
    { id: "fitness-26", category: "fitness", title: "Run or walk one extra kilometer", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "activity", color: "#F97316" },
    { id: "fitness-27", category: "fitness", title: "Do 25 jumping jacks", difficulty: "easy", minutes: 3, frequency: "daily", icon: "activity", color: "#F97316" },
    { id: "fitness-28", category: "fitness", title: "Schedule rest into your week", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "clipboard-list", color: "#F97316" },
    { id: "fitness-29", category: "fitness", title: "Record your workout in a log", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#F97316" },
    { id: "fitness-30", category: "fitness", title: "Do a mobility flow before bed", difficulty: "easy", minutes: 10, frequency: "daily", icon: "moon", color: "#F97316" },
  ],

  /* ---------------- Mindfulness ---------------- */
  mindfulness: [
    { id: "mindfulness-01", category: "mindfulness", title: "Meditate for 10 minutes", difficulty: "easy", minutes: 10, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-02", category: "mindfulness", title: "Do one breathing exercise", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-03", category: "mindfulness", title: "Practice a body scan", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#8B5CF6" },
    { id: "mindfulness-04", category: "mindfulness", title: "Journal for 5 minutes", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#8B5CF6" },
    { id: "mindfulness-05", category: "mindfulness", title: "Notice three things you're grateful for", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#8B5CF6" },
    { id: "mindfulness-06", category: "mindfulness", title: "Take 5 mindful breaths before a meal", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-07", category: "mindfulness", title: "Do a walking meditation", difficulty: "easy", minutes: 15, frequency: "daily", icon: "activity", color: "#8B5CF6" },
    { id: "mindfulness-08", category: "mindfulness", title: "Practice mindful eating for one meal", difficulty: "easy", minutes: 20, frequency: "daily", icon: "heart", color: "#8B5CF6" },
    { id: "mindfulness-09", category: "mindfulness", title: "Sit in silence for 5 minutes", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#8B5CF6" },
    { id: "mindfulness-10", category: "mindfulness", title: "Write down one worry and let it go", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#8B5CF6" },
    { id: "mindfulness-11", category: "mindfulness", title: "Practice a loving-kindness meditation", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "heart", color: "#8B5CF6" },
    { id: "mindfulness-12", category: "mindfulness", title: "Do a progressive muscle relaxation", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#8B5CF6" },
    { id: "mindfulness-13", category: "mindfulness", title: "Name your emotions right now", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-14", category: "mindfulness", title: "Take a tech-free hour", difficulty: "medium", minutes: 60, frequency: "weekly", icon: "coffee", color: "#8B5CF6" },
    { id: "mindfulness-15", category: "mindfulness", title: "Listen to music with full attention", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "music", color: "#8B5CF6" },
    { id: "mindfulness-16", category: "mindfulness", title: "Do a guided meditation", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-17", category: "mindfulness", title: "Notice the present moment 5 times today", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#8B5CF6" },
    { id: "mindfulness-18", category: "mindfulness", title: "Practice mindful tea or coffee", difficulty: "easy", minutes: 10, frequency: "daily", icon: "coffee", color: "#8B5CF6" },
    { id: "mindfulness-19", category: "mindfulness", title: "Do a grounding exercise (5-4-3-2-1)", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-20", category: "mindfulness", title: "Reflect on one positive moment from today", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#8B5CF6" },
    { id: "mindfulness-21", category: "mindfulness", title: "Do yoga nidra for 15 minutes", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "moon", color: "#8B5CF6" },
    { id: "mindfulness-22", category: "mindfulness", title: "Practice non-judgmental observation", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-23", category: "mindfulness", title: "Write a short gratitude letter", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "pencil", color: "#8B5CF6" },
    { id: "mindfulness-24", category: "mindfulness", title: "Do one mindfulness stretch", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#8B5CF6" },
    { id: "mindfulness-25", category: "mindfulness", title: "Meditate right after waking up", difficulty: "easy", minutes: 10, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-26", category: "mindfulness", title: "Take three deep breaths before bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#8B5CF6" },
    { id: "mindfulness-27", category: "mindfulness", title: "Observe your thoughts without reacting", difficulty: "easy", minutes: 10, frequency: "daily", icon: "brain", color: "#8B5CF6" },
    { id: "mindfulness-28", category: "mindfulness", title: "Spend 10 minutes in nature mindfully", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "leaf", color: "#8B5CF6" },
    { id: "mindfulness-29", category: "mindfulness", title: "Practice patience with one situation", difficulty: "easy", minutes: 5, frequency: "daily", icon: "heart", color: "#8B5CF6" },
    { id: "mindfulness-30", category: "mindfulness", title: "End the day with a calm reflection", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#8B5CF6" },
  ],

  /* ---------------- Productivity ---------------- */
  productivity: [
    { id: "productivity-01", category: "productivity", title: "Plan tomorrow's top 3 tasks", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-02", category: "productivity", title: "Complete one important task first", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "productivity-03", category: "productivity", title: "Time-block your day", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-04", category: "productivity", title: "Do a 25-minute focus sprint", difficulty: "medium", minutes: 25, frequency: "daily", icon: "coffee", color: "#F59E0B" },
    { id: "productivity-05", category: "productivity", title: "Tidy your workspace for 5 minutes", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#F59E0B" },
    { id: "productivity-06", category: "productivity", title: "Clear your inbox to zero", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-07", category: "productivity", title: "Batch small tasks together", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-08", category: "productivity", title: "Write a to-do list for today", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#F59E0B" },
    { id: "productivity-09", category: "productivity", title: "Review and update your to-do list", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-10", category: "productivity", title: "Set one intention for the day", difficulty: "easy", minutes: 5, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "productivity-11", category: "productivity", title: "Do the hardest task first", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "productivity-12", category: "productivity", title: "Turn one big task into small steps", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-13", category: "productivity", title: "Close all unnecessary browser tabs", difficulty: "easy", minutes: 5, frequency: "daily", icon: "coffee", color: "#F59E0B" },
    { id: "productivity-14", category: "productivity", title: "Put your phone in another room during work", difficulty: "easy", minutes: 60, frequency: "daily", icon: "coffee", color: "#F59E0B" },
    { id: "productivity-15", category: "productivity", title: "Set a timer and do 10 minutes of admin", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-16", category: "productivity", title: "Plan your week on Sunday", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-17", category: "productivity", title: "Do a 5-minute end-of-day shutdown", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#F59E0B" },
    { id: "productivity-18", category: "productivity", title: "Delegate or say no to one thing", difficulty: "medium", minutes: 10, frequency: "weekly", icon: "users", color: "#F59E0B" },
    { id: "productivity-19", category: "productivity", title: "Track how you spend your time for one day", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "activity", color: "#F59E0B" },
    { id: "productivity-20", category: "productivity", title: "Prepare your workspace the night before", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#F59E0B" },
    { id: "productivity-21", category: "productivity", title: "Complete one task you've been avoiding", difficulty: "hard", minutes: 30, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "productivity-22", category: "productivity", title: "Use a checklist for a repetitive task", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-23", category: "productivity", title: "Schedule breaks into your day", difficulty: "easy", minutes: 5, frequency: "daily", icon: "heart", color: "#F59E0B" },
    { id: "productivity-24", category: "productivity", title: "Check email at set times only", difficulty: "easy", minutes: 10, frequency: "daily", icon: "coffee", color: "#F59E0B" },
    { id: "productivity-25", category: "productivity", title: "Make a decisions list", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "productivity-26", category: "productivity", title: "Do one quick win", difficulty: "easy", minutes: 15, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "productivity-27", category: "productivity", title: "Automate or simplify one repetitive task", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#F59E0B" },
    { id: "productivity-28", category: "productivity", title: "Review what you accomplished today", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#F59E0B" },
    { id: "productivity-29", category: "productivity", title: "Declutter one drawer or folder", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "leaf", color: "#F59E0B" },
    { id: "productivity-30", category: "productivity", title: "Write tomorrow's first task before bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#F59E0B" },
  ],

  /* ---------------- Sleep ---------------- */
  sleep: [
    { id: "sleep-01", category: "sleep", title: "Get into bed by 11 PM", difficulty: "medium", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-02", category: "sleep", title: "Stop using your phone 30 minutes before bed", difficulty: "medium", minutes: 30, frequency: "daily", icon: "coffee", color: "#0EA5E9" },
    { id: "sleep-03", category: "sleep", title: "Keep a consistent bedtime", difficulty: "medium", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-04", category: "sleep", title: "Wake up at the same time every day", difficulty: "medium", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-05", category: "sleep", title: "Start your bedtime routine at 10:30 PM", difficulty: "easy", minutes: 15, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-06", category: "sleep", title: "Dim the lights an hour before bed", difficulty: "easy", minutes: 60, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-07", category: "sleep", title: "Read a paper book before sleep", difficulty: "easy", minutes: 20, frequency: "daily", icon: "book", color: "#0EA5E9" },
    { id: "sleep-08", category: "sleep", title: "Make your room cool and dark", difficulty: "easy", minutes: 10, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-09", category: "sleep", title: "Do a 10-minute wind-down routine", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#0EA5E9" },
    { id: "sleep-10", category: "sleep", title: "Avoid caffeine after 2 PM", difficulty: "easy", minutes: 5, frequency: "daily", icon: "coffee", color: "#0EA5E9" },
    { id: "sleep-11", category: "sleep", title: "Take a warm shower before bed", difficulty: "easy", minutes: 15, frequency: "daily", icon: "droplet", color: "#0EA5E9" },
    { id: "sleep-12", category: "sleep", title: "Write tomorrow's tasks down before bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#0EA5E9" },
    { id: "sleep-13", category: "sleep", title: "Do a short evening stretch", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#0EA5E9" },
    { id: "sleep-14", category: "sleep", title: "Listen to calm music or a sleep story", difficulty: "easy", minutes: 15, frequency: "daily", icon: "music", color: "#0EA5E9" },
    { id: "sleep-15", category: "sleep", title: "Avoid heavy meals before bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "heart", color: "#0EA5E9" },
    { id: "sleep-16", category: "sleep", title: "Use your bed only for sleep", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-17", category: "sleep", title: "Set a relaxing alarm tone", difficulty: "easy", minutes: 5, frequency: "daily", icon: "music", color: "#0EA5E9" },
    { id: "sleep-18", category: "sleep", title: "Practice 4-7-8 breathing in bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#0EA5E9" },
    { id: "sleep-19", category: "sleep", title: "Get morning sunlight within an hour of waking", difficulty: "easy", minutes: 10, frequency: "daily", icon: "leaf", color: "#0EA5E9" },
    { id: "sleep-20", category: "sleep", title: "Limit afternoon naps to 20 minutes", difficulty: "easy", minutes: 5, frequency: "daily", icon: "coffee", color: "#0EA5E9" },
    { id: "sleep-21", category: "sleep", title: "Keep your sleep schedule on weekends", difficulty: "medium", minutes: 5, frequency: "weekly", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-22", category: "sleep", title: "Do a 5-minute meditation before bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#0EA5E9" },
    { id: "sleep-23", category: "sleep", title: "Prepare your bedroom for sleep", difficulty: "easy", minutes: 10, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-24", category: "sleep", title: "Try falling asleep without screens tonight", difficulty: "hard", minutes: 30, frequency: "weekly", icon: "coffee", color: "#0EA5E9" },
    { id: "sleep-25", category: "sleep", title: "Track your sleep quality", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#0EA5E9" },
    { id: "sleep-26", category: "sleep", title: "Take a magnesium-rich snack before bed", difficulty: "easy", minutes: 5, frequency: "daily", icon: "droplet", color: "#0EA5E9" },
    { id: "sleep-27", category: "sleep", title: "Set a reminder for your bedtime", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#0EA5E9" },
    { id: "sleep-28", category: "sleep", title: "Do one relaxation exercise in bed", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#0EA5E9" },
    { id: "sleep-29", category: "sleep", title: "Put your alarm across the room", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#0EA5E9" },
    { id: "sleep-30", category: "sleep", title: "Reflect on one good thing before sleeping", difficulty: "easy", minutes: 5, frequency: "daily", icon: "leaf", color: "#0EA5E9" },
  ],

  /* ---------------- Focus ---------------- */
  focus: [
    { id: "focus-01", category: "focus", title: "Do deep work for 60 minutes", difficulty: "hard", minutes: 60, frequency: "weekly", icon: "coffee", color: "#14B8A6" },
    { id: "focus-02", category: "focus", title: "Do a 25-minute focus sprint", difficulty: "medium", minutes: 25, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-03", category: "focus", title: "Put your phone on airplane mode during work", difficulty: "medium", minutes: 60, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-04", category: "focus", title: "Work on one task without switching", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "focus-05", category: "focus", title: "Use the Pomodoro technique", difficulty: "easy", minutes: 30, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-06", category: "focus", title: "Turn off all notifications for an hour", difficulty: "easy", minutes: 60, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-07", category: "focus", title: "Protect your first 90 minutes of the day", difficulty: "hard", minutes: 90, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "focus-08", category: "focus", title: "Do a single-tasking session", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "focus-09", category: "focus", title: "Write down distracting thoughts, then refocus", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#14B8A6" },
    { id: "focus-10", category: "focus", title: "Use noise-cancelling headphones or focus music", difficulty: "easy", minutes: 30, frequency: "daily", icon: "music", color: "#14B8A6" },
    { id: "focus-11", category: "focus", title: "Set a daily focus goal", difficulty: "easy", minutes: 5, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "focus-12", category: "focus", title: "Take a short walk to reset attention", difficulty: "easy", minutes: 10, frequency: "daily", icon: "activity", color: "#14B8A6" },
    { id: "focus-13", category: "focus", title: "Review your focus score at the end of the day", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#14B8A6" },
    { id: "focus-14", category: "focus", title: "Batch similar tasks together", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "clipboard-list", color: "#14B8A6" },
    { id: "focus-15", category: "focus", title: "Clear your workspace of distractions", difficulty: "easy", minutes: 10, frequency: "daily", icon: "leaf", color: "#14B8A6" },
    { id: "focus-16", category: "focus", title: "Practice active listening for one conversation", difficulty: "easy", minutes: 15, frequency: "daily", icon: "users", color: "#14B8A6" },
    { id: "focus-17", category: "focus", title: "Read for 10 minutes without checking your phone", difficulty: "easy", minutes: 10, frequency: "daily", icon: "book", color: "#14B8A6" },
    { id: "focus-18", category: "focus", title: "Do one task with your full attention", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "focus-19", category: "focus", title: "Set a timer and beat your last focus session", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#14B8A6" },
    { id: "focus-20", category: "focus", title: "Take a 2-minute break every 25 minutes", difficulty: "easy", minutes: 2, frequency: "daily", icon: "heart", color: "#14B8A6" },
    { id: "focus-21", category: "focus", title: "Identify your peak focus hours", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "brain", color: "#14B8A6" },
    { id: "focus-22", category: "focus", title: "Schedule deep work in your calendar", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#14B8A6" },
    { id: "focus-23", category: "focus", title: "Avoid multitasking for one hour", difficulty: "medium", minutes: 60, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "focus-24", category: "focus", title: "Do a brain-dump to clear mental clutter", difficulty: "easy", minutes: 10, frequency: "daily", icon: "pencil", color: "#14B8A6" },
    { id: "focus-25", category: "focus", title: "Commit to one hour of distraction-free study", difficulty: "hard", minutes: 60, frequency: "weekly", icon: "book", color: "#14B8A6" },
    { id: "focus-26", category: "focus", title: "Do a 2-minute focus warm-up before starting", difficulty: "easy", minutes: 2, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "focus-27", category: "focus", title: "Reduce decision fatigue by planning ahead", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#14B8A6" },
    { id: "focus-28", category: "focus", title: "Practice returning to task after an interruption", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#14B8A6" },
    { id: "focus-29", category: "focus", title: "Listen to one long-form podcast with full attention", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "music", color: "#14B8A6" },
    { id: "focus-30", category: "focus", title: "Review your focus at the end of the day", difficulty: "easy", minutes: 5, frequency: "daily", icon: "moon", color: "#14B8A6" },
  ],

  /* ---------------- Work ---------------- */
  work: [
    { id: "work-01", category: "work", title: "Complete one important task", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#4F46E5" },
    { id: "work-02", category: "work", title: "Plan tomorrow's priorities", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-03", category: "work", title: "Organize your workspace", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "leaf", color: "#4F46E5" },
    { id: "work-04", category: "work", title: "Learn something related to your field", difficulty: "medium", minutes: 20, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "work-05", category: "work", title: "Update your portfolio", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "palette", color: "#4F46E5" },
    { id: "work-06", category: "work", title: "Work on your CV", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-07", category: "work", title: "Apply for an opportunity", difficulty: "hard", minutes: 30, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "work-08", category: "work", title: "Network with someone", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "work-09", category: "work", title: "Spend 30 minutes on a professional project", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#4F46E5" },
    { id: "work-10", category: "work", title: "Review your progress", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-11", category: "work", title: "Set one professional goal for the week", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "work-12", category: "work", title: "Follow up on an email", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-13", category: "work", title: "Research one company or role", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#4F46E5" },
    { id: "work-14", category: "work", title: "Prepare for an interview", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "target", color: "#4F46E5" },
    { id: "work-15", category: "work", title: "Take an online course or module", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "book", color: "#4F46E5" },
    { id: "work-16", category: "work", title: "Read one article in your field", difficulty: "easy", minutes: 15, frequency: "daily", icon: "book", color: "#4F46E5" },
    { id: "work-17", category: "work", title: "Improve one skill on your resume", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "medal", color: "#4F46E5" },
    { id: "work-18", category: "work", title: "Ask a colleague or mentor a question", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "work-19", category: "work", title: "Update your LinkedIn profile", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "work-20", category: "work", title: "Clean up your inbox", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-21", category: "work", title: "Prepare talking points for a meeting", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-22", category: "work", title: "Study someone successful in your field", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#4F46E5" },
    { id: "work-23", category: "work", title: "Document one achievement", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "pencil", color: "#4F46E5" },
    { id: "work-24", category: "work", title: "Create a weekly work plan", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
    { id: "work-25", category: "work", title: "Organize your files and folders", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "leaf", color: "#4F46E5" },
    { id: "work-26", category: "work", title: "Attend a webinar or industry event", difficulty: "medium", minutes: 45, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "work-27", category: "work", title: "Practice a work presentation", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "users", color: "#4F46E5" },
    { id: "work-28", category: "work", title: "Send a thank-you or appreciation note", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "heart", color: "#4F46E5" },
    { id: "work-29", category: "work", title: "Reflect on your strengths", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#4F46E5" },
    { id: "work-30", category: "work", title: "Set up a daily work routine", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#4F46E5" },
  ],

  /* ---------------- Social ---------------- */
  social: [
    { id: "social-01", category: "social", title: "Reach out to a friend", difficulty: "easy", minutes: 10, frequency: "daily", icon: "users", color: "#EC4899" },
    { id: "social-02", category: "social", title: "Call a family member", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-03", category: "social", title: "Make plans with someone this week", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-04", category: "social", title: "Send a thoughtful message to someone", difficulty: "easy", minutes: 5, frequency: "daily", icon: "users", color: "#EC4899" },
    { id: "social-05", category: "social", title: "Ask someone how they're really doing", difficulty: "easy", minutes: 5, frequency: "daily", icon: "heart", color: "#EC4899" },
    { id: "social-06", category: "social", title: "Compliment someone genuinely", difficulty: "easy", minutes: 5, frequency: "daily", icon: "heart", color: "#EC4899" },
    { id: "social-07", category: "social", title: "Invite someone to do something", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-08", category: "social", title: "Reconnect with an old friend", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-09", category: "social", title: "Listen fully to someone without interrupting", difficulty: "easy", minutes: 15, frequency: "daily", icon: "heart", color: "#EC4899" },
    { id: "social-10", category: "social", title: "Say yes to a social invitation", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-11", category: "social", title: "Be the first to say hello", difficulty: "easy", minutes: 5, frequency: "daily", icon: "users", color: "#EC4899" },
    { id: "social-12", category: "social", title: "Share something personal with someone you trust", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "heart", color: "#EC4899" },
    { id: "social-13", category: "social", title: "Write a thank-you note", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "pencil", color: "#EC4899" },
    { id: "social-14", category: "social", title: "Introduce two people who should know each other", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-15", category: "social", title: "Spend quality time with someone you care about", difficulty: "medium", minutes: 60, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-16", category: "social", title: "Put your phone away during a conversation", difficulty: "easy", minutes: 30, frequency: "daily", icon: "coffee", color: "#EC4899" },
    { id: "social-17", category: "social", title: "Ask someone for their opinion", difficulty: "easy", minutes: 5, frequency: "daily", icon: "users", color: "#EC4899" },
    { id: "social-18", category: "social", title: "Support a friend's goal", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "heart", color: "#EC4899" },
    { id: "social-19", category: "social", title: "Celebrate someone's win", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "heart", color: "#EC4899" },
    { id: "social-20", category: "social", title: "Join a group or community event", difficulty: "medium", minutes: 60, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-21", category: "social", title: "Have a conversation without checking your phone", difficulty: "easy", minutes: 20, frequency: "daily", icon: "coffee", color: "#EC4899" },
    { id: "social-22", category: "social", title: "Remember and follow up on something someone told you", difficulty: "easy", minutes: 5, frequency: "daily", icon: "brain", color: "#EC4899" },
    { id: "social-23", category: "social", title: "Practice active listening in one conversation", difficulty: "easy", minutes: 15, frequency: "daily", icon: "heart", color: "#EC4899" },
    { id: "social-24", category: "social", title: "Meet one new person", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-25", category: "social", title: "Offer help to someone", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "heart", color: "#EC4899" },
    { id: "social-26", category: "social", title: "Plan a group activity", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#EC4899" },
    { id: "social-27", category: "social", title: "Send a voice note to a friend", difficulty: "easy", minutes: 5, frequency: "daily", icon: "music", color: "#EC4899" },
    { id: "social-28", category: "social", title: "Visit someone in person", difficulty: "medium", minutes: 60, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "social-29", category: "social", title: "Express appreciation to a coworker", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "heart", color: "#EC4899" },
    { id: "social-30", category: "social", title: "Reflect on your closest relationships", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#EC4899" },
  ],

  /* ---------------- Football ---------------- */
  football: [
    { id: "football-01", category: "football", title: "Practice ball control for 20 minutes", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-02", category: "football", title: "Practice passing", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-03", category: "football", title: "Practice first touch", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-04", category: "football", title: "Practice shooting", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-05", category: "football", title: "Take 30 shots", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-06", category: "football", title: "Practice weak foot", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-07", category: "football", title: "Practice dribbling", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-08", category: "football", title: "Practice finishing", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-09", category: "football", title: "Practice crossing", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-10", category: "football", title: "Practice penalties", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-11", category: "football", title: "Watch and analyze one match", difficulty: "medium", minutes: 45, frequency: "weekly", icon: "book", color: "#22C55E" },
    { id: "football-12", category: "football", title: "Study one player's movement", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#22C55E" },
    { id: "football-13", category: "football", title: "Practice free kicks", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-14", category: "football", title: "Practice ball juggling", difficulty: "easy", minutes: 10, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-15", category: "football", title: "Complete a football conditioning session", difficulty: "hard", minutes: 30, frequency: "weekly", icon: "activity", color: "#22C55E" },
    { id: "football-16", category: "football", title: "Stretch after training", difficulty: "easy", minutes: 10, frequency: "daily", icon: "heart", color: "#22C55E" },
    { id: "football-17", category: "football", title: "Practice heading", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-18", category: "football", title: "Do cone drills", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "activity", color: "#22C55E" },
    { id: "football-19", category: "football", title: "Practice 1v1 moves", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-20", category: "football", title: "Work on speed and agility", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "activity", color: "#22C55E" },
    { id: "football-21", category: "football", title: "Review your last match or training", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#22C55E" },
    { id: "football-22", category: "football", title: "Learn one new skill move", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-23", category: "football", title: "Practice set pieces", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-24", category: "football", title: "Do a passing accuracy drill", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-25", category: "football", title: "Watch a tutorial on one technique", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "book", color: "#22C55E" },
    { id: "football-26", category: "football", title: "Work on positioning without the ball", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "brain", color: "#22C55E" },
    { id: "football-27", category: "football", title: "Practice receiving on the half-turn", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#22C55E" },
    { id: "football-28", category: "football", title: "Do a wall-passing session", difficulty: "easy", minutes: 15, frequency: "daily", icon: "target", color: "#22C55E" },
    { id: "football-29", category: "football", title: "Set a training goal for the week", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#22C55E" },
    { id: "football-30", category: "football", title: "Practice throw-ins and long balls", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#22C55E" },
  ],

  /* ---------------- Coding ---------------- */
  coding: [
    { id: "coding-01", category: "coding", title: "Code for 30 minutes", difficulty: "medium", minutes: 30, frequency: "daily", icon: "activity", color: "#14B8A6" },
    { id: "coding-02", category: "coding", title: "Solve one programming problem", difficulty: "medium", minutes: 30, frequency: "daily", icon: "target", color: "#14B8A6" },
    { id: "coding-03", category: "coding", title: "Learn one programming concept", difficulty: "easy", minutes: 20, frequency: "daily", icon: "book", color: "#14B8A6" },
    { id: "coding-04", category: "coding", title: "Build one small feature", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-05", category: "coding", title: "Fix one bug", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-06", category: "coding", title: "Read documentation", difficulty: "easy", minutes: 15, frequency: "daily", icon: "book", color: "#14B8A6" },
    { id: "coding-07", category: "coding", title: "Refactor one piece of code", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#14B8A6" },
    { id: "coding-08", category: "coding", title: "Review yesterday's code", difficulty: "easy", minutes: 10, frequency: "daily", icon: "clipboard-list", color: "#14B8A6" },
    { id: "coding-09", category: "coding", title: "Practice a data structure", difficulty: "medium", minutes: 25, frequency: "weekly", icon: "brain", color: "#14B8A6" },
    { id: "coding-10", category: "coding", title: "Practice algorithms", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "brain", color: "#14B8A6" },
    { id: "coding-11", category: "coding", title: "Build a mini project", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-12", category: "coding", title: "Commit your work", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#14B8A6" },
    { id: "coding-13", category: "coding", title: "Read another developer's code", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "book", color: "#14B8A6" },
    { id: "coding-14", category: "coding", title: "Write a unit test", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-15", category: "coding", title: "Write a small script to automate something", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#14B8A6" },
    { id: "coding-16", category: "coding", title: "Practice typing or shortcuts", difficulty: "easy", minutes: 10, frequency: "daily", icon: "coffee", color: "#14B8A6" },
    { id: "coding-17", category: "coding", title: "Review a pull request", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "users", color: "#14B8A6" },
    { id: "coding-18", category: "coding", title: "Write clear comments in your code", difficulty: "easy", minutes: 10, frequency: "daily", icon: "pencil", color: "#14B8A6" },
    { id: "coding-19", category: "coding", title: "Study one design pattern", difficulty: "medium", minutes: 25, frequency: "weekly", icon: "book", color: "#14B8A6" },
    { id: "coding-20", category: "coding", title: "Try a new tool or library", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "palette", color: "#14B8A6" },
    { id: "coding-21", category: "coding", title: "Rebuild something you made better", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-22", category: "coding", title: "Explain a concept you learned", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "users", color: "#14B8A6" },
    { id: "coding-23", category: "coding", title: "Set up your dev environment properly", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "clipboard-list", color: "#14B8A6" },
    { id: "coding-24", category: "coding", title: "Do a code challenge", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-25", category: "coding", title: "Read one chapter of a programming book", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "book", color: "#14B8A6" },
    { id: "coding-26", category: "coding", title: "Debug an issue systematically", difficulty: "hard", minutes: 30, frequency: "weekly", icon: "target", color: "#14B8A6" },
    { id: "coding-27", category: "coding", title: "Create a cheatsheet for a language or tool", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "pencil", color: "#14B8A6" },
    { id: "coding-28", category: "coding", title: "Contribute to open source", difficulty: "hard", minutes: 60, frequency: "weekly", icon: "users", color: "#14B8A6" },
    { id: "coding-29", category: "coding", title: "Document one project", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "clipboard-list", color: "#14B8A6" },
    { id: "coding-30", category: "coding", title: "Plan your next coding session", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#14B8A6" },
  ],

  /* ---------------- Photography ---------------- */
  photography: [
    { id: "photography-01", category: "photography", title: "Take 10 intentional photos", difficulty: "easy", minutes: 20, frequency: "daily", icon: "palette", color: "#0EA5E9" },
    { id: "photography-02", category: "photography", title: "Practice composition", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#0EA5E9" },
    { id: "photography-03", category: "photography", title: "Practice lighting", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-04", category: "photography", title: "Photograph one subject from different angles", difficulty: "easy", minutes: 20, frequency: "daily", icon: "target", color: "#0EA5E9" },
    { id: "photography-05", category: "photography", title: "Take one portrait", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "users", color: "#0EA5E9" },
    { id: "photography-06", category: "photography", title: "Shoot in manual mode", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "coffee", color: "#0EA5E9" },
    { id: "photography-07", category: "photography", title: "Practice framing", difficulty: "easy", minutes: 15, frequency: "daily", icon: "target", color: "#0EA5E9" },
    { id: "photography-08", category: "photography", title: "Edit one photograph", difficulty: "medium", minutes: 30, frequency: "daily", icon: "palette", color: "#0EA5E9" },
    { id: "photography-09", category: "photography", title: "Study one photography technique", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "book", color: "#0EA5E9" },
    { id: "photography-10", category: "photography", title: "Recreate a photography reference", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-11", category: "photography", title: "Photograph something ordinary creatively", difficulty: "easy", minutes: 15, frequency: "daily", icon: "leaf", color: "#0EA5E9" },
    { id: "photography-12", category: "photography", title: "Review your recent photos", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#0EA5E9" },
    { id: "photography-13", category: "photography", title: "Organize your photo library", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "leaf", color: "#0EA5E9" },
    { id: "photography-14", category: "photography", title: "Learn one new camera setting", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "book", color: "#0EA5E9" },
    { id: "photography-15", category: "photography", title: "Do a photo walk", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "activity", color: "#0EA5E9" },
    { id: "photography-16", category: "photography", title: "Practice with natural light", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-17", category: "photography", title: "Try black and white photography", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-18", category: "photography", title: "Practice the rule of thirds", difficulty: "easy", minutes: 15, frequency: "daily", icon: "target", color: "#0EA5E9" },
    { id: "photography-19", category: "photography", title: "Photograph a friend or family member", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "users", color: "#0EA5E9" },
    { id: "photography-20", category: "photography", title: "Experiment with one lens or focal length", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "coffee", color: "#0EA5E9" },
    { id: "photography-21", category: "photography", title: "Take a photo every hour today", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "target", color: "#0EA5E9" },
    { id: "photography-22", category: "photography", title: "Practice street photography", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "users", color: "#0EA5E9" },
    { id: "photography-23", category: "photography", title: "Create a photo series on one theme", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-24", category: "photography", title: "Back up your photos", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#0EA5E9" },
    { id: "photography-25", category: "photography", title: "Study one famous photographer's work", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#0EA5E9" },
    { id: "photography-26", category: "photography", title: "Shoot the same scene at different times", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "palette", color: "#0EA5E9" },
    { id: "photography-27", category: "photography", title: "Practice focusing techniques", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#0EA5E9" },
    { id: "photography-28", category: "photography", title: "Write a short caption for a photo", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "pencil", color: "#0EA5E9" },
    { id: "photography-29", category: "photography", title: "Print or share one of your best photos", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "users", color: "#0EA5E9" },
    { id: "photography-30", category: "photography", title: "Reflect on what makes a photo work", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#0EA5E9" },
  ],

  /* ---------------- Skills ---------------- */
  skills: [
    { id: "skills-01", category: "skills", title: "Practice a skill for 20 minutes", difficulty: "medium", minutes: 20, frequency: "daily", icon: "medal", color: "#F59E0B" },
    { id: "skills-02", category: "skills", title: "Learn one new technique", difficulty: "easy", minutes: 20, frequency: "daily", icon: "book", color: "#F59E0B" },
    { id: "skills-03", category: "skills", title: "Watch one tutorial", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "book", color: "#F59E0B" },
    { id: "skills-04", category: "skills", title: "Practice the weakest part of the skill", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "skills-05", category: "skills", title: "Review previous work", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "skills-06", category: "skills", title: "Try something outside your comfort zone", difficulty: "hard", minutes: 20, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "skills-07", category: "skills", title: "Repeat a difficult exercise", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "skills-08", category: "skills", title: "Teach someone what you've learned", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "users", color: "#F59E0B" },
    { id: "skills-09", category: "skills", title: "Record yourself practicing", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "palette", color: "#F59E0B" },
    { id: "skills-10", category: "skills", title: "Set a skill goal for the week", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "skills-11", category: "skills", title: "Break the skill into smaller parts", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "skills-12", category: "skills", title: "Practice with a metronome or timer", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "activity", color: "#F59E0B" },
    { id: "skills-13", category: "skills", title: "Study an expert in the skill", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#F59E0B" },
    { id: "skills-14", category: "skills", title: "Do a focused drill", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#F59E0B" },
    { id: "skills-15", category: "skills", title: "Practice slowly and carefully", difficulty: "medium", minutes: 20, frequency: "daily", icon: "heart", color: "#F59E0B" },
    { id: "skills-16", category: "skills", title: "Increase difficulty slightly", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "skills-17", category: "skills", title: "Get feedback from someone", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "users", color: "#F59E0B" },
    { id: "skills-18", category: "skills", title: "Watch yourself on video and analyze", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#F59E0B" },
    { id: "skills-19", category: "skills", title: "Practice for 5 minutes with full focus", difficulty: "easy", minutes: 5, frequency: "daily", icon: "coffee", color: "#F59E0B" },
    { id: "skills-20", category: "skills", title: "Keep a practice log", difficulty: "easy", minutes: 5, frequency: "daily", icon: "clipboard-list", color: "#F59E0B" },
    { id: "skills-21", category: "skills", title: "Learn the theory behind the skill", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#F59E0B" },
    { id: "skills-22", category: "skills", title: "Imitate a reference performance", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "skills-23", category: "skills", title: "Do a self-assessment", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#F59E0B" },
    { id: "skills-24", category: "skills", title: "Practice under mild pressure", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "skills-25", category: "skills", title: "Revisit a basic exercise to refresh form", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "heart", color: "#F59E0B" },
    { id: "skills-26", category: "skills", title: "Create a practice routine", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "clipboard-list", color: "#F59E0B" },
    { id: "skills-27", category: "skills", title: "Practice in a new environment", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "leaf", color: "#F59E0B" },
    { id: "skills-28", category: "skills", title: "Analyze one mistake and fix it", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "brain", color: "#F59E0B" },
    { id: "skills-29", category: "skills", title: "Set a target for the next session", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "target", color: "#F59E0B" },
    { id: "skills-30", category: "skills", title: "Celebrate one improvement", difficulty: "easy", minutes: 5, frequency: "weekly", icon: "heart", color: "#F59E0B" },
  ],

  /* ---------------- Art ---------------- */
  art: [
    { id: "art-01", category: "art", title: "Draw for 20 minutes", difficulty: "easy", minutes: 20, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-02", category: "art", title: "Paint for 20 minutes", difficulty: "medium", minutes: 20, frequency: "daily", icon: "palette", color: "#EC4899" },
    { id: "art-03", category: "art", title: "Practice shading", difficulty: "medium", minutes: 20, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-04", category: "art", title: "Practice proportions", difficulty: "medium", minutes: 20, frequency: "daily", icon: "target", color: "#EC4899" },
    { id: "art-05", category: "art", title: "Draw from observation", difficulty: "medium", minutes: 20, frequency: "daily", icon: "palette", color: "#EC4899" },
    { id: "art-06", category: "art", title: "Study one artwork", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "book", color: "#EC4899" },
    { id: "art-07", category: "art", title: "Try a new technique", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-08", category: "art", title: "Complete a small sketch", difficulty: "easy", minutes: 15, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-09", category: "art", title: "Practice color mixing", difficulty: "medium", minutes: 15, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-10", category: "art", title: "Draw without erasing", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "pencil", color: "#EC4899" },
    { id: "art-11", category: "art", title: "Recreate a reference", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-12", category: "art", title: "Work on an unfinished piece", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-13", category: "art", title: "Sketch from imagination", difficulty: "easy", minutes: 20, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-14", category: "art", title: "Practice perspective", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#EC4899" },
    { id: "art-15", category: "art", title: "Study light and shadow", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "book", color: "#EC4899" },
    { id: "art-16", category: "art", title: "Do a 5-minute gesture drawing", difficulty: "easy", minutes: 5, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-17", category: "art", title: "Experiment with a new material", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-18", category: "art", title: "Make a value study", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-19", category: "art", title: "Draw something small every day", difficulty: "easy", minutes: 15, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-20", category: "art", title: "Copy a masterwork to learn from it", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-21", category: "art", title: "Practice line quality", difficulty: "easy", minutes: 15, frequency: "daily", icon: "pencil", color: "#EC4899" },
    { id: "art-22", category: "art", title: "Do a self-portrait", difficulty: "medium", minutes: 30, frequency: "weekly", icon: "users", color: "#EC4899" },
    { id: "art-23", category: "art", title: "Fill a page with thumbnails", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "pencil", color: "#EC4899" },
    { id: "art-24", category: "art", title: "Practice drawing hands or faces", difficulty: "medium", minutes: 20, frequency: "weekly", icon: "target", color: "#EC4899" },
    { id: "art-25", category: "art", title: "Create a mini series on one theme", difficulty: "hard", minutes: 45, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-26", category: "art", title: "Photograph or organize your art", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "palette", color: "#EC4899" },
    { id: "art-27", category: "art", title: "Watch one art technique video", difficulty: "easy", minutes: 20, frequency: "weekly", icon: "book", color: "#EC4899" },
    { id: "art-28", category: "art", title: "Try blind contour drawing", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "pencil", color: "#EC4899" },
    { id: "art-29", category: "art", title: "Clean and prepare your art space", difficulty: "easy", minutes: 15, frequency: "weekly", icon: "leaf", color: "#EC4899" },
    { id: "art-30", category: "art", title: "Reflect on your recent art and set one goal", difficulty: "easy", minutes: 10, frequency: "weekly", icon: "brain", color: "#EC4899" },
  ],
};

/** Every habit in the library, flattened. */
export const ALL_LIBRARY_HABITS: LibraryHabit[] = Object.values(HABIT_LIBRARY).flat();