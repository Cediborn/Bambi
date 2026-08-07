# BAMBI

BAMBI is a self-growth platform for teenagers and university students. It is
not a productivity app — it is a place to build habits, keep streaks alive,
and reflect daily, so small wins compound.

Built with **Next.js (App Router)**, **React**, **TypeScript**, and
**Tailwind CSS v4**. All data is stored locally in the browser
(`localStorage`) — no account, no backend, no stress.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first visit you'll be
walked through a short onboarding, then land on **Today**.

```bash
npm run lint   # ESLint
npm run build  # Production build (includes type checking)
```

## Structure

```
app/                 Routes: onboarding, and the (app) area (today, habits,
                     growth, achievements, journal, settings)
components/
  ui/                Reusable primitives: Button, Card, Input, ProgressRing,
                     Chip, Switch, MoodPicker, EmptyState, PageHeader
  layout/            AppShell, Sidebar, TopBar, MobileNav, nav config
  icons.tsx          Hand-drawn SVG icon set (no emoji anywhere)
features/            One folder per module: habits, today, growth,
                     achievements, journal, onboarding
hooks/               useApp — access state + actions from any component
utils/               dates, ids, streaks, xp, achievements, habit metadata
db/                  Data layer: reducer, persistence, provider
types/               Shared domain types
```

## Design language

- Light palette from the BAMBI spec (background `#F8FAFC`, primary `#4F46E5`)
  with a full dark mode (`#0F172A` background) — see `app/globals.css`.
- 12–20px radii, soft shadows, large type, subtle fade/slide/scale animations.
- Accessibility first: keyboard navigation, focus rings, `aria` labels,
  `prefers-reduced-motion` support.

## Data model

`Profile`, `Habit` (with a weekly schedule), completions (habit → dates),
`JournalEntry` (one per day), and settings. XP is **derived** from actions
(10 XP per completed goal, 5 XP per journal entry, 20 welcome bonus), so
there is nothing to drift out of sync. Achievements are evaluated live from
the same state.

## Extending

The UI only ever talks to the store through `useApp()` actions. To move to a
backend later (e.g. Supabase), replace `db/AppProvider.tsx` +
`db/persistence.ts` with remote calls — the reducer shapes map 1:1 to tables
(`habits`, `completions`, `journal`, `profiles`).
