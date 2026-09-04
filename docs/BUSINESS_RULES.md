# BAMBI — business rules

These are the product rules BAMBI operates by. The implementation lives in
`utils/` (pure selectors) and `db/appState.ts` (reducer); this document is
the source of truth they must match. If you change a rule, change it here
**and** in the code — the tests in `tests/` pin most of them.

## XP

XP is **derived, never stored**: it is recomputed from state on every read,
so it can never drift out of sync. Toggling an action off removes its XP.

| Action                       | XP   | Notes                                                                 |
| ---------------------------- | ---- | --------------------------------------------------------------------- |
| Completed goal (per date)    | 10   | Counts each completed date across all habits                           |
| Journal entry (per day)      | 5    | One entry per day (upserted) → max one journal XP per day              |
| Daily quest (per date)       | 20   | Toggleable — completing and un-completing both move XP                 |
| Tree tended (per date)       | 5    |                                                                        |
| Challenge completed          | reward | Awarded **once**, only when `completedAt` is set (see below)         |
| Welcome bonus                | 20   | Granted once, when a profile exists (i.e. after onboarding)            |
| Focus session                | —    | Focus minutes deliberately award **no XP**                             |

Duplicate activity can never award XP twice: completion records behave as a
set (the reducer toggles, and the persistence schema dedupes dates on load),
and challenge XP requires the one-shot `completedAt` flag.

- Levels: `floor(xp / 100) + 1`. Titles cycle through 10 growth stages
  (Sprout → Seedling → Sapling → Bamboo → Grove → Forest → Old Growth →
  Summit → Evergreen → Canopy).

## Streaks

A habit's streak is **consecutive scheduled days completed, counting back
from today**.

- Only days the habit is scheduled on count (see the habit's `schedule`).
- A **not-yet-completed today does not break** the streak — the count
  starts from yesterday when today is pending.
- A missed scheduled day breaks the streak.
- A **frozen date counts as completed** for that habit's streak only.
- The walk is bounded at 366 days back (no real streak is longer; also
  guarantees termination for never-scheduled habits).
- `topStreak` is the best streak across all habits.

An **active day** is any date with at least one record of activity:
goal completion, quest, journal entry, tree tending, focus session, or
challenge check-in.

## Streak freezes

- **Earned**: one freeze per 7 active days (`floor(activeDays / 7)`).
- **Bank**: earned − used; clamped at 0, never negative.
- **Spent**: applying a freeze marks a specific date as done for one
  habit's streak (stored in `freezeUsed[habitId]`). The same date cannot
  be frozen twice for the same habit.
- **Eligibility**: a date is freezable (`freezableDay`) when it is the
  most recent scheduled-and-missed day within the last **14 days**, and a
  real streak existed before the miss (a completed scheduled day within 14
  days before it).
- **When no freeze is available**: the streak simply breaks — freezes are a
  convenience, never a guarantee. The UI only offers a freeze when one is
  banked.

## Challenges

- Created with `days` (clamped 1–365) and an `xpReward`.
- Each **check-in toggles** a date in `doneDates` (no duplicates).
- A challenge **completes** the first time `doneDates.length >= days`;
  `completedAt` is set exactly once.
- **XP is awarded once** (only challenges with `completedAt` count), so
  extra check-ins after completion never pay out again.

## Journal & reflections

- **Journal**: one entry per date — upserting replaces the entry for that
  day.
- **Reflections**: one per week (`weekKey` = Monday of the week) — upserting
  replaces the reflection for that week. There is no deletion action.
- After saving, the current week's reflection **locks**: the form is replaced
  by a saved view and the next reflection opens the following Monday
  (`weekKey + 7` days, calendar-based). Past reflections can still be edited
  — editing upserts over the same `weekKey`, never creating a duplicate.
