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

1. **Scam Shield** — Paste/forward a suspicious text, email, or link. SafeLife
   rates it (safe / suspicious / clearly a scam) and explains why in one
   sentence. Offers "block" and "mark safe." Optional auto-forward from the
   parent's phone.
2. **Medication Reminders** — Simple prompts at set times. Big tap target to
   confirm. Missed doses surface to the family feed (not as an alert — as a
   soft note).
3. **Help in One Tap** — A single "I need help" button on the parent home
   screen that opens a short menu: *ride, appointment, message someone,
   tech help*. Each routes to a family member or a pre-approved service.
4. **Family Updates** — Right alerts at the right time. No "mom opened the
   app" noise. Only: scam blocked, meds missed, help requested, appointments
   booked/confirmed.

Not in v1: payments, wearables/fall-detection, calling the cavalry /
emergency services, medical records.

## 4. Information architecture

### Parent app (iOS-first, voice-friendly)
```
Home
 ├── Status ("You're all set today")
 ├── Big CTA: "I need help"  →  Help sheet (Ride / Appt / Message / Tech)
 ├── Today's meds  (tap to confirm)
 └── Scam checker  (paste or forward)

Help history   Settings (font size, voice, family)
```

### Family app (iOS + web)
```
Home (today feed)
 ├── Pill: "Mom is okay" / "Needs attention"
 ├── Feed cards: Scam check, Medication, Family update, Ride/help
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
| `red-bg / red-ink` | `#FEECEC` / `#B42318` | Scam |
| `blue-bg / blue-ink` | `#E8F0FE` / `#1D4FD8` | Medication |
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
4. **M4 — Scam check flow**: Paste/forward flow, rule-based rating, add an
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
