/**
 * features/onboarding/starterHabits.ts
 *
 * Onboarding interests + starting-habit generation. Interests are the
 * curated categories shown on the "What are you working on?" step; custom
 * goals ("Something Else") are free text stored on the profile as-is.
 *
 * The custom-goal engine interprets intent instead of matching exact
 * keywords: each known intent (sport, art, coding, business, …) carries a
 * set of keywords and habits that actually serve that goal. Inputs that
 * match nothing AND are too vague are flagged for a short clarification —
 * never handed random habits.
 */

export interface InterestOption {
  key: string;
  label: string;
  /** Short descriptive subtitle shown under the label on the picker. */
  subtitle: string;
  /** Glyph key rendered via HabitGlyph (or "sparkles" for Something Else). */
  glyph: string;
}

export const INTERESTS: InterestOption[] = [
  { key: "study", label: "Study", subtitle: "Learn smarter. Go further.", glyph: "book" },
  { key: "fitness", label: "Fitness", subtitle: "Build strength. Move better.", glyph: "dumbbell" },
  { key: "mind", label: "Mindfulness", subtitle: "Slow down. Be present.", glyph: "brain" },
  {
    key: "productivity",
    label: "Productivity",
    subtitle: "Get things done without burning out.",
    glyph: "clipboard-list",
  },
  { key: "sleep", label: "Sleep", subtitle: "Rest better. Live better.", glyph: "moon" },
  { key: "focus", label: "Focus", subtitle: "Protect your attention.", glyph: "coffee" },
  {
    key: "wellbeing",
    label: "Well-being",
    subtitle: "Take care of the person behind the goals.",
    glyph: "heart",
  },
  { key: "social", label: "Social", subtitle: "Build better connections.", glyph: "users" },
];

/** Marker key for the ninth picker option — never stored on the profile. */
export const SOMETHING_ELSE_KEY = "__something_else__";

export const SOMETHING_ELSE: InterestOption = {
  key: SOMETHING_ELSE_KEY,
  label: "Something Else",
  subtitle: "Your goal. Your thing. Your rules.",
  glyph: "sparkles",
};

export interface StarterHabit {
  name: string;
  icon: string;
  color: string;
  /** Which interest this suggestion is derived from (key or intent key). */
  from: string;
}

/** Suggested first habits, keyed by interest. */
export const STARTER_HABITS: Record<string, StarterHabit> = {
  study: { name: "Study one topic for 30 minutes", icon: "book", color: "#4F46E5", from: "study" },
  fitness: { name: "Work out for 20 minutes", icon: "dumbbell", color: "#F97316", from: "fitness" },
  mind: { name: "Meditate for 10 minutes", icon: "brain", color: "#8B5CF6", from: "mind" },
  productivity: {
    name: "Plan tomorrow's top 3 tasks",
    icon: "clipboard-list",
    color: "#F59E0B",
    from: "productivity",
  },
  sleep: { name: "Get into bed by 11 PM", icon: "moon", color: "#0EA5E9", from: "sleep" },
  focus: { name: "Deep work for 60 minutes", icon: "coffee", color: "#14B8A6", from: "focus" },
  wellbeing: { name: "Drink 2L of water", icon: "droplet", color: "#22C55E", from: "wellbeing" },
  social: { name: "Reach out to a friend", icon: "users", color: "#6366F1", from: "social" },
};

/* ---------- Custom-goal intent engine ---------- */

export interface CustomIntent {
  key: string;
  label: string;
  /** Substring keywords matched against the lowercased input. */
  keywords: string[];
  habits: StarterHabit[];
}

/**
 * Known intents, ordered most-specific first so "basketball" wins over a
 * generic "sport" keyword and "learn to code" never falls through to the
 * vague branch. Every habit here serves the goal — never generic filler.
 */
export const CUSTOM_INTENTS: CustomIntent[] = [
  {
    key: "football",
    label: "Football",
    keywords: ["football", "soccer", "footie", "futbol", "fútbol"],
    habits: [
      { name: "Practice ball control for 20 minutes", icon: "target", color: "#22C55E", from: "football" },
      { name: "Practice shooting for 15 minutes", icon: "target", color: "#4F46E5", from: "football" },
      { name: "Do a short conditioning session", icon: "dumbbell", color: "#F97316", from: "football" },
      { name: "Stretch after training", icon: "heart", color: "#14B8A6", from: "football" },
      { name: "Review one match or training session", icon: "clipboard-list", color: "#0EA5E9", from: "football" },
    ],
  },
  {
    key: "basketball",
    label: "Basketball",
    keywords: ["basketball", "bball", "hoops", "hoop"],
    habits: [
      { name: "Practice shooting for 20 minutes", icon: "target", color: "#F97316", from: "basketball" },
      { name: "Practice ball handling", icon: "target", color: "#4F46E5", from: "basketball" },
      { name: "Make 50 free throws", icon: "target", color: "#F59E0B", from: "basketball" },
      { name: "Complete a short conditioning session", icon: "dumbbell", color: "#22C55E", from: "basketball" },
    ],
  },
  {
    key: "dancing",
    label: "Dancing",
    keywords: ["dance", "dancing", "dancer", "choreograph"],
    habits: [
      { name: "Practice a routine for 20 minutes", icon: "music", color: "#EC4899", from: "dancing" },
      { name: "Learn one new movement", icon: "music", color: "#8B5CF6", from: "dancing" },
      { name: "Stretch for 10 minutes", icon: "heart", color: "#14B8A6", from: "dancing" },
      { name: "Record one practice session", icon: "palette", color: "#0EA5E9", from: "dancing" },
    ],
  },
  {
    key: "coding",
    label: "Coding",
    keywords: ["code", "coding", "program", "programming", "developer", "software", "app dev", "web dev"],
    habits: [
      { name: "Code for 30 minutes", icon: "coffee", color: "#4F46E5", from: "coding" },
      { name: "Solve one programming problem", icon: "target", color: "#14B8A6", from: "coding" },
      { name: "Learn one new programming concept", icon: "book", color: "#8B5CF6", from: "coding" },
      { name: "Work on a personal project", icon: "clipboard-list", color: "#F59E0B", from: "coding" },
    ],
  },
  {
    key: "business",
    label: "Business",
    keywords: ["business", "startup", "entrepreneur", "company", "brand", "venture", "side hustle", "ecommerce", "e-commerce", "shop", "store"],
    habits: [
      { name: "Spend 20 minutes developing the business idea", icon: "brain", color: "#8B5CF6", from: "business" },
      { name: "Research one competitor", icon: "clipboard-list", color: "#0EA5E9", from: "business" },
      { name: "Work on the business plan", icon: "clipboard-list", color: "#4F46E5", from: "business" },
      { name: "Contact one potential customer or partner", icon: "users", color: "#22C55E", from: "business" },
    ],
  },
  {
    key: "music",
    label: "Music",
    keywords: ["guitar", "piano", "drums", "violin", "ukulele", "music", "instrument", "sing", "singing", "song"],
    habits: [
      { name: "Practice your instrument for 20 minutes", icon: "music", color: "#EC4899", from: "music" },
      { name: "Learn one new song or riff", icon: "music", color: "#8B5CF6", from: "music" },
      { name: "Record a short practice session", icon: "palette", color: "#14B8A6", from: "music" },
      { name: "Study one reference track", icon: "book", color: "#4F46E5", from: "music" },
    ],
  },
  {
    key: "photography",
    label: "Photography",
    keywords: ["photography", "photo", "photos", "camera", "photoshoot"],
    habits: [
      { name: "Take 10 photos", icon: "palette", color: "#0EA5E9", from: "photography" },
      { name: "Study one composition technique", icon: "book", color: "#4F46E5", from: "photography" },
      { name: "Edit one photo", icon: "palette", color: "#8B5CF6", from: "photography" },
      { name: "Review and pick your best shot", icon: "target", color: "#F59E0B", from: "photography" },
    ],
  },
  {
    key: "art",
    label: "Art",
    keywords: ["art", "paint", "painting", "draw", "drawing", "sketch", "illustrat", "design art"],
    habits: [
      { name: "Create one small piece", icon: "palette", color: "#EC4899", from: "art" },
      { name: "Practice one drawing technique", icon: "palette", color: "#8B5CF6", from: "art" },
      { name: "Study an artist or style", icon: "book", color: "#4F46E5", from: "art" },
      { name: "Organize your art space", icon: "clipboard-list", color: "#14B8A6", from: "art" },
    ],
  },
  {
    key: "writing",
    label: "Writing",
    keywords: ["write", "writing", "author", "blog", "blogging", "novel", "poetry", "poem", "copywriting"],
    habits: [
      { name: "Write for 20 minutes", icon: "book", color: "#4F46E5", from: "writing" },
      { name: "Outline one new piece", icon: "clipboard-list", color: "#F59E0B", from: "writing" },
      { name: "Edit something you wrote", icon: "palette", color: "#8B5CF6", from: "writing" },
      { name: "Read one piece of great writing", icon: "book", color: "#EC4899", from: "writing" },
    ],
  },
  {
    key: "language",
    label: "Language",
    keywords: ["language", "spanish", "french", "japanese", "german", "italian", "korean", "chinese", "portuguese", "russian", "duolingo"],
    habits: [
      { name: "Practice your language for 15 minutes", icon: "book", color: "#14B8A6", from: "language" },
      { name: "Learn 10 new words", icon: "brain", color: "#8B5CF6", from: "language" },
      { name: "Have one short conversation", icon: "users", color: "#22C55E", from: "language" },
      { name: "Review yesterday's vocabulary", icon: "clipboard-list", color: "#0EA5E9", from: "language" },
    ],
  },
  {
    key: "reading",
    label: "Reading",
    keywords: ["read", "reading", "books", "book club"],
    habits: [
      { name: "Read for 20 minutes", icon: "book", color: "#4F46E5", from: "reading" },
      { name: "Finish one chapter", icon: "book", color: "#8B5CF6", from: "reading" },
      { name: "Take notes on what you read", icon: "clipboard-list", color: "#F59E0B", from: "reading" },
      { name: "Pick your next book", icon: "target", color: "#14B8A6", from: "reading" },
    ],
  },
  {
    key: "running",
    label: "Running",
    keywords: ["run", "running", "jog", "jogging", "marathon", "sprint", "trail"],
    habits: [
      { name: "Run for 20 minutes", icon: "dumbbell", color: "#F97316", from: "running" },
      { name: "Do one interval session", icon: "target", color: "#4F46E5", from: "running" },
      { name: "Stretch after running", icon: "heart", color: "#14B8A6", from: "running" },
      { name: "Plan next week's runs", icon: "clipboard-list", color: "#0EA5E9", from: "running" },
    ],
  },
  {
    key: "fitness",
    label: "Fitness",
    keywords: ["gym", "lift", "lifting", "weights", "strength", "bodybuild", "calisthenics", "workout", "exercise", "muscle", "get fit", "in shape"],
    habits: [
      { name: "Follow a short strength session", icon: "dumbbell", color: "#F97316", from: "fitness" },
      { name: "Add 5 reps or a little more weight", icon: "target", color: "#F59E0B", from: "fitness" },
      { name: "Track your lifts", icon: "clipboard-list", color: "#0EA5E9", from: "fitness" },
      { name: "Stretch or mobilize for 10 minutes", icon: "heart", color: "#14B8A6", from: "fitness" },
    ],
  },
  {
    key: "wellness",
    label: "Wellness",
    keywords: ["yoga", "meditat", "stretch", "pilates", "breathe", "breathing", "mindfulness", "calm", "wellness", "self care", "self-care", "rest"],
    habits: [
      { name: "Practice yoga or stretching for 15 minutes", icon: "heart", color: "#14B8A6", from: "wellness" },
      { name: "Meditate for 10 minutes", icon: "brain", color: "#8B5CF6", from: "wellness" },
      { name: "Do one breathing exercise", icon: "brain", color: "#0EA5E9", from: "wellness" },
      { name: "Journal how your body feels", icon: "book", color: "#EC4899", from: "wellness" },
    ],
  },
  {
    key: "cooking",
    label: "Cooking",
    keywords: ["cook", "cooking", "bake", "baking", "chef", "meal prep", "recipes", "recipe"],
    habits: [
      { name: "Cook one new recipe", icon: "heart", color: "#F97316", from: "cooking" },
      { name: "Prep ingredients for one meal", icon: "clipboard-list", color: "#F59E0B", from: "cooking" },
      { name: "Learn one cooking technique", icon: "book", color: "#4F46E5", from: "cooking" },
      { name: "Taste and adjust one dish", icon: "target", color: "#22C55E", from: "cooking" },
    ],
  },
  {
    key: "swimming",
    label: "Swimming",
    keywords: ["swim", "swimming", "swimmer", "laps", "pool"],
    habits: [
      { name: "Swim for 20 minutes", icon: "droplet", color: "#0EA5E9", from: "swimming" },
      { name: "Practice one stroke drill", icon: "target", color: "#4F46E5", from: "swimming" },
      { name: "Do a short kick session", icon: "dumbbell", color: "#F97316", from: "swimming" },
      { name: "Stretch after swimming", icon: "heart", color: "#14B8A6", from: "swimming" },
    ],
  },
  {
    key: "cycling",
    label: "Cycling",
    keywords: ["cycl", "bike", "biking", "bicycle", "spin class", "ride"],
    habits: [
      { name: "Ride for 30 minutes", icon: "dumbbell", color: "#22C55E", from: "cycling" },
      { name: "Practice one interval", icon: "target", color: "#F97316", from: "cycling" },
      { name: "Check and maintain your bike", icon: "clipboard-list", color: "#0EA5E9", from: "cycling" },
      { name: "Plan a new route", icon: "book", color: "#4F46E5", from: "cycling" },
    ],
  },
  {
    key: "chess",
    label: "Chess",
    keywords: ["chess"],
    habits: [
      { name: "Solve 10 chess puzzles", icon: "brain", color: "#8B5CF6", from: "chess" },
      { name: "Study one opening", icon: "book", color: "#4F46E5", from: "chess" },
      { name: "Play one slow game", icon: "target", color: "#14B8A6", from: "chess" },
      { name: "Review your last game", icon: "clipboard-list", color: "#F59E0B", from: "chess" },
    ],
  },
  {
    key: "gaming",
    label: "Gaming",
    keywords: ["game", "gaming", "gamer", "esports", "esport", "twitch", "speedrun"],
    habits: [
      { name: "Practice for 30 minutes", icon: "target", color: "#8B5CF6", from: "gaming" },
      { name: "Review one of your matches", icon: "clipboard-list", color: "#0EA5E9", from: "gaming" },
      { name: "Learn one new technique or build", icon: "book", color: "#4F46E5", from: "gaming" },
      { name: "Watch one pro or guide video", icon: "coffee", color: "#F59E0B", from: "gaming" },
    ],
  },
  {
    key: "speaking",
    label: "Speaking",
    keywords: ["speak", "speaking", "presentation", "presenting", "pitch", "public talk", "debate"],
    habits: [
      { name: "Rehearse for 15 minutes", icon: "users", color: "#22C55E", from: "speaking" },
      { name: "Write an outline for a talk", icon: "clipboard-list", color: "#4F46E5", from: "speaking" },
      { name: "Record yourself speaking", icon: "palette", color: "#EC4899", from: "speaking" },
      { name: "Watch one great speaker", icon: "book", color: "#0EA5E9", from: "speaking" },
    ],
  },
  {
    key: "design",
    label: "Design",
    keywords: ["design", "figma", "photoshop", "illustrator", "ui", "ux", "graphic"],
    habits: [
      { name: "Design one small piece", icon: "palette", color: "#EC4899", from: "design" },
      { name: "Study one design reference", icon: "book", color: "#4F46E5", from: "design" },
      { name: "Practice one tool skill", icon: "target", color: "#8B5CF6", from: "design" },
      { name: "Collect 3 pieces of inspiration", icon: "clipboard-list", color: "#F59E0B", from: "design" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    keywords: ["marketing", "seo", "social media", "content", "ads", "branding"],
    habits: [
      { name: "Spend 20 minutes on one channel", icon: "target", color: "#F97316", from: "marketing" },
      { name: "Research one competitor", icon: "clipboard-list", color: "#0EA5E9", from: "marketing" },
      { name: "Create one piece of content", icon: "palette", color: "#EC4899", from: "marketing" },
      { name: "Review your analytics", icon: "clipboard-list", color: "#4F46E5", from: "marketing" },
    ],
  },
  {
    key: "investing",
    label: "Investing",
    keywords: ["invest", "investing", "stocks", "trading", "crypto", "personal finance", "saving", "save money", "budget"],
    habits: [
      { name: "Spend 20 minutes learning about one asset", icon: "book", color: "#4F46E5", from: "investing" },
      { name: "Review your budget or portfolio", icon: "wallet", color: "#22C55E", from: "investing" },
      { name: "Read one finance article", icon: "book", color: "#0EA5E9", from: "investing" },
      { name: "Set one saving goal", icon: "target", color: "#F59E0B", from: "investing" },
    ],
  },
  {
    key: "teaching",
    label: "Teaching",
    keywords: ["teach", "teaching", "tutor", "tutoring", "mentor", "coach", "coaching"],
    habits: [
      { name: "Prepare one lesson", icon: "clipboard-list", color: "#4F46E5", from: "teaching" },
      { name: "Practice explaining one concept out loud", icon: "users", color: "#22C55E", from: "teaching" },
      { name: "Collect one new teaching resource", icon: "book", color: "#0EA5E9", from: "teaching" },
      { name: "Reflect on one session", icon: "brain", color: "#8B5CF6", from: "teaching" },
    ],
  },
  {
    key: "gardening",
    label: "Gardening",
    keywords: ["garden", "gardening", "plants", "plant", "vegetable", "herb"],
    habits: [
      { name: "Water and check your plants", icon: "droplet", color: "#22C55E", from: "gardening" },
      { name: "Spend 15 minutes weeding or pruning", icon: "leaf", color: "#14B8A6", from: "gardening" },
      { name: "Learn one plant care tip", icon: "book", color: "#4F46E5", from: "gardening" },
      { name: "Plan one new planting", icon: "clipboard-list", color: "#F59E0B", from: "gardening" },
    ],
  },
  {
    key: "film",
    label: "Film",
    keywords: ["film", "film making", "filmmaking", "video", "youtube", "edit", "editing", "movie"],
    habits: [
      { name: "Film one short clip", icon: "palette", color: "#EC4899", from: "film" },
      { name: "Edit for 30 minutes", icon: "coffee", color: "#8B5CF6", from: "film" },
      { name: "Study one reference scene", icon: "book", color: "#4F46E5", from: "film" },
      { name: "Plan your next video", icon: "clipboard-list", color: "#F59E0B", from: "film" },
    ],
  },
  {
    key: "podcast",
    label: "Podcast",
    keywords: ["podcast"],
    habits: [
      { name: "Outline one episode", icon: "clipboard-list", color: "#4F46E5", from: "podcast" },
      { name: "Record for 20 minutes", icon: "music", color: "#EC4899", from: "podcast" },
      { name: "Edit one segment", icon: "coffee", color: "#8B5CF6", from: "podcast" },
      { name: "Share or promote one episode", icon: "users", color: "#22C55E", from: "podcast" },
    ],
  },
];

/** Shown when a custom goal is too vague to confidently match. */
export const VAGUE_HINT =
  "Could you tell me a little more about what you're working on? For example: “Learn to play guitar” or “Get better at football”.";

const VAGUE_WORDS = new Set([
  "stuff", "things", "thing", "everything", "anything", "something", "nothing",
  "hobby", "hobbies", "goal", "goals", "dream", "dreams", "better", "improve",
  "improving", "improvement", "myself", "myself", "me", "life", "general",
  "various", "lots", "random", "new", "skills", "skill", "learn", "learning",
  "studying", "work", "working", "more", "all", "different", "other", "many",
]);

const STOP_WORDS = new Set([
  "a", "an", "the", "at", "in", "on", "to", "of", "for", "and", "or", "my",
  "your", "with", "from", "by", "about", "want", "wants", "get", "getting",
  "be", "being", "do", "doing", "make", "making", "up", "out", "into", "over",
  "it", "its", "i", "we", "they", "this", "that", "these", "those",
]);

export interface CustomInterpretation {
  /** The trimmed input as typed. */
  input: string;
  /** Matched intent key (e.g. "football") when understood, else null. */
  category: string | null;
  /** Human label of the matched intent, for UI copy. */
  label: string | null;
  /** Habits that serve the goal. Always [] when not understood. */
  habits: StarterHabit[];
  /** True when nothing matched AND the input reads as too vague. */
  vague: boolean;
  /** Clarification copy when `vague`, else null. */
  hint: string | null;
}

/**
 * Interpret a free-text custom goal. Returns the matched intent's habits
 * when the input is understood; a `vague` flag (with a clarification hint)
 * when it is too vague to match anything. Never invents unrelated habits.
 */
export function interpretCustom(raw: string): CustomInterpretation {
  const input = raw.trim();
  if (!input) {
    return { input, category: null, label: null, habits: [], vague: true, hint: VAGUE_HINT };
  }
  const normalized = input.toLowerCase();
  for (const intent of CUSTOM_INTENTS) {
    if (intent.keywords.some((k) => normalized.includes(k))) {
      return { input, category: intent.key, label: intent.label, habits: intent.habits, vague: false, hint: null };
    }
  }
  const words = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const vague =
    normalized.length < 4 ||
    words.length === 0 ||
    words.every((w) => VAGUE_WORDS.has(w) || STOP_WORDS.has(w));
  return { input, category: null, label: null, habits: [], vague, hint: vague ? VAGUE_HINT : null };
}

/* ---------- Interest helpers ---------- */

/** True when an interest entry is one of the curated category keys. */
export function isCategoryInterest(value: string): boolean {
  return INTERESTS.some((i) => i.key === value);
}

/** True when an interest entry is free-text ("Something Else") — not a key. */
export function isCustomInterest(value: string): boolean {
  return !isCategoryInterest(value) && value.trim().length > 0;
}

/** Display label for a suggestion source: category label, intent label, or raw text. */
export function sourceLabel(from: string): string {
  const cat = INTERESTS.find((i) => i.key === from);
  if (cat) return cat.label;
  const intent = CUSTOM_INTENTS.find((i) => i.key === from);
  if (intent) return intent.label;
  return from;
}

/** Upper bound on the starting-habit picker so it stays scannable. */
export const MAX_STARTERS = 12;

/**
 * Every starter suggestion for a set of interests: one habit per curated
 * category plus the matched habits for each custom goal. Deduped by name
 * and capped at MAX_STARTERS.
 */
export function suggestionsFor(interests: string[]): StarterHabit[] {
  const out: StarterHabit[] = [];
  const seen = new Set<string>();
  const push = (h: StarterHabit) => {
    const key = h.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(h);
  };
  for (const value of interests) {
    const starter = STARTER_HABITS[value];
    if (starter) {
      push(starter);
    } else {
      for (const h of interpretCustom(value).habits) push(h);
    }
  }
  return out.slice(0, MAX_STARTERS);
}