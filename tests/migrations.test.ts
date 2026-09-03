import { describe, expect, it } from "vitest";
import { APP_ID, BACKUP_VERSION, migrateBackup } from "@/db/migrations";

const state = { habits: [], completions: {}, settings: { theme: "light" } };

function backup(version?: number) {
  const b: Record<string, unknown> = { app: APP_ID, state };
  if (version !== undefined) b.version = version;
  return b;
}

describe("migrateBackup", () => {
  it("accepts a current-version backup unchanged", () => {
    const result = migrateBackup(backup(BACKUP_VERSION));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state).toEqual(state);
  });

  it("treats a missing version as the oldest supported (v1)", () => {
    const result = migrateBackup(backup());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state).toEqual(state);
  });

  it("rejects non-object input", () => {
    for (const junk of [null, 42, "bambi", [1, 2, 3]]) {
      expect(migrateBackup(junk).ok).toBe(false);
    }
  });

  it("rejects files from another app", () => {
    expect(migrateBackup({ app: "other-app", version: 1, state }).ok).toBe(false);
  });

  it("rejects backups missing their state payload", () => {
    expect(migrateBackup({ app: APP_ID, version: 1 }).ok).toBe(false);
  });

  it("rejects backups older than v1", () => {
    const result = migrateBackup(backup(0));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/old/i);
  });

  it("rejects backups from a newer version", () => {
    const result = migrateBackup(backup(BACKUP_VERSION + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/newer/i);
  });
});
