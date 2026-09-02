import type { Tour, TourStep } from "./tourTypes";

/**
 * The two built-in tours.
 *
 * Steps map 1:1 to BAMBI's real modules. The descriptions are written
 * in the voice of the user's selected avatar — friendly, warm, and personal.
 * Most module steps rely on the page-title fallback (every page has an h1);
 * the Today steps target the data-tour markers added in app/(app)/today/page.tsx.
 */

const WELCOME: TourStep = {
  id: "welcome",
  kind: "welcome",
  title: "Welcome to BAMBI",
  description:
    "Hey there! I'm your buddy, and I'm here to show you around. BAMBI is your personal space for building habits, tracking your mood, and growing a little every day. Ready?",
};

const TODAY: TourStep = {
  id: "today",
  route: "/today",
  target: "[data-tour=\"today-hero\"]",
  title: "Your Dashboard",
  description:
    "This is home — your daily overview. At a glance you can see your streak, your level, and what matters right now. Think of it as your morning check-in.",
};

const QUEST: TourStep = {
  id: "quest",
  route: "/today",
  target: "[data-tour=\"today-quest\"]",
  title: "Your Daily Quest",
  description:
    "Each morning I pick one small, meaningful action for you. Complete it and earn XP — it's a tiny story for the day, and it adds up.",
};

const TREE: TourStep = {
  id: "tree",
  route: "/today",
  target: "[data-tour=\"today-tree\"]",
  title: "Your Growing Tree",
  description:
    "This is your garden, growing with you. Water it by tending to your day — every small, consistent step helps it grow a little taller.",
};

const FOCUS_LIST: TourStep = {
  id: "focus-list",
  route: "/today",
  target: "[data-tour=\"today-focus\"]",
  title: "Today's Focus",
  description:
    "Your habits for today, gathered in one list. Tick them off as you go — I celebrate the streak, not the size of each step.",
};

const XP: TourStep = {
  id: "xp",
  route: "/today",
  target: "[data-tour=\"today-xp\"]",
  title: "XP & Levels",
  description:
    "Every completion earns XP. Watch the bar fill up — each level is a small milestone on your way to the next one.",
};

const WEEK: TourStep = {
  id: "week",
  route: "/today",
  target: "[data-tour=\"today-week\"]",
  title: "Your Week at a Glance",
  description:
    "The last seven days in one strip. Completed days glow softly — consistency is the whole game here.",
};

const HABITS: TourStep = {
  id: "habits",
  route: "/habits",
  title: "Build Better Habits",
  description:
    "Use Habits to build routines and stay consistent. Add something you want to practice, choose how often, and check in as you go.",
};

const FOCUS: TourStep = {
  id: "focus",
  route: "/focus",
  title: "Own Your Time",
  description:
    "Focus is a gentle Pomodoro timer. Plant yourself for a session, and watch your deep-work minutes quietly add up.",
};

const GROWTH: TourStep = {
  id: "growth",
  route: "/growth",
  title: "Watch Yourself Grow",
  description:
    "Growth turns your consistency into charts and XP — visible proof that small things, done daily, add up.",
};

const ACHIEVEMENTS: TourStep = {
  id: "achievements",
  route: "/achievements",
  title: "Little Badges, Big Moments",
  description:
    "Achievements are collected along the way: streaks, milestones, firsts. There's always something small to earn.",
};

const JOURNAL: TourStep = {
  id: "journal",
  route: "/journal",
  title: "Your Personal Journal",
  description:
    "Journal is where you untangle your thoughts and log how you're feeling. It's private — no one reads it but you. Over time, it becomes a map of how far you've come.",
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
  title: "Your Vision Board",
  description:
    "A board for the big dreams — the reasons behind the daily steps. Pin what you're building toward.",
};

const REFLECTION: TourStep = {
  id: "reflection",
  route: "/reflection",
  title: "Weekly Reflection",
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
  title: "You're Ready!",
  description:
    "That's BAMBI — a calm place to grow. Start with one small thing today, and let it add up. I'll be right here.",
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
