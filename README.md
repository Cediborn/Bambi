# BAMBI

BAMBI is a self-growth platform for teenagers and university students. It is
not a productivity app — it is a place to build habits, keep streaks alive,
and reflect daily, so small wins compound. Your garden, a growing tree, a
daily quest, and a journal that belongs to you.

Built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind
CSS v4**, and **Framer Motion**.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first visit you'll
be walked through a short onboarding, then land on **Today**.

```bash
npm run dev      # local development
npm run lint     # ESLint
npm test         # Vitest unit + integration tests
npm run build    # Production build (includes type checking)
npm run start    # Serve the production build
```

## Accounts

BAMBI works fully as a **guest** with no configuration — all data lives in
the browser. Optional **Supabase** authentication (email/password + Google)
is built in and env-gated: copy `.env.local.example` to `.env.local` and
fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
switch accounts on. Without the keys, every auth screen degrades gracefully
to guest mode.

Auth identity is stored separately from garden data (`bambi:auth`), so
signing in or out never touches your habits, streaks or XP.

## Structure

```
app/                 Routes: onboarding, auth, and the (app) area (today,
                     habits, focus, journal, growth, achievements,
                     challenges, vision, reflection, settings)
components/
  ui/                Reusable primitives: Button, Card, Input, Switch,
                     MoodPicker, ProgressRing, Skeleton, Toasts, …
  layout/            AppShell, Sidebar, TopBar, MobileNav, nav config
  icons.tsx          Hand-drawn SVG icon set — no emoji anywhere
  loading/           BootGate + GlobalLoader (branded boot sequence)
  tree/              Tree SVG + loading state
features/            One folder per module: habits, today, journal,
                     challenges, vision, tour, auth, growth, share, …
hooks/               useApp (state + actions), useSounds
utils/               dates, streaks, xp, quests, tree, hero, banner,
                     achievements, greetings — all pure & unit-tested
db/                  Data layer — reducer, persistence, validation,
                     storage boundary, migrations
types/               Shared domain types
docs/                Business rules (the product contract)
```

## State management

A single **reducer + React Context** store (`db/appState.ts` +
`db/AppProvider.tsx`) owns the whole client state. Components never mutate
state directly; they call actions from `useApp()` (`api.addHabit`,
`api.toggleCompletion`, …). XP, streaks, the tree and achievements are
**derived** from state via pure selectors in `utils/`, so there is nothing
to drift out of sync.

## Persistence & validation

```
localStorage / imported JSON / future API data
        ↓  db/schema.ts (Zod, tolerant per-slice)
        ↓  db/migrations.ts (backup version chain)
        ↓  validated AppState
```

- `db/storage.ts` is a tiny `StorageAdapter` boundary — the rest of the app
  never touches `localStorage` directly. Production uses the browser
  adapter; tests inject an in-memory one; a future backend swaps in without
  touching the UI.
- `db/schema.ts` runtime-validates everything that crosses the boundary
  with **Zod**. Corrupt slices are dropped or reset to defaults — the app
  never crashes on bad data, and one bad field never destroys the rest.
- Corrupted JSON, storage quota errors, and private-mode storage are all
  handled silently (the app keeps working in memory).
- **Import/export** lives in Settings. Backups are JSON envelopes
  (`{ app, version, exportedAt, state }`). Restoring validates the file,
  runs any needed migrations, and normalizes the state. Backups from newer
  BAMBI versions are rejected with a friendly message.

## Business rules

XP, streaks, streak freezes and challenges have explicit, documented rules —
see **[docs/BUSINESS_RULES.md](docs/BUSINESS_RULES.md)**. The implementation
matches them, and `tests/` pin the behavior.

## Testing

`vitest` covers the pure logic (XP, streaks, freezes, quests, tree, hero,
banner, achievements), the **reducer** (every domain and edge case), the
**persistence boundary** (corruption, quota errors, round trips), **backup
migrations**, and **integration flows** (create habit → complete → streak/XP
→ Today UI; journal → save → reload; export → reset → import). Run with
`npm test`.

## Design language

- Light palette from the BAMBI spec (background `#F8FAFC`, primary
  `#4F46E5`) with a full dark mode (`#0F172A`) — see `app/globals.css`.
- Six user-selectable accent colors, applied at runtime via CSS variables.
- 12–20px radii, soft shadows, large type, subtle fade/slide/scale
  animations; a `prefers-reduced-motion`-aware motion system.
- Accessibility first: keyboard navigation, visible focus rings, ARIA
  labels, `role` semantics on custom controls, `aria-live` announcements,
  and reduced-motion support throughout.

## Extending

The UI only ever talks to the store through `useApp()` actions. To move to a
backend later, replace `db/AppProvider.tsx` + `db/persistence.ts` with
remote calls — the reducer shapes map 1:1 to tables (`habits`, `completions`,
`journal`, `profiles`). The validation layer (`db/schema.ts`) already
expects external data, so API responses can be fed straight through
`parseState`.
