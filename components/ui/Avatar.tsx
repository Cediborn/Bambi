"use client";

/**
 * BAMBI buddies — a small set of hand-drawn SVG avatars.
 * No emoji anywhere: each buddy is drawn in the same flat, warm style so
 * they feel like one family. `Avatar` renders one by key, `AvatarPicker`
 * is the selectable grid used in onboarding and settings.
 */

export interface AvatarMeta {
  key: string;
  label: string;
  /** Soft tile color behind the face. */
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

const INK = "#33291F";
const BLUSH = "#F2A08F";

function FawnArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <ellipse cx="15" cy="10" rx="5" ry="8" fill="#C98A5E" transform="rotate(-20 15 10)" />
      <ellipse cx="33" cy="10" rx="5" ry="8" fill="#C98A5E" transform="rotate(20 33 10)" />
      <ellipse cx="15.5" cy="10" rx="2.6" ry="5" fill="#E8B98C" transform="rotate(-20 15.5 10)" />
      <ellipse cx="32.5" cy="10" rx="2.6" ry="5" fill="#E8B98C" transform="rotate(20 32.5 10)" />
      <rect x="12" y="10" width="24" height="26" rx="12" fill="#E0A878" />
      <ellipse cx="24" cy="30" rx="9" ry="6.5" fill="#F5D3B3" />
      <circle cx="19" cy="17" r="1.4" fill="#C98A5E" />
      <circle cx="29" cy="17" r="1.4" fill="#C98A5E" />
      <circle cx="24" cy="19" r="1.4" fill="#C98A5E" />
      <circle cx="19" cy="23" r="2.6" fill={INK} />
      <circle cx="29" cy="23" r="2.6" fill={INK} />
      <circle cx="19.9" cy="22.2" r="0.9" fill="#fff" />
      <circle cx="29.9" cy="22.2" r="0.9" fill="#fff" />
      <ellipse cx="24" cy="30.6" rx="2.1" ry="1.5" fill={INK} />
      <circle cx="15.5" cy="30.5" r="2.2" fill={BLUSH} opacity="0.6" />
      <circle cx="32.5" cy="30.5" r="2.2" fill={BLUSH} opacity="0.6" />
    </svg>
  );
}

function FoxArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M13 15 10 4l12 7z" fill="#E8934C" />
      <path d="M35 15 38 4 26 11z" fill="#E8934C" />
      <path d="M13.5 13.5 11.5 6l8.5 5z" fill="#F6C99E" />
      <path d="M34.5 13.5 36.5 6l-8.5 5z" fill="#F6C99E" />
      <circle cx="24" cy="25" r="13.5" fill="#F2A15C" />
      <ellipse cx="18.5" cy="31" rx="5" ry="4" fill="#FDEBDD" />
      <ellipse cx="29.5" cy="31" rx="5" ry="4" fill="#FDEBDD" />
      <circle cx="19" cy="24" r="2.6" fill={INK} />
      <circle cx="29" cy="24" r="2.6" fill={INK} />
      <circle cx="19.9" cy="23.2" r="0.9" fill="#fff" />
      <circle cx="29.9" cy="23.2" r="0.9" fill="#fff" />
      <ellipse cx="24" cy="31.5" rx="2" ry="1.4" fill={INK} />
      <circle cx="14" cy="29" r="2" fill={BLUSH} opacity="0.6" />
      <circle cx="34" cy="29" r="2" fill={BLUSH} opacity="0.6" />
    </svg>
  );
}

function BunnyArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <ellipse cx="16.5" cy="8" rx="4.5" ry="9" fill="#E4D4F0" />
      <ellipse cx="31.5" cy="8" rx="4.5" ry="9" fill="#E4D4F0" />
      <ellipse cx="16.5" cy="8.5" rx="2" ry="6" fill="#F3B8CE" />
      <ellipse cx="31.5" cy="8.5" rx="2" ry="6" fill="#F3B8CE" />
      <circle cx="24" cy="27" r="14" fill="#F0E6F8" />
      <circle cx="19" cy="25" r="2.6" fill={INK} />
      <circle cx="29" cy="25" r="2.6" fill={INK} />
      <circle cx="19.9" cy="24.2" r="0.9" fill="#fff" />
      <circle cx="29.9" cy="24.2" r="0.9" fill="#fff" />
      <path d="M22.4 30.5 24 32.6l1.6-2.1z" fill="#E58BA6" />
      <path d="M24 31.4v2.6" stroke="#E58BA6" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="14.5" cy="30" r="2.2" fill={BLUSH} opacity="0.55" />
      <circle cx="33.5" cy="30" r="2.2" fill={BLUSH} opacity="0.55" />
    </svg>
  );
}

function BearArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <circle cx="16" cy="12" r="5" fill="#A87F57" />
      <circle cx="32" cy="12" r="5" fill="#A87F57" />
      <circle cx="16" cy="12" r="2.5" fill="#D9BE9C" />
      <circle cx="32" cy="12" r="2.5" fill="#D9BE9C" />
      <circle cx="24" cy="26" r="15" fill="#C79B6E" />
      <ellipse cx="24" cy="31" rx="8" ry="6" fill="#E7D2B6" />
      <circle cx="18.5" cy="24" r="2.7" fill={INK} />
      <circle cx="29.5" cy="24" r="2.7" fill={INK} />
      <circle cx="19.4" cy="23.2" r="0.9" fill="#fff" />
      <circle cx="30.4" cy="23.2" r="0.9" fill="#fff" />
      <ellipse cx="24" cy="31.5" rx="2.2" ry="1.5" fill={INK} />
      <circle cx="13.5" cy="29" r="2.2" fill={BLUSH} opacity="0.5" />
      <circle cx="34.5" cy="29" r="2.2" fill={BLUSH} opacity="0.5" />
    </svg>
  );
}

function OwlArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M18 12 15 6l5.5 5z" fill="#8FB4DA" />
      <path d="M30 12l3-6-5.5 5z" fill="#8FB4DA" />
      <circle cx="24" cy="26" r="14.5" fill="#9DBFE3" />
      <ellipse cx="17" cy="26" rx="6" ry="7" fill="#FDFDFF" />
      <ellipse cx="31" cy="26" rx="6" ry="7" fill="#FDFDFF" />
      <circle cx="18" cy="26" r="2.8" fill={INK} />
      <circle cx="30" cy="26" r="2.8" fill={INK} />
      <circle cx="18.9" cy="25.1" r="1" fill="#fff" />
      <circle cx="30.9" cy="25.1" r="1" fill="#fff" />
      <path d="M22.5 31.5 24 34l1.5-2.5z" fill="#F2A65C" />
      <path d="M24 22.5 21.5 20h5z" fill="#F2A65C" />
    </svg>
  );
}

function CatArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M14 14 11 4l10 7z" fill="#B9BDCB" />
      <path d="M34 14 37 4l-10 7z" fill="#B9BDCB" />
      <path d="M14 13 12.5 7 19 11.5z" fill="#F3B8CE" />
      <path d="M34 13 35.5 7 29 11.5z" fill="#F3B8CE" />
      <circle cx="24" cy="26" r="14.5" fill="#C6C9D4" />
      <circle cx="19" cy="25" r="2.6" fill={INK} />
      <circle cx="29" cy="25" r="2.6" fill={INK} />
      <circle cx="19.9" cy="24.2" r="0.9" fill="#fff" />
      <circle cx="29.9" cy="24.2" r="0.9" fill="#fff" />
      <path d="M22.8 29.5 24 30.7l1.2-1.2z" fill="#E58BA6" />
      <path d="M10 22.5h6M9.5 26h5.5M38 22.5h-6M38.5 26H33" stroke="#9AA0B1" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PandaArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <circle cx="15" cy="11" r="5" fill="#2F2F33" />
      <circle cx="33" cy="11" r="5" fill="#2F2F33" />
      <circle cx="24" cy="26" r="15" fill="#F5F5F7" />
      <ellipse cx="18" cy="24" rx="4.5" ry="6" fill="#2F2F33" />
      <ellipse cx="30" cy="24" rx="4.5" ry="6" fill="#2F2F33" />
      <circle cx="18" cy="24" r="1.9" fill="#F5F5F7" />
      <circle cx="30" cy="24" r="1.9" fill="#F5F5F7" />
      <ellipse cx="24" cy="31" rx="2.4" ry="1.7" fill={INK} />
      <path d="M21.5 33h5" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SproutArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path d="M24 7 C 19 11 21 18 24 20 C 27 18 29 11 24 7 Z" fill="#3FA96A" />
      <circle cx="24" cy="28" r="14" fill="#8FD694" />
      <circle cx="19" cy="26" r="2.5" fill="#2F5233" />
      <circle cx="29" cy="26" r="2.5" fill="#2F5233" />
      <circle cx="19.9" cy="25.2" r="0.9" fill="#fff" />
      <circle cx="29.9" cy="25.2" r="0.9" fill="#fff" />
      <path d="M20.5 31.5 Q24 34.5 27.5 31.5" stroke="#2F5233" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="14.5" cy="30" r="2.2" fill="#F2A08F" opacity="0.5" />
      <circle cx="33.5" cy="30" r="2.2" fill="#F2A08F" opacity="0.5" />
    </svg>
  );
}

/** Renders the art for an avatar key (static switch — never creates components). */
export function AvatarArt({ avatar }: { avatar: string }) {
  switch (avatar) {
    case "fox":
      return <FoxArt />;
    case "bunny":
      return <BunnyArt />;
    case "bear":
      return <BearArt />;
    case "owl":
      return <OwlArt />;
    case "cat":
      return <CatArt />;
    case "panda":
      return <PandaArt />;
    case "sprout":
      return <SproutArt />;
    default:
      return <FawnArt />;
  }
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
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-card ${className}`}
      style={{ width: size, height: size, backgroundColor: meta.bg }}
    >
      <AvatarArt avatar={avatar} />
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
