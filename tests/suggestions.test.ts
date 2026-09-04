import { describe, expect, it } from "vitest";
import { SUGGESTION_CATEGORIES, allSuggestions } from "@/features/habits/suggestions";
import { HABIT_COLORS } from "@/utils/habitMeta";

describe("suggested habits", () => {
  it("organizes suggestions into the expected categories", () => {
    expect(SUGGESTION_CATEGORIES.map((c) => c.label)).toEqual([
      "Health",
      "Fitness",
      "Learning",
      "Productivity",
      "Self-care",
      "Mindfulness",
      "Personal growth",
    ]);
  });

  it("gives every suggestion a unique id", () => {
    const ids = allSuggestions().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses colors from the habit palette", () => {
    for (const s of allSuggestions()) {
      expect(HABIT_COLORS).toContain(s.color);
    }
  });

  it("gives every suggestion a name and an icon", () => {
    for (const s of allSuggestions()) {
      expect(s.name.trim().length).toBeGreaterThan(0);
      expect(s.icon.trim().length).toBeGreaterThan(0);
    }
  });
});