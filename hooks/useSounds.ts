"use client";

import { useMemo } from "react";
import { useApp } from "./useApp";
import { playChime, type ChimeKind } from "@/utils/sounds";

/**
 * Feedback sounds that respect the user's `settings.sounds` toggle.
 * Each returned function is a no-op when sounds are off.
 */
export function useSounds() {
  const { state } = useApp();
  const enabled = state.settings.sounds;

  return useMemo(() => {
    const play = (kind: ChimeKind) => (enabled ? playChime(kind) : undefined);
    return {
      complete: () => play("complete"),
      quest: () => play("quest"),
      levelup: () => play("levelup"),
      checkin: () => play("checkin"),
      badge: () => play("badge"),
    };
  }, [enabled]);
}
