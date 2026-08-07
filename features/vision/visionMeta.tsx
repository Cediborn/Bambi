import {
  BookIcon,
  FlameIcon,
  HeartIcon,
  LeafIcon,
  SparklesIcon,
  TargetIcon,
  type IconComponent,
} from "@/components/icons";

export interface VisionCategory {
  key: string;
  label: string;
  color: string;
  icon: IconComponent;
}

export const VISION_CATEGORIES: VisionCategory[] = [
  { key: "career", label: "Career", color: "#3B82F6", icon: TargetIcon },
  { key: "health", label: "Health", color: "#22C55E", icon: HeartIcon },
  { key: "adventure", label: "Adventure", color: "#FB923C", icon: FlameIcon },
  { key: "learning", label: "Learning", color: "#8B5CF6", icon: BookIcon },
  { key: "people", label: "People", color: "#EC4899", icon: SparklesIcon },
  { key: "peace", label: "Peace", color: "#0EA5E9", icon: LeafIcon },
];

export function visionCategory(key: string): VisionCategory {
  return VISION_CATEGORIES.find((c) => c.key === key) ?? VISION_CATEGORIES[0];
}
