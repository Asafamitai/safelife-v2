# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The product and visual spec is preserved verbatim in **Part B** below — read it in full before making design or copy changes. Part A is the engineering layer that emerged after M1–M5 landed and the Ask/Insights/integrations work on `feat/insights-ask-and-depth`.

---

## Part A — Engineering notes

### Commands

- `npm run dev` — Next.js dev server (port 3000 by default).
- `npm run build` / `npm start` — production build / serve.
- `npm run lint` — `next lint`.
- `npm run test:e2e` — Playwright suite. **Important:** `playwright.config.ts` launches `next start -p 3100`, so you must `npm run build` first (CI does this). `next dev` is deliberately not used here because cold-start recompiles stall the tests.
- `npm run test:e2e:install` — one-time Chromium install for Playwright. Both projects (`chromium-mobile` = Pixel 7, `chromium-desktop`) share the Chromium binary.
- Run a single spec: `npx playwright test e2e/parent-confirm-med.spec.ts` (add `--project=chromium-desktop` to pick one device).

No backend. No auth. Anything that looks like a service (scam classifier, anomaly detector, ask parser, integrations catalog) is an in-repo pure module — see "Swappable logic seams" below.

### Architecture

**App Router with two personas as route groups.** `app/(parent)/` and `app/(family)/` each have their own `layout.tsx` that wraps children in `AppFrame` + `PersonaSwitch` + a persona-specific `BottomTabBar`. The parent layout adds `text-[18px]` — the "1 step larger" rule from Part B §5 is enforced here, not per-component. The marketing landing page lives at `app/page.tsx` (no group) and is the 1:1 mirror of `design-reference.html`.

**State is Zustand stores in `lib/store/`**, one per domain (`events`, `meds`, `members`, `integrations`, `toasts`). The events store seeds itself from `lib/mock-events.ts` and is the single source of truth for the family feed — scam-check completion in M4 prepends into this store so the family side sees it live. Do not read `MOCK_EVENTS` directly from a component; go through `useEventsStore`.

**Swappable logic seams.** Four modules are written as pure functions with a stable input/output contract so a real backend or Claude API call can drop in without touching the UI:

- `lib/scam-heuristics.ts` — `classifyMessage(text) → ScamResult`. Rule-based for v1; server-side model later.
- `lib/anomalies.ts` — `detect({ connected, meds, events, members }) → Anomaly[]`. Rules read from the stores + `lib/timeseries.ts`.
- `lib/ask-parser.ts` — `answer(question, snapshot) → AskResult`. v1 is intent classification; the contract is explicitly the boundary a Claude API call slides into.
- `lib/integrations.ts` — static catalog of MCP/API providers. No OAuth is wired; connect/disconnect flips local state and drops a soft note in the feed.

When extending any of these, keep the function signature stable and add behavior behind it — the UI is wired to the contract, not the implementation.

**Components split into primitives vs. domain cards.** `components/ui/` holds the two shadcn-style primitives actually in use (`button.tsx`, `sheet.tsx`) — this is not a full shadcn install, add primitives manually when needed. Everything else in `components/` is domain-aware (`feed-card`, `scam-card-actions`, `anomaly-card`, `med-card`, `ask-parser`-backed sheets, etc.) and reads from the Zustand stores directly.

**Theme tokens are the contract between Part B §5 and the code.** They live in `tailwind.config.ts` as named colors (`ink`, `scam.bg`, `med.ink`, etc.). Never hardcode hex in components — if a token is missing, add it to the config and reference it.

**User-facing labels diverged from internal names.** The product surfaces are now **"Protection"** (umbrella) and **"Daily flow"** — but internal identifiers kept the old shorthand for continuity: the route is still `/parent/scam`, the token group is still `scam-bg/scam-ink` / `med-bg/med-ink`, the pure module is still `lib/scam-heuristics.ts`, the `CategoryVariant` literal is still `"scam"` / `"med"`. When adding new code, match the internal convention; when adding new copy, use the product labels.

**Path alias:** `@/*` → repo root (`tsconfig.json`). Use `@/components/...`, `@/lib/...` everywhere.

### Testing conventions

- Playwright specs assert behavior the product promises, not implementation details — e.g. `parent-confirm-med.spec.ts` checks the 44pt tap-target guardrail from Part B §9, and `parent-a11y.spec.ts` uses `@axe-core/playwright` to fail on any WCAG AA color-contrast violation on parent routes. When you add a parent-side screen, add it to the `PARENT_ROUTES` array in that spec.
- No unit test runner is configured. Logic in `lib/*.ts` is exercised through Playwright today; if you add heavy pure logic, prefer adding a minimal runner rather than folding it into e2e.

---

## Part B — Product & Build Spec (original, authoritative)

# SafeLife — Product & Build Spec

This file is the single source of truth for Claude Code. Read it fully before you
start. Everything here is intentional — don't rename things, restructure the
information architecture, or swap the visual system without asking first.

---

## 1. Product in one paragraph

SafeLife is a mobile-first app that helps aging parents stay safe online and
on-track with daily life, while giving their adult children visibility and peace
of mind — without micromanaging. The product has two personas in one app:

- **Parents**: a radically simple surface (scam check, medication confirms,
  one-tap help).
- **Families**: a calm dashboard with the right alerts at the right time.

Positioning line: *"Make sure your parents are safe — without checking on them
all day."*

## 2. Users & jobs-to-be-done

**Parent (primary user, 65+)**
- "Is this text message a scam?"
- "Did I take my morning meds?"
- "I need a ride to the doctor."
- "Can someone help me with this app?"

**Adult child (secondary user, 35–55, primary buyer)**
- "Is mom okay today?"
- "What happened this week I should know about?"
- "Was that suspicious message handled?"
- "Who's driving her to the appointment?"

## 3. Core features (v1 scope)

1. **Protection layer** — Paste/forward a suspicious text, email, or link.
   SafeLife rates it (safe / suspicious / clearly a scam) and explains why in
   one sentence. Offers "block" and "mark safe." Optional auto-forward from
   the loved one's phone. Positioning note: SafeLife is a layer on top of
   existing tools (carrier filters, TrueCaller, Aura, etc.) — not a standalone
   fraud service.
2. **Daily flow** — Simple prompts at set times for medication, routines, and
   recurring tasks. Big tap target to confirm. Missed items surface to the
   family feed as soft notes, not alerts.
3. **Help in One Tap** — A single "I need help" button on the parent home
   screen that opens a short menu: *ride, appointment, message someone,
   tech help*. Each routes to a family member or a pre-approved service.
4. **Family Updates** — Right alerts at the right time. No "mom opened the
   app" noise. Only: scam blocked, meds missed, help requested, appointments
   booked/confirmed.

4. **Emergency dashboard** — Parent-side `🚨` tab. Real-time health and
   location alerts with severity levels (critical / warning / info), sourced
   from connected providers (Apple Health, Apple Watch, etc.). "Notify
   Emergency Contacts" runs a multi-step flow: select contacts → confirm →
   sending animation → success, and drops a soft note in the family feed.

Not in v1: payments, actually dispatching 911, medical records.

## 4. Information architecture

### Parent app (iOS-first, voice-friendly)
```
Home
 ├── Status ("You're all set today")
 ├── Big CTA: "I need help"  →  Help sheet (Ride / Appt / Message / Tech)
 ├── Today's meds  (tap to confirm)
 └── Protection checker  (paste or forward)

Help history   Settings (font size, voice, family)
```

### Family app (iOS + web)
```
Home (today feed)
 ├── Pill: "Mom is okay" / "Needs attention"
 ├── Feed cards: Protection, Daily flow, Family update, Ride/help
 └── CTA: "Check a message now"

Timeline   Members   Settings
```

## 5. Visual system

Keep it close to the mockup. Do NOT generate a new theme.

**Color tokens (hex, no `#` in code where that's the convention)**

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0A0A0F` | Primary text, dark backgrounds |
| `ink-2` | `#2B2E38` | Secondary text |
| `muted` | `#6B7280` | Captions, metadata |
| `line` | `#E6E9F0` | Borders, dividers |
| `panel` | `#F4F6FB` | Section backgrounds |
| `off-white` | `#FBFBFD` | App canvas |
| `accent` | `#1357D3` | Links, category headers |
| `chip-blue` | `#E8F0FE` | Info tints |
| `red-bg / red-ink` | `#FEECEC` / `#B42318` | Protection (scam variant) |
| `blue-bg / blue-ink` | `#E8F0FE` / `#1D4FD8` | Daily flow (med variant) |
| `purple-bg / purple-ink` | `#EFE9FE` / `#5B2BD9` | Family update |
| `green-bg / green-ink` | `#D8F5E3` / `#0B7A3B` | OK status |
| `amber-bg / amber-ink` | `#FFF2D6` / `#8A5A00` | One-tap help |

**Typography**
- Display: Inter (weight 800), tight tracking (-0.02em)
- Body: Inter (400/500/600)
- Parent app uses 1 step larger (min 16pt base, 18pt preferred)

**Motifs**
- Rounded cards (16–20px radius)
- Category tag (uppercase, 11px, letter-spaced pill) on every card
- Status pill with colored dot
- One dominant CTA per screen, filled black

**Components to build first**
`StatusPill`, `CategoryTag`, `FeedCard` (variants: scam/med/family/ride),
`BigCTA`, `PhoneFrame` (for marketing), `BottomTabBar`.

## 6. Tech stack (recommended — confirm with user before changing)

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** with custom theme tokens from §5
- **shadcn/ui** for primitives (Button, Sheet, Dialog, Toast)
- **lucide-react** for icons
- **Zustand** for local app state (minimal)
- **Playwright** for e2e happy paths (parent confirms med; family blocks scam)

Keep it framework-only. No backend/auth in v1 — stub with local JSON + a
`/api/mock/*` route set.

## 7. Repo layout

```
safelife/
├── app/
│   ├── (marketing)/page.tsx           # Landing (match mockup)
│   ├── (parent)/home/page.tsx         # Parent app
│   ├── (parent)/help/page.tsx
│   ├── (parent)/scam/page.tsx
│   ├── (family)/home/page.tsx         # Family app
│   ├── (family)/timeline/page.tsx
│   └── api/mock/...
├── components/
│   ├── ui/                            # shadcn
│   ├── feed-card.tsx
│   ├── status-pill.tsx
│   ├── category-tag.tsx
│   ├── big-cta.tsx
│   ├── phone-frame.tsx
│   └── bottom-tab-bar.tsx
├── lib/
│   ├── data/mock-events.ts            # Feed items
│   ├── theme.ts                       # Token exports
│   └── scam-heuristics.ts             # Simple rules for demo
├── styles/globals.css
├── design-reference.html              # Keep this, mirror it
└── README.md
```

## 8. First milestones (build in order, commit per milestone)

1. **M1 — Scaffold**: Next.js + Tailwind + shadcn; theme tokens wired; landing
   page that matches `design-reference.html` 1:1.
2. **M2 — Family home**: Feed with mock events (from `mock-events.ts`); card
   variants; "Check a message now" CTA opens a placeholder sheet.
3. **M3 — Parent home**: Large-type version; "I need help" sheet with 4 routes;
   medication card with confirm interaction.
4. **M4 — Protection flow**: Paste/forward flow, rule-based rating, add an
   entry to the family feed when blocked.
5. **M5 — Polish & e2e**: Playwright tests for the two happy paths; a11y pass
   (min contrast AA, tap targets ≥ 44pt on parent app).

Each milestone = a working, demo-able slice. Don't start M2 until M1 is
pixel-checked against `design-reference.html`.

## 9. Guardrails

- **Accessibility is a v1 requirement, not a polish pass.** Parent-side screens
  must pass WCAG AA contrast and have 44pt+ tap targets everywhere.
- **No dark patterns.** The family app never nudges toward more-surveillance
  settings ("Turn on location?" etc. stays opt-in, plainly described).
- **Tone is calm, not alarmist.** "Mom is okay" beats "All systems normal."
- **Copy is the product.** Treat strings as design — don't paraphrase the
  mockup's language without asking.

## 10. Open questions for the user

Before M3 — ask the user:
- Confirm iOS-first or iOS+Android simultaneously.
- Confirm whether scam-check is on-device heuristics (v1 demo) or server-side.
- Confirm family members list model (1 parent ↔ N family, or N ↔ N).
- Confirm how help requests are routed (round-robin, primary caregiver, or
  fastest-to-ack).

Do not guess — ask.
