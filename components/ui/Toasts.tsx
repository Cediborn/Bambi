"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleIcon,
  SparklesIcon,
  TrophyIcon,
  XIcon,
} from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { useSounds } from "@/hooks/useSounds";
import { evaluateAchievements } from "@/utils/achievements";
import { dailyQuest } from "@/utils/quests";
import { XP_PER_QUEST } from "@/utils/xp";

interface Toast {
  id: number;
  kind: "badge" | "quest";
  title: string;
  body: string;
}

const TOAST_LIFETIME = 4600;
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

  const push = (kind: Toast["kind"], title: string, body: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, kind, title, body }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_LIFETIME);
  };

  useEffect(() => {
    // Achievements: diff the unlocked set against what we last saw.
    const unlocked = new Set(
      evaluateAchievements(state)
        .filter((a) => a.unlocked)
        .map((a) => a.id)
    );
    if (seenBadges.current) {
      const fresh = [...unlocked].filter((id) => !seenBadges.current!.has(id));
      // A backup restore can unlock many at once — celebrate only the
      // handful that happen during real play, so imports don't flood.
      if (fresh.length > 0 && fresh.length <= 2) {
        const names = evaluateAchievements(state)
          .filter((a) => fresh.includes(a.id))
          .map((a) => a.title);
        push("badge", fresh.length === 1 ? "Badge unlocked" : "Badges unlocked", names.join(", "));
        sounds.badge();
      }
    }
    seenBadges.current = unlocked;

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
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-card/95 p-4 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-surface/90"
          >
            <span
              className={[
                "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                toast.kind === "badge"
                  ? "bg-achievement/15 text-achievement"
                  : "bg-brand/15 text-brand-2",
              ].join(" ")}
            >
              {toast.kind === "badge" ? (
                <TrophyIcon size={20} />
              ) : (
                <SparklesIcon size={20} />
              )}
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
        ))}
      </AnimatePresence>
    </div>
  );
}
