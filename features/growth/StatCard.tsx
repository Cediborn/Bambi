import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "mint" | "tangerine" | "violet" | "sky";
}

const TONES = {
  brand: "bg-brand/10 text-brand",
  mint: "bg-mint/15 text-good",
  tangerine: "bg-warn/15 text-tangerine",
  violet: "bg-brand-2/15 text-brand-2",
  sky: "bg-info/15 text-info",
} as const;

export function StatCard({ icon, label, value, sub, tone = "brand" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          {icon}
        </span>
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
      </div>
      <p className="font-mono mt-3 text-3xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs font-medium text-ink-soft">{sub}</p> : null}
    </Card>
  );
}
