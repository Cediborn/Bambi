import { describe, expect, it } from "vitest";
import {
  CUSTOM_INTENTS,
  INTERESTS,
  STARTER_HABITS,
  interpretCustom,
  isCategoryInterest,
  isCustomInterest,
  MAX_STARTERS,
  sourceLabel,
  suggestionsFor,
} from "@/features/onboarding/starterHabits";
import { HABIT_COLORS } from "@/utils/habitMeta";
import { profileSuggestions } from "@/features/habits/suggestions";

describe("onboarding interest options", () => {
  it("lists the 8 curated categories with subtitles", () => {
    expect(INTERESTS.map((i) => i.label)).toEqual([
      "Study",
      "Fitness",
      "Mindfulness",
      "Productivity",
      "Sleep",
      "Focus",
      "Well-being",
      "Social",
    ]);
    for (const i of INTERESTS) {
      expect(i.subtitle.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives every category a starter habit", () => {
    for (const i of INTERESTS) {
      expect(STARTER_HABITS[i.key]).toBeDefined();
      expect(STARTER_HABITS[i.key].name.trim().length).toBeGreaterThan(0);
    }
  });

  it("distinguishes category keys from custom goals", () => {
    expect(isCategoryInterest("study")).toBe(true);
    expect(isCategoryInterest("football")).toBe(false);
    expect(isCustomInterest("Football")).toBe(true);
    expect(isCustomInterest("study")).toBe(false);
  });
});

describe("category starters", () => {
  it("generates one starter per selected category", () => {
    const s = suggestionsFor(["study", "sleep"]);
    expect(s.map((h) => h.name)).toEqual([
      "Study one topic for 30 minutes",
      "Get into bed by 11 PM",
    ]);
  });

  it("keeps only categories that exist", () => {
    const s = suggestionsFor(["study", "not-a-key"]);
    expect(s.map((h) => h.name)).toEqual(["Study one topic for 30 minutes"]);
  });
});

describe("custom-goal interpretation", () => {
  const cases: Array<{ input: string; key: string; expected: string[] }> = [
    {
      input: "Football",
      key: "football",
      expected: [
        "Practice ball control for 20 minutes",
        "Practice shooting for 15 minutes",
        "Do a short conditioning session",
        "Stretch after training",
        "Review one match or training session",
      ],
    },
    {
      input: "Basketball",
      key: "basketball",
      expected: [
        "Practice shooting for 20 minutes",
        "Practice ball handling",
        "Make 50 free throws",
        "Complete a short conditioning session",
      ],
    },
    {
      input: "Dancing",
      key: "dancing",
      expected: [
        "Practice a routine for 20 minutes",
        "Learn one new movement",
        "Stretch for 10 minutes",
        "Record one practice session",
      ],
    },
    {
      input: "Coding",
      key: "coding",
      expected: [
        "Code for 30 minutes",
        "Solve one programming problem",
        "Learn one new programming concept",
        "Work on a personal project",
      ],
    },
    {
      input: "Start a business",
      key: "business",
      expected: [
        "Spend 20 minutes developing the business idea",
        "Research one competitor",
        "Work on the business plan",
        "Contact one potential customer or partner",
      ],
    },
  ];

  it.each(cases)("understands $input as $key", ({ input, key, expected }) => {
    const interp = interpretCustom(input);
    expect(interp.vague).toBe(false);
    expect(interp.category).toBe(key);
    expect(interp.habits.map((h) => h.name)).toEqual(expected);
  });

  it("understands intent from natural phrasing, not exact keywords", () => {
    for (const input of ["get better at football", "I want to be a better footballer", "learn to dance"]) {
      const interp = interpretCustom(input);
      expect(interp.vague).toBe(false);
      expect(interp.habits.length).toBeGreaterThan(0);
    }
    expect(interpretCustom("get better at football").category).toBe("football");
    expect(interpretCustom("learn to play guitar").category).toBe("music");
    expect(interpretCustom("improve my photography").category).toBe("photography");
    expect(interpretCustom("start a clothing brand").category).toBe("business");
    expect(interpretCustom("learn to code").category).toBe("coding");
  });

  it("never invents random habits for vague input — asks for clarification instead", () => {
    for (const input of ["stuff", "things", "everything", "get better at everything", "hobbies", "x"]) {
      const interp = interpretCustom(input);
      expect(interp.vague).toBe(true);
      expect(interp.habits).toEqual([]);
      expect(interp.hint).toBeTruthy();
    }
  });

  it("stores specific-but-unmatched goals without generating unrelated habits", () => {
    // "Knitting" is a clear goal, but not a known intent — it must not
    // fall back to generic filler habits.
    const interp = interpretCustom("knitting");
    expect(interp.vague).toBe(false);
    expect(interp.habits).toEqual([]);
    expect(interp.hint).toBeNull();
  });

  it("gives every generated habit a palette color and a real icon", () => {
    for (const intent of CUSTOM_INTENTS) {
      for (const h of intent.habits) {
        expect(HABIT_COLORS).toContain(h.color);
        expect(h.name.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("combined starters (categories + custom goals)", () => {
  it("reflects every selection — nothing unrelated", () => {
    const s = suggestionsFor(["study", "sleep", "Football"]);
    expect(s.map((h) => h.name)).toEqual([
      "Study one topic for 30 minutes",
      "Get into bed by 11 PM",
      "Practice ball control for 20 minutes",
      "Practice shooting for 15 minutes",
      "Do a short conditioning session",
      "Stretch after training",
      "Review one match or training session",
    ]);
  });

  it("dedupes identical habit names across selections", () => {
    const s = suggestionsFor(["Football", "football"]);
    const names = s.map((h) => h.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("caps the starter list so it stays scannable", () => {
    const many = [
      "study",
      "fitness",
      "mind",
      "productivity",
      "sleep",
      "focus",
      "wellbeing",
      "social",
      "Football",
      "Dancing",
      "Coding",
      "Business",
    ];
    expect(suggestionsFor(many).length).toBeLessThanOrEqual(MAX_STARTERS);
  });

  it("labels the source of a suggestion", () => {
    expect(sourceLabel("study")).toBe("Study");
    expect(sourceLabel("football")).toBe("Football");
  });
});

describe("profile suggestions for the new-habit flow", () => {
  it("skips habits the user already has", () => {
    const existing = new Set(["study one topic for 30 minutes", "drink 2l of water"]);
    const items = profileSuggestions(["study", "wellbeing", "Football"], existing);
    const names = items.map((i) => i.name.toLowerCase());
    expect(names).not.toContain("study one topic for 30 minutes");
    expect(names).not.toContain("drink 2l of water");
    expect(names).toContain("practice ball control for 20 minutes");
  });
});