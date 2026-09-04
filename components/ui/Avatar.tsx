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
  /** Soft tile color behind the face (fallback while the image loads). */
  bg: string;
}

export const AVATARS: AvatarMeta[] = [
  { key: "fawn", label: "Fawn", bg: "#F5CDA8" },
  { key: "fox", label: "Fox", bg: "#F8B878" },
  { key: "bunny", label: "Bunny", bg: "#EADCF2" },
  { key: "bear", label: "Bear", bg: "#E0CBB1" },
  { key: "owl", label: "Owl", bg: "#CFE3F5" },
  { key: "cat", label: "Cat", bg: "#E2E3EA" },
  { key: "panda", label: "Panda", bg: "#E9E9F1" },
  { key: "sprout", label: "Sprout", bg: "#CFE8CF" },
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
              "flex items-center justify-center rounded-2xl border p-1.5 transition-all duration-150",
              "active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "border-brand/50 bg-brand/10 shadow-card"
                : "border-transparent hover:border-line hover:bg-surface",
            ].join(" ")}
          >
            <Avatar avatar={a.key} size={tileSize} className={selected ? "ring-2 ring-brand/40" : ""} />
            <span className="sr-only">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Default avatar key when a profile has none saved. */
export const DEFAULT_AVATAR = "fawn";
