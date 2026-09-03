export interface InterestOption {
  key: string;
  label: string;
  /** Glyph key rendered via HabitGlyph. */
  glyph: string;
}

export const INTERESTS: InterestOption[] = [
  { key: "study", label: "Study", glyph: "book" },
  { key: "fitness", label: "Fitness", glyph: "dumbbell" },
  { key: "mind", label: "Mindfulness", glyph: "brain" },
  { key: "creativity", label: "Creativity", glyph: "palette" },
  { key: "sleep", label: "Sleep", glyph: "moon" },
  { key: "focus", label: "Focus", glyph: "coffee" },
  { key: "wellbeing", label: "Wellbeing", glyph: "heart" },
  { key: "social", label: "Social", glyph: "users" },
  { key: "organization", label: "Organization", glyph: "clipboard-list" },
  { key: "finance", label: "Finance", glyph: "wallet" },
];

export interface StarterHabit {
  name: string;
  icon: string;
  color: string;
  /** Which interest this suggestion is derived from. */
  from: string;
}

/** Suggested first habits, keyed by interest. */
export const STARTER_HABITS: Record<string, StarterHabit> = {
  study: { name: "Study session", icon: "book", color: "#4F46E5", from: "study" },
  fitness: { name: "Workout", icon: "dumbbell", color: "#F97316", from: "fitness" },
  mind: { name: "Meditate", icon: "brain", color: "#8B5CF6", from: "mind" },
  creativity: { name: "Create something", icon: "palette", color: "#EC4899", from: "creativity" },
  sleep: { name: "Wind down before 11pm", icon: "moon", color: "#0EA5E9", from: "sleep" },
  focus: { name: "Deep work hour", icon: "coffee", color: "#14B8A6", from: "focus" },
  wellbeing: { name: "Drink 2L of water", icon: "droplet", color: "#22C55E", from: "wellbeing" },
  social: { name: "Reach out to a friend", icon: "users", color: "#F59E0B", from: "social" },
  organization: { name: "Plan tomorrow", icon: "clipboard-list", color: "#6366F1", from: "organization" },
  finance: { name: "Track expenses", icon: "wallet", color: "#10B981", from: "finance" },
};

/** Suggestions derived from a set of interest keys (deduped). */
export function suggestionsFor(interests: string[]): StarterHabit[] {
  return interests
    .map((k) => STARTER_HABITS[k])
    .filter((h): h is StarterHabit => Boolean(h));
}
