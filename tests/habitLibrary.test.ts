import { describe, expect, it } from "vitest";
import {
  ALL_LIBRARY_HABITS,
  DIFFICULTY_LABEL,
  HABIT_CATEGORIES,
  HABIT_LIBRARY,
  LIBRARY_GLYPHS,
  categoryFor,
  habitsFor,
  normalizeInterest,
  normalizeInterests,
  onboardingSelections,
} from "@/features/habits/habitLibrary";
import { HABIT_COLORS } from "@/utils/habitMeta";

describe("category structure", () => {
  it("lists exactly the 13 required categories in order", () => {
    expect(HABIT_CATEGORIES.map((c) => c.label)).toEqual([
      "Study",
      "Fitness",
      "Mindfulness",
      "Productivity",
      "Sleep",
      "Focus",
      "Work",
      "Social",
      "Football",
      "Coding",
      "Photography",
      "Skills",
      "Art",
    ]);
  });

  it("gives every category a unique key and a renderable glyph", () => {
    const keys = HABIT_CATEGORIES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of HABIT_CATEGORIES) {
      expect(LIBRARY_GLYPHS).toContain(c.glyph);
    }
  });

  it("has a habit entry for every category and nothing else", () => {
    expect(Object.keys(HABIT_LIBRARY).sort()).toEqual(
      HABIT_CATEGORIES.map((c) => c.key).sort()
    );
  });
});

describe("the curated library", () => {
  it("holds approximately 30 distinct habits per category", () => {
    for (const cat of HABIT_CATEGORIES) {
      const habits = HABIT_LIBRARY[cat.key];
      expect(habits.length).toBeGreaterThanOrEqual(28);
      expect(habits.length).toBeLessThanOrEqual(32);
    }
  });

  it("has unique ids and no duplicate titles within a category", () => {
    const ids = ALL_LIBRARY_HABITS.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const cat of HABIT_CATEGORIES) {
      const titles = HABIT_LIBRARY[cat.key].map((h) => h.title.toLowerCase());
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("keeps every habit's metadata valid", () => {
    for (const h of ALL_LIBRARY_HABITS) {
      expect(categoryFor(h.category)).toBeDefined();
      expect(h.id.startsWith(`${h.category}-`)).toBe(true);
      expect(LIBRARY_GLYPHS).toContain(h.icon);
      expect(HABIT_COLORS).toContain(h.color);
      expect(["easy", "medium", "hard"]).toContain(h.difficulty);
      expect(DIFFICULTY_LABEL[h.difficulty]).toBeTruthy();
      expect(["daily", "weekly"]).toContain(h.frequency);
      expect(h.minutes).toBeGreaterThan(0);
      expect(h.minutes).toBeLessThanOrEqual(90);
      expect(h.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("includes the exact exemplar habits from the spec", () => {
    const titles = (key: string) => new Set(HABIT_LIBRARY[key].map((h) => h.title));
    expect(titles("study")).toContain("Study one topic for 30 minutes");
    expect(titles("study")).toContain("Complete 5 practice questions");
    expect(titles("fitness")).toContain("Do a 20-minute workout");
    expect(titles("fitness")).toContain("Walk 5,000 steps");
    expect(titles("sleep")).toContain("Keep a consistent bedtime");
    expect(titles("sleep")).toContain("Stop using your phone 30 minutes before bed");
    expect(titles("football")).toContain("Practice ball control for 20 minutes");
    expect(titles("football")).toContain("Practice shooting");
    expect(titles("football")).toContain("Practice weak foot");
    expect(titles("football")).toContain("Practice ball juggling");
    expect(titles("coding")).toContain("Code for 30 minutes");
    expect(titles("coding")).toContain("Solve one programming problem");
    expect(titles("coding")).toContain("Learn one programming concept");
    expect(titles("coding")).toContain("Build one small feature");
    expect(titles("photography")).toContain("Take 10 intentional photos");
    expect(titles("photography")).toContain("Practice composition");
    expect(titles("photography")).toContain("Shoot in manual mode");
    expect(titles("art")).toContain("Draw for 20 minutes");
    expect(titles("art")).toContain("Practice shading");
    expect(titles("art")).toContain("Practice proportions");
    expect(titles("art")).toContain("Draw from observation");
    expect(titles("skills")).toContain("Practice a skill for 20 minutes");
    expect(titles("skills")).toContain("Practice the weakest part of the skill");
    expect(titles("work")).toContain("Complete one important task");
    expect(titles("work")).toContain("Work on your CV");
    expect(titles("work")).toContain("Update your portfolio");
  });

  it("keeps category libraries genuinely distinct, not generic filler", () => {
    // Football must not just reuse the generic fitness library.
    const football = new Set(HABIT_LIBRARY.football.map((h) => h.title));
    const fitness = new Set(HABIT_LIBRARY.fitness.map((h) => h.title));
    expect([...football].filter((t) => fitness.has(t))).toEqual([]);

    // Photography and Art stay their own thing too.
    const photography = new Set(HABIT_LIBRARY.photography.map((h) => h.title));
    const art = new Set(HABIT_LIBRARY.art.map((h) => h.title));
    expect([...photography].filter((t) => art.has(t))).toEqual([]);
  });

  it("exposes helpers for lookup", () => {
    expect(categoryFor("football")?.label).toBe("Football");
    expect(categoryFor("nope")).toBeUndefined();
    expect(habitsFor("football").length).toBe(HABIT_LIBRARY.football.length);
    expect(habitsFor("nope")).toEqual([]);
  });
});

describe("interest normalization", () => {
  it("passes current category keys through", () => {
    expect(normalizeInterest("study")).toBe("study");
    expect(normalizeInterest("football")).toBe("football");
  });

  it("maps legacy onboarding keys onto current categories", () => {
    expect(normalizeInterest("mind")).toBe("mindfulness");
    expect(normalizeInterest("wellbeing")).toBe("mindfulness");
    expect(normalizeInterest("well-being")).toBe("mindfulness");
  });

  it("matches category labels case-insensitively", () => {
    expect(normalizeInterest("Football")).toBe("football");
    expect(normalizeInterest("PHOTOGRAPHY")).toBe("photography");
    expect(normalizeInterest("Art")).toBe("art");
  });

  it("drops anything that is no longer a category", () => {
    expect(normalizeInterest("knitting")).toBeNull();
    expect(normalizeInterest("")).toBeNull();
    expect(normalizeInterest("   ")).toBeNull();
  });

  it("normalizes a list, deduping and keeping order", () => {
    expect(normalizeInterests(["study", "Study", "mind", "knitting"])).toEqual([
      "study",
      "mindfulness",
    ]);
  });
});

describe("onboarding selections", () => {
  it("groups full habit lists by selected category, in selection order", () => {
    const selections = onboardingSelections(["football", "sleep"]);
    expect(selections.map((s) => s.category)).toEqual(["football", "sleep"]);
    expect(selections[0].habits.length).toBe(HABIT_LIBRARY.football.length);
    expect(selections[1].habits.length).toBe(HABIT_LIBRARY.sleep.length);
    expect(selections[0].habits[0].title).toBe("Practice ball control for 20 minutes");
  });

  it("ignores unknown or legacy interests gracefully", () => {
    const selections = onboardingSelections(["study", "knitting", "wellbeing"]);
    expect(selections.map((s) => s.category)).toEqual(["study", "mindfulness"]);
  });

  it("returns nothing for empty selections", () => {
    expect(onboardingSelections([])).toEqual([]);
  });
});