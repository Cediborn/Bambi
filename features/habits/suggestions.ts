/**
 * Suggested habits for the new-habit flow, grouped by category.
 * Colors are drawn from HABIT_COLORS and icons from HABIT_ICONS so a
 * picked suggestion renders with the same styling as a hand-built habit.
 */
export interface HabitSuggestion {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SuggestionCategory {
  key: string;
  label: string;
  items: HabitSuggestion[];
}

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    key: "health",
    label: "Health",
    items: [
      { id: "drink-water", name: "Drink more water", icon: "droplet", color: "#22C55E" },
      { id: "sleep-early", name: "Sleep before 11 PM", icon: "moon", color: "#0EA5E9" },
    ],
  },
  {
    key: "fitness",
    label: "Fitness",
    items: [
      { id: "exercise", name: "Exercise", icon: "dumbbell", color: "#F97316" },
      { id: "go-for-walk", name: "Go for a walk", icon: "leaf", color: "#22C55E" },
    ],
  },
  {
    key: "learning",
    label: "Learning",
    items: [
      { id: "read-20", name: "Read for 20 minutes", icon: "book", color: "#4F46E5" },
      { id: "study-30", name: "Study for 30 minutes", icon: "book", color: "#8B5CF6" },
      { id: "practice-coding", name: "Practice coding", icon: "target", color: "#14B8A6" },
      { id: "review-notes", name: "Review class notes", icon: "clipboard-list", color: "#0EA5E9" },
    ],
  },
  {
    key: "productivity",
    label: "Productivity",
    items: [
      { id: "plan-tomorrow", name: "Plan tomorrow's tasks", icon: "clipboard-list", color: "#F59E0B" },
      { id: "limit-social", name: "Limit social media", icon: "coffee", color: "#F97316" },
    ],
  },
  {
    key: "self-care",
    label: "Self-care",
    items: [
      { id: "journal", name: "Journal", icon: "book", color: "#EC4899" },
      { id: "real-break", name: "Take a real break", icon: "heart", color: "#14B8A6" },
    ],
  },
  {
    key: "mindfulness",
    label: "Mindfulness",
    items: [
      { id: "meditate", name: "Meditate", icon: "brain", color: "#8B5CF6" },
      { id: "breathe", name: "5-minute breathing", icon: "brain", color: "#0EA5E9" },
    ],
  },
  {
    key: "personal-growth",
    label: "Personal growth",
    items: [
      { id: "learn-skill", name: "Learn a new skill", icon: "target", color: "#F59E0B" },
      { id: "practice-language", name: "Practice a language", icon: "music", color: "#EC4899" },
    ],
  },
];

/** Flatten every suggestion across categories, in display order. */
export function allSuggestions(): HabitSuggestion[] {
  return SUGGESTION_CATEGORIES.flatMap((c) => c.items);
}