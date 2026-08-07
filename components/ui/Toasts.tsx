"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BoltIcon,
  CheckCircleIcon,
  SparklesIcon,
  TrophyIcon,
  XIcon,
} from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { evaluateAchievements, type Achievement } from "@/utils/achievements";
import { ACHIEVEMENT_ICONS } from "@/features/achievements/achievementMeta";
import { dailyQuest } from "@/utils/quests";
import { totalCompletions } from "@/utils/streaks";
import { computeXp, levelForXp, levelTitle, XP_PER_GOAL, XP_PER_QUEST } from "@/utils/xp";

interface Toast {
  id: number;
  kind: "badge" | "quest" | "level" | "xp";
  title: string;
  body: string;
  /** Achievement glyph shown on badge toasts. */
  iconKey?: Achievement["icon"];
}

/** The glyph inside a toast's colored chip — each celebration kind has its own. */
function ToastGlyph({ toast }: { toast: Toast }) {
  if (toast.kind === "badge") {
    const Icon = toast.iconKey ? ACHIEVEMENT_ICONS[toast.iconKey] : TrophyIcon;
    return <Icon size={20} />;
  }
  if (toast.kind === "level") return <BoltIcon size={20} />;
  return <SparklesIcon size={20} />;
}

const TOAST_LIFETIME = 4600;
/** Small-win pills are quicker — they exist to punctuate, not to linger. */
const XP_TOAST_LIFETIME = 2400;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Quiet celebrations, mounted once in the app shell.
 *
 * Watches the shared state and raises a small toast when something worth
 * cheering for happens — an achievement unlocking or today's quest being
 * completed — wherever in the app it occurred. Nothing fancy: one card,
 * a few seconds, gone. Respects sounds + reduced-motion settings.
 */
export function Toaster() {
  const { state } = useApp();
  const sounds = useSounds();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const seenBadges = useRef<Set<string> | null>(null);
  const seenQuests = useRef<Set<string> | null>(null);
  const levelRef = useRef<number | null>(null);
  const goalsRef = useRef<number | null>(null);

  const push = (kind: Toast["kind"], title: string, body = "", iconKey?: Toast["iconKey"]) => {
    const id = ++idRef.current;
    setToasts((prev) => {
      if (kind === "xp") {
        // Small-win pills never push milestone cards off the stack — they
        // only replace the previous pill, so a burst of goals keeps the
        // badges/levels/quests visible.
        const pills = prev.filter((t) => t.kind === "xp");
        const rest = prev.filter((t) => t.kind !== "xp");
        return [...rest, ...pills.slice(-1), { id, kind, title, body, iconKey }];
      }
      // Milestone cards keep the pre-existing three-card cap.
      return [...prev.slice(-2), { id, kind, title, body, iconKey }];
    });
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, kind === "xp" ? XP_TOAST_LIFETIME : TOAST_LIFETIME);
  };

  useEffect(() => {
    const achievements = evaluateAchievements(state);

    // Achievements: diff the unlocked set against what we last saw.
    const unlocked = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id)
    );
    if (seenBadges.current) {
      const fresh = achievements.filter(
        (a) => a.unlocked && !seenBadges.current!.has(a.id)
      );
      // A backup restore can unlock many at once — celebrate only the
      // handful that happen during real play, so imports don't flood.
      if (fresh.length > 0 && fresh.length <= 2) {
        push(
          "badge",
          fresh.length === 1 ? "Badge unlocked" : "Badges unlocked",
          fresh.length === 1 ? fresh[0].description : fresh.map((a) => a.title).join(", "),
          fresh.length === 1 ? fresh[0].icon : undefined
        );
        sounds.badge();
      }
    }
    seenBadges.current = unlocked;

    // Level: a climb anywhere in the app deserves a quiet toast + chime.
    // Only a single-level step celebrates — a multi-level jump can only
    // come from importing a backup, which we deliberately don't cheer.
    const level = levelForXp(computeXp(state));
    if (levelRef.current !== null && level === levelRef.current + 1) {
      push("level", "Level up!", `Level ${level} — ${levelTitle(level)}`);
      sounds.levelup();
    }
    levelRef.current = level;

    // Goal completions: a visible +XP pill for every small win. Real play
    // adds one completion at a time (two if clicks batch); larger jumps
    // can only come from importing a backup, which stays quiet. Silent by
    // design — the completing row already plays its own chime.
    const goals = totalCompletions(state.completions);
    if (goalsRef.current !== null) {
      const gained = goals - goalsRef.current;
      if (gained > 0 && gained <= 2) {
        push("xp", `+${gained * XP_PER_GOAL} XP`);
      }
    }
    goalsRef.current = goals;

    // Quest: one new completed date means a quest was finished (a jump of
    // more than one can only come from importing a backup).
    if (seenQuests.current) {
      const added = state.questsDone.filter((d) => !seenQuests.current!.has(d));
      if (added.length === 1) {
        push("quest", "Quest complete", `${dailyQuest(added[0], state.profile?.interests).title} · +${XP_PER_QUEST} XP`);
      }
    }
    seenQuests.current = new Set(state.questsDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) =>
          toast.kind === "xp" ? (
            /* Small win — a compact pill, lighter than a milestone card. */
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-mint/25 bg-card/95 py-2 pl-3.5 pr-4 shadow-lift backdrop-blur-xl dark:border-mint/20 dark:bg-surface/90"
            >
              <BoltIcon size={15} className="text-good" />
              <span className="font-mono text-sm font-bold tabular-nums text-good">
                {toast.title}
              </span>
            </motion.div>
          ) : (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-card/95 p-4 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-surface/90"
          >
            {toast.kind === "level" ? (
              // One-shot mint ring on its own layer so the card keeps its
              // resting shadow (animate-level-glow fills `both`).
              <span
                aria-hidden="true"
                className="animate-level-glow pointer-events-none absolute inset-0 rounded-2xl"
              />
            ) : null}
            <span
              className={[
                "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                toast.kind === "badge"
                  ? "bg-achievement/15 text-achievement"
                  : toast.kind === "level"
                    ? "bg-mint/15 text-good"
                    : "bg-brand/15 text-brand-2",
              ].join(" ")}
            >
              <ToastGlyph toast={toast} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                {toast.title}
                {toast.kind === "quest" ? (
                  <CheckCircleIcon size={14} className="text-good" />
                ) : null}
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-ink-soft">
                {toast.body}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="rounded-lg p-1 text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:hover:bg-white/10"
            >
              <XIcon size={15} />
            </button>
          </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
