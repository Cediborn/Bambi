import type { AppState } from "@/types";
import { daySeed } from "./greetings";
import { activeInLastDays, isScheduledOn, topStreak, totalCompletions } from "./streaks";
import { computeXp, levelForXp, xpToNextLevel, XP_PER_QUEST } from "./xp";
import type { MoodGlyphName } from "./hero";

/**
 * The focus banner — one quiet, contextual insight near the top of the
 * Today page. It reads real data (goals left, streak, quest status, focus
 * minutes, journaling…) and surfaces exactly one message, so the strip
 * feels like encouragement rather than a notification.
 */

export interface BannerMessage {
  /** MoodGlyph icon key (see components/icons.tsx) — never an emoji. */
  icon: MoodGlyphName;
  text: string;
}

function pick(lines: string[], dateKey: string): string {
  return lines[daySeed(dateKey + ":banner") % lines.length];
}

export function bannerMessage(state: AppState, dateKey: string): BannerMessage {
  const goalsToday = state.habits.filter((h) => isScheduledOn(h, dateKey));
  const doneToday = goalsToday.filter((h) => (state.completions[h.id] ?? []).includes(dateKey)).length;
  const allDone = goalsToday.length > 0 && doneToday === goalsToday.length;
  const remaining = goalsToday.length - doneToday;
  const streak = topStreak(state.habits, state.completions, state.freezeUsed);
  const questDone = state.questsDone.includes(dateKey);
  const total = totalCompletions(state.completions);

  const xp = computeXp(state);
  const toNext = xpToNextLevel(xp);
  const focusMinutes = state.focus.filter((f) => f.date === dateKey).reduce((s, f) => s + f.minutes, 0);
  const journaled = state.journal.some((e) => e.date === dateKey);
  const tended = state.tendedDates.includes(dateKey);

  // Priorities run top-down; the first match wins. Warm moments (first
  // day, return after a gap) come before the tactical ones so a returning
  // user is welcomed before being reminded of today's list.
  if (total === 0) {
    return { icon: "sprout", text: "Welcome. Every tree starts as a seed." };
  }

  if (total > 0 && !activeInLastDays(state, 3)) {
    return { icon: "leaf", text: "Welcome back. The garden missed you." };
  }

  if (remaining > 0) {
    return {
      icon: "target",
      text: pick(
        [
          `${remaining} ${remaining === 1 ? "goal" : "goals"} left today. Small steps.`,
          `Only ${remaining} to go — keep the rhythm.`,
          `${remaining} ${remaining === 1 ? "goal" : "goals"} today. One at a time.`,
        ],
        dateKey
      ),
    };
  }

  if (allDone) {
    return {
      icon: "star",
      text: pick(
        [
          "Everything's done. The rest of the day is yours.",
          "All goals complete. Quietly excellent.",
          "Done for the day. Enjoy the afterglow.",
        ],
        dateKey
      ),
    };
  }

  if (streak >= 3) {
    return {
      icon: "flame",
      text: pick(
        [
          `${streak}-day streak. Future You approves.`,
          `${streak} days of showing up. That's real.`,
          `The streak is ${streak} — protect it.`,
        ],
        dateKey
      ),
    };
  }

  if (toNext <= 40) {
    return {
      icon: "bolt",
      text: pick([`${toNext} XP from Level ${levelForXp(xp) + 1}. So close.`, `One more push to Level ${levelForXp(xp) + 1}.`], dateKey),
    };
  }

  if (questDone) {
    return {
      icon: "check",
      text: pick(
        [
          `Quest complete — +${XP_PER_QUEST} XP banked.`,
          "Today's quest: done. Today's you: leveled.",
          "Quest done early. Very grown-up.",
        ],
        dateKey
      ),
    };
  }

  if (focusMinutes > 0) {
    return {
      icon: "brain",
      text: pick(
        [
          `${focusMinutes} focused ${focusMinutes === 1 ? "minute" : "minutes"} today. Quiet power.`,
          `${focusMinutes} minutes of focus logged.`,
        ],
        dateKey
      ),
    };
  }

  if (journaled) {
    return { icon: "pen", text: "Checked in today. Good." };
  }

  if (tended) {
    return { icon: "droplet", text: "Tree watered. It can feel it." };
  }

  if (goalsToday.length === 0) {
    return {
      icon: "moon",
      text: pick(
        [
          "Rest day. Recharge before tomorrow.",
          "Nothing scheduled — a softer day.",
          "A lighter day. Rest counts as growth.",
        ],
        dateKey
      ),
    };
  }

  // Fallback — time-of-day flavor.
  const h = new Date().getHours();
  if (h < 12) {
    return { icon: "sun", text: pick(["Morning quiet is its own kind of focus.", "Ease into the day. No rush."], dateKey) };
  }
  if (h < 18) {
    return { icon: "sun", text: pick(["Afternoon lull — perfect for one small task.", "You're still here. That counts."], dateKey) };
  }
  return { icon: "moon", text: pick(["Evening winds down. Tomorrow is a new page.", "End the day gently."], dateKey) };
}
