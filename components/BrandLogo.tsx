"use client";

import Image from "next/image";

/**
 * BrandLogo — the official BAMBI brand mark.
 *
 * Renders the uploaded deer + leaf logo on a dark-navy brand tile so the
 * mark stays legible and premium on BAMBI's light and dark surfaces alike.
 * The source asset is `/bambi-logo.png`, a transparent crop of the original
 * logo (deer + green leaf preserved exactly).
 */

const LOGO_ASPECT = 586 / 742; // width / height of /bambi-logo.png

interface BrandLogoProps {
  /** Height of the square brand tile in px. Default 36. */
  size?: number;
  /** Extra classes applied to the tile (e.g. rounded, ring, margin). */
  className?: string;
  /** Alt text. Defaults to the accessible "Bambi logo". */
  alt?: string;
}

export function BrandLogo({ size = 36, className = "", alt = "Bambi logo" }: BrandLogoProps) {
  const logoH = Math.round(size * 0.78);
  const logoW = Math.round(logoH * LOGO_ASPECT);

  return (
    <span
      aria-hidden="true" // text is carried by the inner img's alt
      role="img"
      className={`relative flex shrink-0 select-none items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background:
          "radial-gradient(130% 130% at 50% 26%, #172049 0%, #0d1538 52%, #090e28 100%)",
        boxShadow: `0 ${Math.max(2, size * 0.08)}px ${Math.max(8, size * 0.3)}px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(196,181,253,0.22), 0 0 ${Math.max(6, size * 0.22)}px rgba(57,255,20,0.12)`,
      }}
    >
      <Image
        src="/bambi-logo.png"
        alt={alt}
        width={logoW}
        height={logoH}
        priority={size >= 48}
        className="relative z-10"
        style={{ width: logoW, height: logoH }}
      />
    </span>
  );
}
