"use client";

import { Card } from "@/components/ui/Card";
import { QuoteIcon } from "@/components/icons";
import { dailyQuote } from "@/utils/greetings";
import { todayKey } from "@/utils/dates";

/** A single calm reflection for the day. */
export function QuoteCard() {
  const quote = dailyQuote(todayKey());

  return (
    <Card size="compact" className="flex items-start gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <QuoteIcon size={19} />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Daily thought</p>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink">&ldquo;{quote}&rdquo;</p>
      </div>
    </Card>
  );
}
