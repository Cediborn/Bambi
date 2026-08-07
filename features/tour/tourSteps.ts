import type { Tour, TourStep } from "./tourTypes";

/**
 * The two built-in tours.
 *
 * Steps map 1:1 to BAMBI's real modules. Most module steps rely on the
 * page-title fallback (every page has an h1); the Today steps target the
 * data-tour markers added in app/(app)/today/page.tsx.
 */

const WELCOME: TourStep = {
  id: "welcome",
  kind: "welcome",
  title: "Welcome to BAMBI",
  description:
    "BAMBI is your personal space for planning, learning, building better habits and keeping track of the things that matter to you.",
};

const TODAY: TourStep = {
  id: "today",
  route: "/today",
  target: "[data-tour=\"today-hero\"]",
  title: "Your day, at a glance",
  description:
    "This is home. One glance tells you how today looks — your level, your streak and the one thing that matters right now.",
};

const QUEST: TourStep = {
  id: "quest",
  route: "/today",
  target: "[data-tour=\"today-quest\"]",
  title: "Your daily quest",
  description:
    "Each morning BAMBI picks one small, meaningful action. Finish it and the XP is yours — a tiny story for the day.",
};

const TREE: TourStep = {
  id: "tree",
  route: "/today",
  target: "[data-tour=\"today-tree\"]",
  title: "Your growing tree",
  description:
    "This is your garden, growing with you. Water it by tending to your day — small, consistent steps are what make it grow.",
};

const FOCUS_LIST: TourStep = {
  id: "focus-list",
  route: "/today",
  target: "[data-tour=\"today-focus\"]",
  title: "Today's focus",
  description:
    "The day's habits, gathered in one list. Tick off the small ones as you go — BAMBI celebrates the streak, not the size.",
};

const XP: TourStep = {
  id: "xp",
  route: "/today",
  target: "[data-tour=\"today-xp\"]",
  title: "XP & levels",
  description:
    "Every completion earns XP. Watch the bar fill — each level is a small milestone on the way to the next one.",
};

const WEEK: TourStep = {
  id: "week",
  route: "/today",
  target: "[data-tour=\"today-week\"]",
  title: "Your week",
  description:
    "The last seven days in one strip. Completed days glow softly — consistency is the whole game here.",
};

const HABITS: TourStep = {
  id: "habits",
  route: "/habits",
  title: "Build better habits",
  description:
    "Use Habits to build routines and stay consistent. Add something you want to practice, choose how often, and check in as you go.",
};

const FOCUS: TourStep = {
  id: "focus",
  route: "/focus",
  title: "Own your time",
  description:
    "Focus is a gentle Pomodoro timer. Plant yourself for a session, and watch your deep-work minutes quietly add up.",
};

const GROWTH: TourStep = {
  id: "growth",
  route: "/growth",
  title: "Watch yourself grow",
  description:
    "Growth turns your consistency into charts and XP — visible proof that small things, done daily, add up.",
};

const ACHIEVEMENTS: TourStep = {
  id: "achievements",
  route: "/achievements",
  title: "Little badges, big moments",
  description:
    "Achievements are collected along the way: streaks, milestones, firsts. There's always something small to earn.",
};

const JOURNAL: TourStep = {
  id: "journal",
  route: "/journal",
  title: "A space to reflect",
  description:
    "Journal is where you untangle your thoughts and log how you're feeling. No one reads it but you.",
};

const CHALLENGES: TourStep = {
  id: "challenges",
  route: "/challenges",
  title: "Challenges",
  description:
    "30-day sprints and custom challenges. Pick something, show up daily, and earn XP when you finish.",
};

const VISION: TourStep = {
  id: "vision",
  route: "/vision",
  title: "Your vision board",
  description:
    "A board for the big dreams — the reasons behind the daily steps. Pin what you're building toward.",
};

const REFLECTION: TourStep = {
  id: "reflection",
  route: "/reflection",
  title: "Weekly reflection",
  description:
    "Once a week, look back: what went well, what didn't, and what's next. Growth becomes visible when you name it.",
};

const SETTINGS: TourStep = {
  id: "settings",
  route: "/settings",
  title: "Settings",
  description:
    "Everything in one place: theme, accent, atmosphere, your profile — and this tour, whenever you want it again.",
};

const COMPLETE: TourStep = {
  id: "complete",
  kind: "complete",
  title: "You're ready.",
  description:
    "That's BAMBI — a calm place to grow. Start with one small thing today, and let it add up.",
};

/** ~30–45 seconds — the spaces you'll use every day. */
export const QUICK_TOUR: Tour = {
  id: "quick",
  label: "Quick tour",
  tagline: "The essentials — your day, habits, focus and journal.",
  duration: "About 30 seconds",
  steps: [WELCOME, TODAY, QUEST, TREE, HABITS, FOCUS, GROWTH, JOURNAL, COMPLETE],
};

/** ~1–2 minutes — every major corner of BAMBI. */
export const FULL_TOUR: Tour = {
  id: "full",
  label: "Full tour",
  tagline: "Every major space, from the garden to the vision board.",
  duration: "About 2 minutes",
  steps: [
    WELCOME,
    TODAY,
    QUEST,
    TREE,
    FOCUS_LIST,
    XP,
    WEEK,
    HABITS,
    FOCUS,
    GROWTH,
    ACHIEVEMENTS,
    JOURNAL,
    CHALLENGES,
    VISION,
    REFLECTION,
    SETTINGS,
    COMPLETE,
  ],
};

/** All available tours, in display order. */
export const TOURS = [QUICK_TOUR, FULL_TOUR];
