import {
  BoltIcon,
  BookIcon,
  CrownIcon,
  FlameIcon,
  HeartIcon,
  LeafIcon,
  MedalIcon,
  PenLineIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
} from "@/components/icons";
import type { Achievement } from "@/utils/achievements";

/**
 * Achievement icon key → glyph, shared by the achievements page and the
 * celebration toasts so every badge renders the same mark everywhere.
 */
export const ACHIEVEMENT_ICONS: Record<Achievement["icon"], typeof BoltIcon> = {
  flame: FlameIcon,
  trophy: TrophyIcon,
  bolt: BoltIcon,
  target: TargetIcon,
  pen: PenLineIcon,
  star: StarIcon,
  crown: CrownIcon,
  book: BookIcon,
  leaf: LeafIcon,
  medal: MedalIcon,
  heart: HeartIcon,
};
