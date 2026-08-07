"use client";

import { Reveal } from "@/components/ui/Motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { VisionBoard } from "@/features/vision/VisionBoard";
import { useApp } from "@/hooks/useApp";

export default function VisionPage() {
  const { state } = useApp();
  const count = state.vision.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vision"
        subtitle="A quiet board for the things you're building toward. Picture it first — the rest follows."
        meta={count > 0 ? `${count} dream${count === 1 ? "" : "s"} pinned` : undefined}
      />
      <Reveal>
        <VisionBoard />
      </Reveal>
    </div>
  );
}
