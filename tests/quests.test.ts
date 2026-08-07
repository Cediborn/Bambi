import { describe, expect, it } from "vitest";
import { dailyQuest, isQuestDone, totalQuestsDone } from "@/utils/quests";
import { XP_PER_QUEST } from "@/utils/xp";
import { makeState } from "./helpers";

describe("dailyQuest", () => {
  it("is deterministic per date", () => {
    expect(dailyQuest("2026-06-01").id).toBe(dailyQuest("2026-06-01").id);
  });

  it("always carries the quest XP reward", () => {
    expect(dailyQuest("2026-06-01").rewardXp).toBe(XP_PER_QUEST);
  });

  it("picks a real quest even for narrow interests", () => {
    const quest = dailyQuest("2026-06-01", ["sleep"]);
    expect(quest.title.length).toBeGreaterThan(0);
    expect(quest.hint.length).toBeGreaterThan(0);
  });
});

describe("quest completion", () => {
  it("tracks completion by date", () => {
    const state = makeState({ questsDone: ["2026-06-01"] });
    expect(isQuestDone(state, "2026-06-01")).toBe(true);
    expect(isQuestDone(state, "2026-06-02")).toBe(false);
    expect(totalQuestsDone(state)).toBe(1);
  });
});
