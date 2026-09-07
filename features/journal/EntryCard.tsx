"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { JournalEntry } from "@/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MOODS, moodLabel } from "@/components/ui/MoodPicker";
import { ArrowRightIcon, PencilIcon, TrashIcon, XIcon } from "@/components/icons";
import { useApp } from "@/hooks/useApp";
import { fullDate } from "@/utils/dates";
import { journalPreview } from "@/utils/journalPreview";
import { JournalForm } from "./JournalForm";

const MOOD_COLOR: Record<number, string> = Object.fromEntries(MOODS.map((m) => [m.value, m.color]));
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * EntryCard — a saved journal entry in the list.
 *
 * Cards show only a short preview (first two sentences / ~160 chars, with
 * "…"). Tapping the preview opens the full entry in a dialog, where the user
 * can read the complete content and edit it. The stored content is never
 * modified unless the user saves changes.
 */
export function EntryCard({ entry }: { entry: JournalEntry }) {
  const { api } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const full = entry.content.trim();
  const preview = full ? journalPreview(full) : "";
  const truncated = full.length > preview.length;

  return (
    <>
      <Card size="compact">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: MOOD_COLOR[entry.mood] ?? "#94A3B8" }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{fullDate(entry.date)}</p>
              <p className="truncate text-xs font-medium text-ink-soft">
                Feeling <span className="font-semibold text-ink">{moodLabel(entry.mood)}</span>
              </p>
            </div>
          </div>

          {confirming ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-xs font-semibold text-ink-soft">Delete this entry?</span>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  api.removeJournal(entry.id);
                  setConfirming(false);
                }}
              >
                Yes, delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Keep
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete entry from ${entry.date}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-bad focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>

        {full ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Read the full entry from ${fullDate(entry.date)}`}
            className="mt-4 block w-full rounded-xl text-left transition-colors duration-150 hover:bg-surface/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <p className="line-clamp-2 break-words text-sm leading-relaxed text-ink">
              {full}
            </p>
            {truncated ? (
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-brand">
                Read full entry
                <ArrowRightIcon size={13} />
              </span>
            ) : null}
          </button>
        ) : null}
      </Card>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? <EntryDialog entry={entry} onClose={() => setOpen(false)} /> : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

/** Full entry in a centered dialog — scrollable, never wider than the viewport. */
function EntryDialog({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = `entry-title-${entry.id}`;
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";

    const t = window.setTimeout(() => closeRef.current?.focus(), reduce ? 0 : 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      {/* Dim backdrop — tap to close */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm dark:bg-[#020617]/60"
        onClick={onClose}
      />

      <motion.div
        className="relative flex w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl border border-line bg-card shadow-lift dark:border-white/[0.1] sm:rounded-3xl"
        style={{ maxHeight: "calc(100dvh - 1.5rem)" }}
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-line/60 bg-card px-5 py-4 dark:border-white/[0.06] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: MOOD_COLOR[entry.mood] ?? "#94A3B8" }}
            />
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-sm font-bold text-ink">
                {fullDate(entry.date)}
              </h2>
              <p className="text-xs font-medium text-ink-soft">
                {editing ? "Editing entry" : (
                  <>
                    Feeling{" "}
                    <span className="font-semibold text-ink">{moodLabel(entry.mood)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close entry"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <XIcon size={18} />
          </button>
        </div>

        {editing ? (
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <JournalForm
              entry={entry}
              onSaved={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <div className="px-5 pt-5 pb-4 sm:px-6 sm:pb-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
                {entry.content}
              </p>
            </div>
            <div className="flex justify-end border-t border-line/60 px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(true)}
                icon={<PencilIcon size={15} />}
              >
                Edit
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
