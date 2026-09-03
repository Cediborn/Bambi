/**
 * db/migrations.ts — backup versioning.
 *
 * Exported backups carry an integer `version`. Restoring runs every
 * migration between the backup's version and the current one, so older
 * backups move forward in lockstep:
 *
 *   v1 ──migrate1──▶ v2 ──migrate2──▶ v3 … ──▶ current
 *
 * The current format is v1, so nothing migrates yet — but the chain is in
 * place so the next format change is one registry entry, not a rewrite.
 */

export const APP_ID = "bambi";
export const BACKUP_VERSION = 1;

export type Migration = (state: unknown) => unknown;

/**
 * Version → migration that upgrades that version to the next one.
 * When the format next changes, add e.g. `1: (state) => ({ ...state, ... })`
 * and bump `BACKUP_VERSION` to 2.
 */
const MIGRATIONS: Record<number, Migration> = {};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type MigrationResult = { ok: true; state: unknown } | { ok: false; error: string };

/** Validate a parsed backup and run any migrations needed to reach the current format. */
export function migrateBackup(parsed: unknown): MigrationResult {
  if (!isRecord(parsed)) return { ok: false, error: "That file doesn't look like a BAMBI backup." };
  if (parsed.app !== APP_ID) return { ok: false, error: "That file doesn't look like a BAMBI backup." };
  if (!isRecord(parsed.state)) return { ok: false, error: "The backup is missing its data." };

  // Missing/invalid version is tolerated as v1 (all backups to date are v1).
  const version = typeof parsed.version === "number" ? parsed.version : 1;
  if (version < 1) return { ok: false, error: "That backup is too old to restore." };
  if (version > BACKUP_VERSION) {
    return {
      ok: false,
      error: "That backup was made by a newer version of BAMBI — update the app first.",
    };
  }

  let state: unknown = parsed.state;
  for (let v = version; v < BACKUP_VERSION; v++) {
    const migrate = MIGRATIONS[v];
    if (!migrate) return { ok: false, error: "That backup can't be restored." };
    state = migrate(state);
  }
  return { ok: true, state };
}
