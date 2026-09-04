"use client";

import Image from "next/image";

/**
 * BAMBI buddies — a small set of avatar images.
 * Each buddy is a local photo in /public/avatars/<key>.png, cropped into a
 * round tile. `Avatar` renders one by key, `AvatarPicker` is the selectable
 * grid used in onboarding and settings.
 */

export interface AvatarMeta {
  key: string;
  label: string;
  /** Text color for the buddy's name (matches the character's neon outline). */
  color: string;
  /** Soft tile color behind the face (fallback while the image loads). */
  bg: string;
}

export const AVATARS: AvatarMeta[] = [
  { key: "fawn", label: "bambi", color: "#4D7C0F", bg: "#F5CDA8" },
  { key: "fox", label: "pip", color: "#A16207", bg: "#F8B878" },
  { key: "bunny", label: "milo", color: "#C2410C", bg: "#EADCF2" },
  { key: "bear", label: "nova", color: "#7E22CE", bg: "#E0CBB1" },
  { key: "owl", label: "koda", color: "#DC2626", bg: "#CFE3F5" },
  { key: "cat", label: "lumi", color: "#0E7490", bg: "#E2E3EA" },
  { key: "panda", label: "ziggy", color: "#BE185D", bg: "#E9E9F1" },
  { key: "sprout", label: "sora", color: "#64748B", bg: "#CFE8CF" },
];

/** Maps an avatar key to its local image path. Unknown keys fall back to fawn. */
export function avatarSrc(avatar: string): string {
  const known = AVATARS.some((a) => a.key === avatar);
  return `/avatars/${known ? avatar : "fawn"}.png`;
}

/** A round avatar tile. */
export function Avatar({
  avatar,
  size = 40,
  className = "",
}: {
  avatar: string;
  size?: number;
  className?: string;
}) {
  const meta = AVATARS.find((a) => a.key === avatar) ?? AVATARS[0];
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-card ${className}`}
      style={{ width: size, height: size, backgroundColor: meta.bg }}
    >
      <Image
        src={avatarSrc(avatar)}
        alt={meta.label}
        fill
        sizes={`${size}px`}
        className="object-cover"
        draggable={false}
      />
    </span>
  );
}

/** Selectable avatar grid — used in onboarding and settings. */
export function AvatarPicker({
  value,
  onChange,
  tileSize = 44,
  columns = "grid-cols-4 sm:grid-cols-8",
}: {
  value: string;
  onChange: (key: string) => void;
  tileSize?: number;
  columns?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Choose an avatar" className={`grid gap-2.5 ${columns}`}>
      {AVATARS.map((a) => {
        const selected = value === a.key;
        return (
          <button
            key={a.key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={a.label}
            onClick={() => onChange(a.key)}
            className={[
              "flex flex-col items-center justify-center rounded-2xl border p-1.5 transition-all duration-150",
              "active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "border-brand/50 bg-brand/10 shadow-card"
                : "border-transparent hover:border-line hover:bg-surface",
            ].join(" ")}
          >
            <Avatar avatar={a.key} size={tileSize} className={selected ? "ring-2 ring-brand/40" : ""} />
            <span
              className="mt-1 max-w-full truncate text-[10px] font-bold leading-none"
              style={{ color: a.color }}
            >
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Default avatar key when a profile has none saved. */
export const DEFAULT_AVATAR = "fawn";
