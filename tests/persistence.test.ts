import { describe, expect, it } from "vitest";
import {
  exportState,
  importState,
  loadState,
  readStoredTheme,
  saveState,
  STATE_KEY,
  writeStoredTheme,
} from "@/db/persistence";
import { initialState } from "@/db/appState";
import { createMemoryStorage, type StorageAdapter } from "@/db/storage";
import { daysAgo, makeHabit, makeState } from "./helpers";
import { todayKey } from "@/utils/dates";

const today = todayKey();

describe("loadState / saveState", () => {
  it("returns the initial state when storage is empty", () => {
    expect(loadState(createMemoryStorage())).toEqual(initialState());
  });

  it("round-trips a full state through storage", () => {
    const storage = createMemoryStorage();
    const state = makeState({
      profile: { name: "Cedi", avatar: "fawn", interests: ["study"], onboardedAt: "2026-01-01" },
      habits: [makeHabit()],
      completions: { h1: [daysAgo(1), today] }, // kept sorted, as normalized on load
      journal: [{ id: "j1", date: today, mood: 4, content: "hi", createdAt: "" }],
      questsDone: [today],
      tendedDates: [today],
      focus: [{ id: "f1", date: today, minutes: 25, endedAt: "" }],
      challenges: [{ id: "c1", title: "C", days: 3, startedAt: "", doneDates: [], xpReward: 100 }],
      vision: [{ id: "v1", text: "Go", category: "creative", createdAt: "" }],
      reflections: [
        { id: "r1", weekKey: "2026-06-01", wentWell: "", wentWrong: "", win: "", lesson: "", nextWeek: "", createdAt: "" },
      ],
    });
    saveState(state, storage);
    expect(loadState(storage)).toEqual(state);
  });

  it("never throws on corrupted JSON — falls back to initial state", () => {
    const storage = createMemoryStorage({ [STATE_KEY]: "{this is not json" });
    expect(loadState(storage)).toEqual(initialState());
  });

  it("tolerates malformed slices while preserving the healthy data", () => {
    const storage = createMemoryStorage({
      [STATE_KEY]: JSON.stringify({
        profile: { name: "Cedi" },
        habits: [
          { id: "ok", name: "Read", icon: "book", color: "#4F46E5", schedule: [0, 1, 2, 3, 4, 5, 6], createdAt: "2026-01-01" },
          { id: 42, name: 7, icon: [], color: {}, schedule: "every day" },
        ],
        completions: {
          ok: ["2026-06-02", "2026-06-01", "2026-06-01", "not-a-date", 5],
          broken: "not-an-array",
        },
        questsDone: ["2026-06-01", "2026-06-01", "garbage"],
        settings: { theme: "neon", accent: "violet", compactMode: "yes" },
      }),
    });
    const state = loadState(storage);
    // The valid habit survives, the corrupt one is dropped.
    expect(state.habits).toHaveLength(1);
    expect(state.habits[0].id).toBe("ok");
    // Completion dates are deduped, sorted and cleaned; corrupt values reset.
    expect(state.completions).toEqual({
      ok: ["2026-06-01", "2026-06-02"],
      broken: [],
    });
    expect(state.questsDone).toEqual(["2026-06-01"]);
    // Settings fall back to defaults for invalid values.
    expect(state.settings).toMatchObject({ theme: "light", accent: "violet", compactMode: false });
  });

  it("dedupes habits and journal entries by id/date on load", () => {
    const storage = createMemoryStorage({
      [STATE_KEY]: JSON.stringify({
        habits: [
          { id: "same", name: "A", icon: "book", color: "#111", schedule: [0], createdAt: "" },
          { id: "same", name: "B", icon: "book", color: "#222", schedule: [0], createdAt: "" },
        ],
        journal: [
          { id: "j1", date: "2026-06-01", mood: 3, content: "first", createdAt: "" },
          { id: "j2", date: "2026-06-01", mood: 4, content: "second", createdAt: "" },
        ],
      }),
    });
    const state = loadState(storage);
    expect(state.habits).toHaveLength(1);
    expect(state.habits[0].name).toBe("A");
    expect(state.journal).toHaveLength(1);
  });

  it("survives quota/availability errors on write", () => {
    const throwing: StorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    const state = makeState({ habits: [makeHabit()] });
    expect(() => saveState(state, throwing)).not.toThrow();
    expect(() => writeStoredTheme("dark", throwing)).not.toThrow();
  });

  it("survives broken getters", () => {
    const broken: StorageAdapter = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(loadState(broken)).toEqual(initialState());
    expect(readStoredTheme(broken)).toBe("light");
  });
});

describe("theme persistence", () => {
  it("writes and reads the theme", () => {
    const storage = createMemoryStorage();
    writeStoredTheme("dark", storage);
    expect(readStoredTheme(storage)).toBe("dark");
    expect(readStoredTheme(createMemoryStorage())).toBe("light");
  });
});

describe("export / import", () => {
  const state = makeState({
    habits: [makeHabit()],
    completions: { h1: [today] },
    profile: { name: "Cedi", avatar: "fawn", interests: [], onboardedAt: "2026-01-01" },
  });

  it("exports the expected envelope structure", () => {
    const envelope = JSON.parse(exportState(state)) as Record<string, unknown>;
    expect(envelope.app).toBe("bambi");
    expect(envelope.version).toBe(1);
    expect(typeof envelope.exportedAt).toBe("string");
    expect(envelope.state).toEqual(state);
  });

  it("round-trips a state through export and import", () => {
    const result = importState(exportState(state));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state).toEqual(state);
  });

  it("rejects non-JSON input", () => {
    const result = importState("definitely not json {");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });

  it("rejects files that are not BAMBI backups", () => {
    expect(importState(JSON.stringify({ app: "other", version: 1, state })).ok).toBe(false);
    expect(importState(JSON.stringify([1, 2, 3])).ok).toBe(false);
  });

  it("rejects backups missing their state", () => {
    expect(importState(JSON.stringify({ app: "bambi", version: 1 })).ok).toBe(false);
  });

  it("rejects backups from a newer version", () => {
    const newer = JSON.parse(exportState(state)) as Record<string, unknown>;
    newer.version = 99;
    const result = importState(JSON.stringify(newer));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/newer/i);
  });

  it("tolerates missing version numbers (legacy files)", () => {
    const legacy = JSON.parse(exportState(state)) as Record<string, unknown>;
    delete legacy.version;
    expect(importState(JSON.stringify(legacy)).ok).toBe(true);
  });
});
