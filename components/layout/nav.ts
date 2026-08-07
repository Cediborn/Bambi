import {
  BookOpenIcon,
  ClipboardIcon,
  CompassIcon,
  FlagIcon,
  HomeIcon,
  TargetIcon,
  TimerIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  /** Accent hex used for the active indicator (sidebar) / tint (mobile). */
  accent: string;
}

/** Primary navigation — single source of truth for sidebar + mobile nav. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Today", icon: HomeIcon, accent: "#8B5CF6" },
  { href: "/habits", label: "Habits", icon: TargetIcon, accent: "#A78BFA" },
  { href: "/focus", label: "Focus", icon: TimerIcon, accent: "#3B82F6" },
  { href: "/growth", label: "Growth", icon: TrendingUpIcon, accent: "#22C55E" },
  { href: "/achievements", label: "Achievements", icon: TrophyIcon, accent: "#FACC15" },
  { href: "/journal", label: "Journal", icon: BookOpenIcon, accent: "#FB923C" },
  { href: "/challenges", label: "Challenges", icon: FlagIcon, accent: "#EC4899" },
  { href: "/vision", label: "Vision", icon: CompassIcon, accent: "#F472B6" },
  { href: "/reflection", label: "Reflection", icon: ClipboardIcon, accent: "#0EA5E9" },
];

/** Items hidden behind the mobile "More" sheet (everything except the 4 pinned + settings). */
export const MORE_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ["/growth", "/achievements", "/challenges", "/vision", "/reflection"].includes(item.href)
);
