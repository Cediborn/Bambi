"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type GuideMood = "wave" | "idle" | "point" | "celebrate";

interface TourGuideProps {
  avatar: string;
  mood?: GuideMood;
  size?: number;
  className?: string;
}

/**
 * TourGuide — the user's selected avatar rendered as a living character
 * that guides them through the tour.
 *
 * The avatar appears with contextual animations:
 * - wave: friendly greeting when a step starts
 * - idle: calm presence while explaining
 * - point: gesturing toward the highlighted feature
 * - celebrate: happy reaction on completion
 *
 * A subtle bounce animation gives the character a playful, alive feel
 * without being distracting.
 */
export function TourGuide({
  avatar,
  mood = "idle",
  size = 64,
  className = "",
}: TourGuideProps) {
  const reduce = useReducedMotion();
  const [breathe, setBreathe] = useState(false);

  // Gentle breathing/bounce animation
  useEffect(() => {
    if (reduce) return;
    const interval = window.setInterval(() => {
      setBreathe((b) => !b);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [reduce]);

  const getAnimation = () => {
    if (reduce) return {};
    switch (mood) {
      case "wave":
        return {
          rotate: [0, -8, 8, -4, 4, 0],
          scale: [1, 1.08, 1.08, 1.05, 1.05, 1],
          transition: { duration: 0.8, ease: EASE },
        };
      case "celebrate":
        return {
          y: [0, -6, 0, -3, 0],
          scale: [1, 1.1, 1, 1.05, 1],
          rotate: [0, -5, 5, -3, 0],
          transition: { duration: 0.7, ease: EASE },
        };
      case "point":
        return {
          x: [0, 3, 0],
          rotate: [0, 5, 0],
          transition: { duration: 0.5, ease: EASE },
        };
      default:
        return {
          y: breathe ? -2 : 0,
          transition: { duration: 1.2, ease: EASE },
        };
    }
  };

  return (
    <motion.div
      className={`relative inline-flex shrink-0 ${className}`}
      animate={getAnimation()}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <div
        className="rounded-full shadow-lg"
        style={{
          width: size,
          height: size,
          boxShadow: `0 4px 20px rgba(139, 92, 246, 0.2)`,
        }}
      >
        <Avatar avatar={avatar} size={size} />
      </div>
      {/* Speech bubble tail — a small triangle pointing left */}
      <div
        aria-hidden="true"
        className="absolute -left-1.5 top-1/2 -translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderRight: "6px solid white",
          filter: "drop-shadow(-1px 0 1px rgba(0,0,0,0.05))",
        }}
      />
    </motion.div>
  );
}

/**
 * GuideSpeechBubble — wraps tour step content in a speech-bubble style
 * card that feels like the avatar is speaking directly to the user.
 */
export function GuideSpeechBubble({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-line bg-white p-5 shadow-lift dark:border-white/[0.1] dark:bg-card ${className}`}
    >
      {children}
    </div>
  );
}
