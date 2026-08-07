/** Habit icon choices — glyphs live in components/icons.tsx (HabitGlyph). */
export interface HabitIconMeta {
  key: string;
  label: string;
}

export const HABIT_ICONS: HabitIconMeta[] = [
  { key: "book", label: "Study" },
  { key: "brain", label: "Mind" },
  { key: "dumbbell", label: "Fitness" },
  { key: "droplet", label: "Water" },
  { key: "heart", label: "Self-care" },
  { key: "moon", label: "Sleep" },
  { key: "music", label: "Music" },
  { key: "palette", label: "Creativity" },
  { key: "target", label: "Skill" },
  { key: "leaf", label: "Growth" },
  { key: "coffee", label: "Focus" },
];

export function habitIconLabel(key: string): string {
  return HABIT_ICONS.find((i) => i.key === key)?.label ?? "Habit";
}

/** Color choices available for a habit (foreground hex values). */
export const HABIT_COLORS: string[] = [
  "#4F46E5", // indigo
  "#8B5CF6", // violet
  "#EC4899", // rose
  "#F97316", // orange
  "#F59E0B", // amber
  "#22C55E", // green
  "#14B8A6", // teal
  "#0EA5E9", // sky
];

export function habitColor(key: string): string {
  return HABIT_COLORS.includes(key) ? key : HABIT_COLORS[0];
}
