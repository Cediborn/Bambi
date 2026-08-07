"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { TreeInfo } from "@/utils/tree";

/**
 * TreeSVG — the garden's living centerpiece.
 *
 * Six stages: seed → sprout → sapling → young → large → flowering.
 * The scene is drawn in pure SVG: soil, trunk, branching, canopy
 * clusters, leaves (driven by last week's rhythm) and flowers
 * (driven by unlocked achievements). Parts fade in with a gentle
 * stagger when the card mounts or the tree grows.
 *
 * When `tended` is true (watered today), the whole tree sways slowly
 * around the trunk base and a soft water-glow breathes behind the
 * canopy.
 *
 * Note: animated shapes set `transformBox: fill-box` + center origin so
 * framer's scale stays in place instead of scaling from the SVG origin.
 * Static placement (leaf rotation, flower position) lives on plain
 * `<g>` wrappers so it isn't overridden by framer's style transform.
 */

/** Style that keeps SVG scale animations anchored to the shape itself. */
const ANCHOR: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };

interface CanopyCircle {
  x: number;
  y: number;
  r: number;
  fill: number; // index into CANOPY_GREENS
}

const CANOPY_GREENS = ["#1f7a4d", "#2b915d", "#37a86c", "#45bd7d", "#2f8f63", "#3da671"];

/* Canopy cluster sets, one per stage index. */
const CANOPY_SETS: CanopyCircle[][] = [
  [], // seed
  [], // sprout — two leaves instead
  [
    { x: 100, y: 78, r: 17, fill: 1 },
    { x: 87, y: 86, r: 12, fill: 0 },
    { x: 113, y: 86, r: 12, fill: 2 },
  ],
  [
    { x: 100, y: 60, r: 22, fill: 2 },
    { x: 82, y: 70, r: 16, fill: 1 },
    { x: 118, y: 70, r: 16, fill: 3 },
    { x: 94, y: 46, r: 14, fill: 4 },
    { x: 108, y: 46, r: 14, fill: 1 },
  ],
  [
    { x: 100, y: 54, r: 26, fill: 2 },
    { x: 78, y: 68, r: 20, fill: 1 },
    { x: 122, y: 68, r: 20, fill: 3 },
    { x: 90, y: 40, r: 18, fill: 4 },
    { x: 112, y: 40, r: 18, fill: 2 },
    { x: 100, y: 28, r: 14, fill: 5 },
    { x: 68, y: 82, r: 12, fill: 0 },
    { x: 132, y: 82, r: 12, fill: 4 },
  ],
  [
    { x: 100, y: 52, r: 28, fill: 2 },
    { x: 76, y: 64, r: 22, fill: 1 },
    { x: 124, y: 64, r: 22, fill: 3 },
    { x: 88, y: 36, r: 20, fill: 4 },
    { x: 114, y: 36, r: 20, fill: 2 },
    { x: 100, y: 22, r: 16, fill: 5 },
    { x: 66, y: 80, r: 14, fill: 0 },
    { x: 134, y: 80, r: 14, fill: 4 },
    { x: 100, y: 68, r: 13, fill: 5 },
  ],
];

/* Leaf positions scattered around the canopy. */
const LEAF_SPOTS: Array<[number, number, number]> = [
  [74, 58, -35], [126, 58, 35], [66, 76, 20], [134, 76, -20],
  [86, 34, 15], [114, 34, -15], [100, 20, 0], [60, 86, 40],
  [140, 86, -40], [78, 88, -25], [122, 88, 25], [94, 26, -20],
  [108, 26, 20], [86, 64, 10], [114, 64, -10], [100, 44, 30],
];

/* Flower positions — gold blossoms that bloom with achievements. */
const FLOWER_SPOTS: Array<[number, number]> = [
  [84, 42], [116, 42], [72, 60], [128, 60], [94, 26], [108, 26], [100, 58], [82, 78],
];

function Leaf({ x, y, rot, delay }: { x: number; y: number; rot: number; delay: number }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <motion.g
        style={ANCHOR}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
      >
        <ellipse cx={x} cy={y} rx="5.5" ry="2.8" fill="#3da671" />
        <line x1={x} y1={y} x2={x + 4.6} y2={y} stroke="#2b7a54" strokeWidth="1" />
      </motion.g>
    </g>
  );
}

function Flower({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g
        style={ANCHOR}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <circle cx="0" cy="-4" r="2.4" fill="#fbbf24" />
        <circle cx="3.8" cy="-1.2" r="2.4" fill="#fbbf24" />
        <circle cx="2.3" cy="3.2" r="2.4" fill="#fbbf24" />
        <circle cx="-2.3" cy="3.2" r="2.4" fill="#fbbf24" />
        <circle cx="-3.8" cy="-1.2" r="2.4" fill="#fbbf24" />
        <circle cx="0" cy="0" r="2" fill="#b45309" />
      </motion.g>
    </g>
  );
}

export function TreeSVG({ info, tended = false }: { info: TreeInfo; tended?: boolean }) {
  const stage = info.index;
  const canopy = CANOPY_SETS[stage] ?? [];
  const leaves = LEAF_SPOTS.slice(0, info.leaves);
  const flowers = FLOWER_SPOTS.slice(0, info.flowers);
  const trunkH = stage >= 4 ? 60 : stage >= 3 ? 52 : stage === 2 ? 40 : stage === 1 ? 22 : 0;

  return (
    <svg
      viewBox="0 0 200 160"
      role="img"
      aria-label={`BAMBI tree, stage: ${info.stage.name}${tended ? ", freshly watered" : ""}`}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c5a3a" />
          <stop offset="100%" stopColor="#5b3f28" />
        </linearGradient>
        {/* Soft water-glow behind the canopy when freshly tended. */}
        <radialGradient id="waterGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#7de3b1" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#45bd7d" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#45bd7d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soil (never sways) */}
      <ellipse cx="100" cy="148" rx="72" ry="9" fill="#3b2f23" />
      <ellipse cx="100" cy="146" rx="72" ry="7" fill="#4c3b2a" />

      {/* Freshly watered: a soft glow breathes behind the canopy. */}
      {tended ? (
        <motion.ellipse
          cx="100"
          cy="66"
          rx="52"
          ry="40"
          fill="url(#waterGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      {/* The whole tree sways gently around the trunk base after watering. */}
      <g className={tended ? "tree-sway" : undefined}>
        {/* Seed (stage 0) */}
        {stage === 0 ? (
          <motion.ellipse
            cx="100"
            cy="140"
            rx="7"
            ry="9"
            fill="#8a6a45"
            style={ANCHOR}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ) : null}

        {/* Trunk */}
        {trunkH > 0 ? (
          <motion.path
            d={`M92 ${148} C 93 ${148 - trunkH * 0.55} 96 ${148 - trunkH * 0.8} 100 ${
              148 - trunkH
            } C 104 ${148 - trunkH * 0.8} 107 ${148 - trunkH * 0.55} 108 ${148} Z`}
            fill="url(#trunk)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        ) : null}

        {/* Sprout leaves (stage 1) */}
        {stage === 1 ? (
          <>
            <motion.ellipse
              cx="92"
              cy="118"
              rx="12"
              ry="6"
              fill="#37a86c"
              style={ANCHOR}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            <motion.ellipse
              cx="108"
              cy="118"
              rx="12"
              ry="6"
              fill="#45bd7d"
              style={ANCHOR}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </>
        ) : null}

        {/* Branches (young tree and beyond) */}
        {stage >= 3 ? (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            stroke="#6b4a2f"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          >
            <path d={`M100 ${148 - trunkH * 0.7} C 90 ${148 - trunkH * 0.78} 84 ${
              148 - trunkH * 0.86
            } 80 ${148 - trunkH * 0.92}`} />
            <path d={`M100 ${148 - trunkH * 0.7} C 110 ${148 - trunkH * 0.78} 116 ${
              148 - trunkH * 0.86
            } 120 ${148 - trunkH * 0.92}`} />
          </motion.g>
        ) : null}

        {/* Canopy clusters */}
        {canopy.map((c, i) => (
          <motion.circle
            key={`c-${i}`}
            cx={c.x}
            cy={c.y}
            r={c.r}
            fill={CANOPY_GREENS[c.fill]}
            style={ANCHOR}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.55, ease: "easeOut" }}
          />
        ))}

        {/* Leaves */}
        {leaves.map(([x, y, rot], i) => (
          <Leaf key={`l-${i}`} x={x} y={y} rot={rot} delay={0.4 + i * 0.04} />
        ))}

        {/* Flowers */}
        {flowers.map(([x, y], i) => (
          <Flower key={`f-${i}`} x={x} y={y} delay={0.5 + i * 0.06} />
        ))}
      </g>
    </svg>
  );
}
