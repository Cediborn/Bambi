import { describe, expect, it } from "vitest";
import {
  createChallenge,
  createFocusSession,
  createHabit,
  createJournalEntry,
  createReflection,
  createVisionItem,
  initialState,
  reducer,
  type AppAction,
} from "@/db/appState";
import {
  computeXp,
  XP_PER_ENTRY,
  XP_PER_QUEST,
  XP_PER_TEND,
} from "@/utils/xp";
import { freezesAvailable, habitStreak } from "@/utils/streaks";
import { parseState } from "@/db/schema";
import type { Settings } from "@/types";
import { daysAgo, makeHabit, makeState } from "./helpers";
import { todayKey } from "@/utils/dates";

const today = todayKey();

/** Apply a series of actions on top of a starting state. */
function run(state = makeState(), ...actions: AppAction[]) {
  return actions.reduce(reducer, state);
}

const habitInput = { name: "  Read  ", icon: "book", color: "#4F46E5", schedule: [1, 3, 5] };

describe("habits", () => {
  it("creates a habit with trimmed name and an id", () => {
    const state = run(makeState(), { type: "habits/add", habit: createHabit(habitInput) });
    expect(state.habits).toHaveLength(1);
    expect(state.habits[0].name).toBe("Read");
    expect(state.habits[0].id).toBeTruthy();
    expect(state.habits[0].createdAt).toBe(today);
  });

  it("updates a habit in place", () => {
    const h = makeHabit();
    const state = run(
      makeState({ habits: [h] }),
      { type: "habits/update", id: h.id, patch: { name: "Sketch", icon: "palette" } }
    );
    expect(state.habits[0]).toMatchObject({ id: h.id, name: "Sketch", icon: "palette" });
    expect(state.habits[0].color).toBe(h.color); // untouched
  });

  it("removes a habit and its completions and freezes", () => {
    const h = makeHabit();
    const state = run(
      makeState({
        habits: [h],
        completions: { [h.id]: [today], other: [today] },
        freezeUsed: { [h.id]: [daysAgo(1)], other: [daysAgo(1)] },
      }),
      { type: "habits/remove", id: h.id }
    );
    expect(state.habits).toHaveLength(0);
    expect(state.completions).toEqual({ other: [today] });
    expect(state.freezeUsed).toEqual({ other: [daysAgo(1)] });
  });

  it("ignores completions for a habit that no longer exists", () => {
    const state = run(makeState(), {
      type: "completion/toggle",
      habitId: "ghost",
      date: today,
    });
    expect(state.completions).toEqual({});
  });
});

describe("completions", () => {
  const h = makeHabit();

  it("toggles a date on and off", () => {
    const on = run(makeState({ habits: [h] }), {
      type: "completion/toggle",
      habitId: h.id,
      date: today,
    });
    expect(on.completions[h.id]).toEqual([today]);
    const off = reducer(on, { type: "completion/toggle", habitId: h.id, date: today });
    expect(off.completions[h.id]).toEqual([]);
  });

  it("prevents duplicates on a second toggle", () => {
    const state = run(
      makeState({ habits: [h] }),
      { type: "completion/toggle", habitId: h.id, date: today },
      { type: "completion/toggle", habitId: h.id, date: today }
    );
    expect(state.completions[h.id]).toEqual([]);
  });

  it("supports historical dates and keeps them sorted", () => {
    const state = run(
      makeState({ habits: [h] }),
      { type: "completion/toggle", habitId: h.id, date: daysAgo(10) },
      { type: "completion/toggle", habitId: h.id, date: today },
      { type: "completion/toggle", habitId: h.id, date: daysAgo(3) }
    );
    expect(state.completions[h.id]).toEqual([daysAgo(10), daysAgo(3), today].sort());
  });

  it("keeps habits independent", () => {
    const a = makeHabit({ id: "a" });
    const b = makeHabit({ id: "b" });
    const state = run(
      makeState({ habits: [a, b] }),
      { type: "completion/toggle", habitId: "a", date: today }
    );
    expect(state.completions).toEqual({ a: [today] });
  });
});

describe("journal", () => {
  it("creates an entry", () => {
    const state = run(makeState(), {
      type: "journal/upsert",
      entry: createJournalEntry(today, 4, "Good day"),
    });
    expect(state.journal).toHaveLength(1);
    expect(state.journal[0]).toMatchObject({ date: today, mood: 4, content: "Good day" });
  });

  it("upserts over the same date instead of duplicating", () => {
    const state = run(
      makeState(),
      { type: "journal/upsert", entry: createJournalEntry(today, 2, "Rough") },
      { type: "journal/upsert", entry: createJournalEntry(today, 5, "Turned around") }
    );
    expect(state.journal).toHaveLength(1);
    expect(state.journal[0].mood).toBe(5);
    expect(state.journal[0].content).toBe("Turned around");
  });

  it("removes an entry by id", () => {
    const entry = createJournalEntry(today, 3, "Meh");
    const state = run(
      makeState({ journal: [entry] }),
      { type: "journal/remove", id: entry.id }
    );
    expect(state.journal).toHaveLength(0);
  });

  it("persists entries into XP once per day", () => {
    const state = run(
      makeState({ profile: { name: "C", avatar: "fawn", interests: [], onboardedAt: "2026-01-01" } }),
      { type: "journal/upsert", entry: createJournalEntry(today, 4, "x") },
      { type: "journal/upsert", entry: createJournalEntry(daysAgo(1), 4, "y") }
    );
    expect(computeXp(state) - 20 /* welcome */).toBe(2 * XP_PER_ENTRY);
  });
});

describe("quests", () => {
  it("toggles the daily quest date", () => {
    const state = run(makeState(), { type: "quest/toggle", date: today });
    expect(state.questsDone).toEqual([today]);
    expect(computeXp(state)).toBe(XP_PER_QUEST);
    const off = reducer(state, { type: "quest/toggle", date: today });
    expect(off.questsDone).toEqual([]);
    expect(computeXp(off)).toBe(0);
  });
});

describe("tree", () => {
  it("tends the tree for a date and awards XP", () => {
    const state = run(makeState(), { type: "tree/tend", date: today });
    expect(state.tendedDates).toEqual([today]);
    expect(computeXp(state)).toBe(XP_PER_TEND);
    const untended = reducer(state, { type: "tree/tend", date: today });
    expect(untended.tendedDates).toEqual([]);
  });
});

describe("streak freezes", () => {
  const h = makeHabit();

  it("spends a freeze on a date", () => {
    const state = run(makeState({ habits: [h] }), {
      type: "freeze/use",
      habitId: h.id,
      date: daysAgo(1),
    });
    expect(state.freezeUsed[h.id]).toEqual([daysAgo(1)]);
  });

  it("does not record the same freeze twice", () => {
    const state = run(
      makeState({ habits: [h] }),
      { type: "freeze/use", habitId: h.id, date: daysAgo(1) },
      { type: "freeze/use", habitId: h.id, date: daysAgo(1) }
    );
    expect(state.freezeUsed[h.id]).toEqual([daysAgo(1)]);
  });

  it("tracks freezes per habit and keeps them sorted", () => {
    const a = makeHabit({ id: "a" });
    const b = makeHabit({ id: "b" });
    const state = run(
      makeState({ habits: [a, b] }),
      { type: "freeze/use", habitId: "b", date: today },
      { type: "freeze/use", habitId: "a", date: daysAgo(3) },
      { type: "freeze/use", habitId: "a", date: daysAgo(1) }
    );
    expect(state.freezeUsed).toEqual({
      b: [today],
      a: [daysAgo(3), daysAgo(1)].sort(),
    });
  });

  it("keeps freezes available at zero when more are spent than earned", () => {
    const state = run(
      makeState({ habits: [h], completions: { [h.id]: [today, daysAgo(1), daysAgo(2)] } }),
      { type: "freeze/use", habitId: h.id, date: daysAgo(4) }
    );
    expect(freezesAvailable(state)).toBe(0); // clamped, never negative
  });

  it("counts a frozen historical date toward the streak", () => {
    const state = run(
      makeState({ habits: [h], completions: { [h.id]: [today, daysAgo(2), daysAgo(3)] } }),
      { type: "freeze/use", habitId: h.id, date: daysAgo(1) }
    );
    const frozen = new Set(state.freezeUsed[h.id]);
    expect(habitStreak(h, state.completions, frozen)).toBe(4);
  });

  it("ignores freezes for unknown habits", () => {
    const state = run(makeState(), { type: "freeze/use", habitId: "ghost", date: today });
    expect(state.freezeUsed).toEqual({});
  });
});

describe("focus", () => {
  it("adds and removes sessions without touching XP", () => {
    const added = run(makeState(), {
      type: "focus/add",
      session: createFocusSession(today, 25, "Deep work"),
    });
    expect(added.focus).toHaveLength(1);
    expect(added.focus[0]).toMatchObject({ minutes: 25, label: "Deep work" });
    // Focus minutes are not XP in BAMBI — pin that rule here.
    expect(computeXp(added)).toBe(0);

    const removed = run(added, { type: "focus/remove", id: added.focus[0].id });
    expect(removed.focus).toHaveLength(0);
  });
});

describe("challenges", () => {
  it("creates a challenge", () => {
    const state = run(makeState(), {
      type: "challenges/add",
      challenge: createChallenge({ title: "  30 days of reading  ", days: 30, xpReward: 100 }),
    });
    expect(state.challenges).toHaveLength(1);
    expect(state.challenges[0].title).toBe("30 days of reading");
  });

  it("check-ins toggle a date without duplicating", () => {
    const c = createChallenge({ title: "C", days: 3, xpReward: 100 });
    const state = run(
      makeState({ challenges: [c] }),
      { type: "challenges/checkin", id: c.id, date: today },
      { type: "challenges/checkin", id: c.id, date: today }
    );
    expect(state.challenges[0].doneDates).toEqual([]);
  });

  it("completes once day count is reached and awards XP exactly once", () => {
    const c = createChallenge({ title: "C", days: 2, xpReward: 100 });
    let state = makeState({ challenges: [c] });
    expect(computeXp(state)).toBe(0);

    state = reducer(state, { type: "challenges/checkin", id: c.id, date: today });
    expect(computeXp(state)).toBe(0); // not complete yet

    state = reducer(state, { type: "challenges/checkin", id: c.id, date: daysAgo(1) });
    expect(state.challenges[0].completedAt).toBeTruthy();
    expect(computeXp(state)).toBe(100);

    // Further check-ins after completion must not award XP twice.
    state = reducer(state, { type: "challenges/checkin", id: c.id, date: daysAgo(2) });
    expect(computeXp(state)).toBe(100);
  });

  it("removes a challenge", () => {
    const c = createChallenge({ title: "C", days: 3, xpReward: 100 });
    const state = run(makeState({ challenges: [c] }), { type: "challenges/remove", id: c.id });
    expect(state.challenges).toHaveLength(0);
  });
});

describe("vision", () => {
  it("adds and removes vision items", () => {
    const added = run(makeState(), {
      type: "vision/add",
      item: createVisionItem("  Paint a mural  ", "creative"),
    });
    expect(added.vision).toHaveLength(1);
    expect(added.vision[0].text).toBe("Paint a mural");

    const removed = run(added, { type: "vision/remove", id: added.vision[0].id });
    expect(removed.vision).toHaveLength(0);
  });
});

describe("reflections", () => {
  const fields = {
    wentWell: "Good week",
    wentWrong: "Slept late",
    win: "Finished draft",
    lesson: "Plan Sunday",
    nextWeek: "Run more",
  };

  it("creates a reflection for a week", () => {
    const state = run(makeState(), {
      type: "reflection/upsert",
      reflection: createReflection("2026-06-01", fields),
    });
    expect(state.reflections).toHaveLength(1);
    expect(state.reflections[0]).toMatchObject({ weekKey: "2026-06-01", ...fields });
  });

  it("updates the existing reflection for the same week", () => {
    const state = run(
      makeState(),
      { type: "reflection/upsert", reflection: createReflection("2026-06-01", fields) },
      {
        type: "reflection/upsert",
        reflection: createReflection("2026-06-01", { ...fields, win: "Shipped it" }),
      }
    );
    expect(state.reflections).toHaveLength(1);
    expect(state.reflections[0].win).toBe("Shipped it");
  });
});

describe("settings", () => {
  it("merges a settings patch", () => {
    const state = run(makeState(), {
      type: "settings/update",
      patch: { compactMode: true, sounds: true },
    });
    expect(state.settings).toMatchObject({ compactMode: true, sounds: true });
    expect(state.settings.theme).toBe("light"); // untouched
  });

  it("sets the theme directly", () => {
    const state = run(makeState(), { type: "theme/set", theme: "dark" });
    expect(state.settings.theme).toBe("dark");
  });

  it("trusts its patch (validation lives at the persistence boundary)", () => {
    // The reducer is a thin merge by design — garbage settings are
    // normalized later, when the state crosses the boundary (parseState).
    const state = run(makeState(), {
      type: "settings/update",
      patch: { accent: "neon", sounds: "yes" } as unknown as Partial<Settings>,
    });
    expect(state.settings.accent).toBe("neon");
    expect(parseState(state).settings).toMatchObject({ accent: "violet", sounds: false });
  });
});

describe("reset / import", () => {
  it("resets to a blank state", () => {
    const full = makeState({ habits: [makeHabit()], completions: { h1: [today] } });
    const state = reducer(full, { type: "app/reset" });
    expect(state).toEqual(initialState());
  });

  it("imports a state wholesale", () => {
    const full = makeState({ habits: [makeHabit()], questsDone: [today] });
    const state = reducer(initialState(), { type: "app/import", state: full });
    expect(state).toEqual(full);
  });

  it("ignores unknown action types", () => {
    const state = makeState();
    // @ts-expect-error — a foreign action must be a no-op
    expect(reducer(state, { type: "nope" })).toBe(state);
  });
});
