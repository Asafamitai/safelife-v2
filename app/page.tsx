import Link from "next/link";
import { PhoneFrame } from "@/components/phone-frame";
import { DemoSheet } from "@/components/demo-sheet";
import { DemoResetGate } from "@/components/demo-reset-gate";

export default function LandingPage() {
  return (
    <main className="bg-hero-gradient">
      <DemoResetGate />
      {/* ======================================================================
          HERO
         ====================================================================== */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-14 lg:pt-20">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          {/* Left: brand text, CTAs */}
          <div>
            <span className="inline-block rounded-full bg-chip-blue px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.02em] text-accent">
              The life operating system for seniors
            </span>

            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-tight text-ink lg:text-[64px]">
              Make sure they’re okay — without managing everything.
            </h1>

            <p className="mt-6 max-w-[540px] text-[20px] font-semibold leading-[1.4] text-ink">
              One interface. Every task. Fully protected.
            </p>
            <p className="mt-4 max-w-[540px] text-[17px] leading-[1.5] text-ink-2">
              SafeLife is an AI-powered integration layer that sits on top of
              the tools your parent already uses — banking, pharmacy, ride
              apps, messaging — and makes them usable, safe, and supportive.
            </p>
            <p className="mt-4 max-w-[540px] text-[17px] leading-[1.5] text-ink-2">
              You’re only looped in when something actually matters.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <DemoSheet
                trigger={
                  <button className="w-full sm:w-auto rounded-[14px] border border-ink bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                    Try the demo →
                  </button>
                }
              />
              <Link
                href="/family/home"
                className="w-full sm:w-auto rounded-[14px] border border-ink bg-white px-6 py-3.5 text-center text-[15px] font-semibold text-ink transition-all hover:-translate-y-[1px] hover:bg-panel active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                For you
              </Link>
              <Link
                href="/parent/home"
                className="w-full sm:w-auto rounded-[14px] border border-ink bg-white px-6 py-3.5 text-center text-[15px] font-semibold text-ink transition-all hover:-translate-y-[1px] hover:bg-panel active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                For your loved one
              </Link>
            </div>
          </div>

          {/* Right: phone */}
          <PhoneFrame />
        </div>
      </section>

      {/* ======================================================================
          THREE PILLARS — mirrors the investor deck's core capabilities
         ====================================================================== */}
      <section className="border-t border-line bg-white px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-accent">
              From confusion to confidence
            </p>
            <h2 className="mt-3 text-balance text-[34px] font-extrabold leading-[1.15] tracking-tight text-ink lg:text-[40px]">
              One interface. Every task. Fully protected.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-line bg-off-white p-6">
              <div
                aria-hidden
                className="grid h-12 w-12 place-items-center rounded-2xl bg-scam-bg text-[26px]"
              >
                🛡️
              </div>
              <h3 className="mt-4 text-[20px] font-bold tracking-tight text-ink">
                Scam Shield
              </h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-ink-2">
                AI detects suspicious messages, calls, and transactions —
                blocking threats before damage is done.
              </p>
            </article>

            <article className="rounded-2xl border border-line bg-off-white p-6">
              <div
                aria-hidden
                className="grid h-12 w-12 place-items-center rounded-2xl bg-chip-blue text-[26px]"
              >
                ✨
              </div>
              <h3 className="mt-4 text-[20px] font-bold tracking-tight text-ink">
                Task Execution
              </h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-ink-2">
                Pay a bill, refill a prescription, book a ride — all through
                one simple conversation. The AI takes action, not just answers.
              </p>
            </article>

            <article className="rounded-2xl border border-line bg-off-white p-6">
              <div
                aria-hidden
                className="grid h-12 w-12 place-items-center rounded-2xl bg-family-bg text-[26px]"
              >
                👪
              </div>
              <h3 className="mt-4 text-[20px] font-bold tracking-tight text-ink">
                Family Layer
              </h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-ink-2">
                Optional visibility and controls keep loved ones informed
                without being intrusive.
              </p>
            </article>
          </div>

          <p className="mx-auto mt-10 max-w-[720px] text-center text-[14px] leading-[1.55] text-muted">
            Under the hood: an Integration Engine built on MCP and open APIs —
            standardized, secure connections to banking, health, and
            communication platforms, with no new credentials for your parent
            to manage.
          </p>
        </div>
      </section>

      {/* ======================================================================
          PROBLEM STATEMENT
         ====================================================================== */}
      <section className="border-t border-line bg-off-white px-6 py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="text-balance text-[36px] font-extrabold leading-[1.15] tracking-tight text-ink lg:text-[44px]">
            Technology shouldn’t be this hard to use.
          </h2>
          <p className="mx-auto mt-5 max-w-[720px] text-[17px] leading-[1.55] text-ink-2">
            SafeLife sits on top of the apps already in use and makes them
            easier to understand, simpler to navigate, and clearer to act on.
          </p>
        </div>
      </section>

      {/* ======================================================================
          CLARITY LINE
         ====================================================================== */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-ink lg:text-[40px]">
            No new apps to learn. Everything works better.
          </h2>
          <p className="mx-auto mt-5 max-w-[720px] text-[17px] leading-[1.55] text-ink-2">
            SafeLife is a layer that connects to the tools already in use — and
            makes them easier to understand, safer to use, and harder to get
            wrong.
          </p>
        </div>
      </section>

      {/* ======================================================================
          PARTNERS — plugs into what they already use
         ====================================================================== */}
      <section className="border-y border-line bg-off-white px-6 py-16">
        <div className="mx-auto max-w-[1080px] text-center">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            Plugs into what they already use
          </div>
          <p className="mx-auto mt-4 max-w-[760px] text-balance text-[22px] font-extrabold leading-[1.25] tracking-tight text-ink lg:text-[26px]">
            SafeLife connects the tools your loved one already uses — and makes
            sure the right things happen at the right time.
          </p>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-2.5">
            {[
              "Aura",
              "TrueCaller",
              "AdhereTech",
              "Pillsy",
              "Apple Health",
              "Google Calendar",
              "Uber",
              "CVS",
            ].map((p) => (
              <span
                key={p}
                className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink-2"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[560px] text-[13px] text-muted">
            Partners listed are representative — SafeLife is a layer on top, not
            a replacement.
          </p>
        </div>
      </section>

      {/* ======================================================================
          HOW IT WORKS
         ====================================================================== */}
      <section className="bg-panel px-6 py-24">
        <div className="mx-auto max-w-[1160px]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">
              🔧 How it works
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Connects to what already exists",
                body: "Messages, calls, reminders, and apps — all in one flow.",
              },
              {
                title: "Simplifies what’s confusing",
                body: "Important information is made clear and easy to act on.",
              },
              {
                title: "Adds a layer of safety",
                body: "Suspicious messages and risky actions are flagged before they cause harm.",
              },
              {
                title: "Keeps things on track",
                body: "Daily routines and important tasks don’t fall through the cracks.",
              },
              {
                title: "Keeps you in the loop — only when needed",
                body: "You’re notified when something actually requires attention.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-line bg-white p-7 shadow-card"
              >
                <h3 className="text-[18px] font-extrabold tracking-tight text-ink">
                  {c.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          WHAT CHANGES (Before / After)
         ====================================================================== */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1080px]">
          <h2 className="text-balance text-[36px] font-extrabold leading-[1.15] tracking-tight text-ink lg:text-[44px]">
            What changes
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-8">
              <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                Before SafeLife
              </div>
              <ul className="mt-5 space-y-3 text-[16px] leading-[1.5] text-ink-2">
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-muted" />
                  Too many apps
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-muted" />
                  Confusing messages
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-muted" />
                  Easy to make mistakes
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-muted" />
                  Constant checking
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-ink p-8 text-white">
              <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">
                With SafeLife
              </div>
              <ul className="mt-5 space-y-3 text-[16px] leading-[1.5] text-white/90">
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-white/60" />
                  One clear flow
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-white/60" />
                  Fewer decisions
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-white/60" />
                  Safer actions
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-white/60" />
                  Calm, not constant oversight
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          FOR BOTH SIDES
         ====================================================================== */}
      <section className="bg-panel px-6 py-20">
        <div className="mx-auto max-w-[1080px]">
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-ink lg:text-[40px]">
            For both sides
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-8">
              <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
                For them
              </div>
              <p className="mt-4 text-[18px] leading-[1.5] text-ink">
                Everything becomes simpler and easier to use — without needing
                to learn new tools.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-8">
              <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
                For family
              </div>
              <p className="mt-4 text-[18px] leading-[1.5] text-ink">
                You don’t have to monitor everything — just what matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          QUOTE / CTA
         ====================================================================== */}
      <section className="bg-ink px-6 py-24 text-center text-white">
        <p className="mx-auto max-w-[900px] text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight lg:text-[40px]">
          &ldquo;We don&apos;t replace tools — we make them actually work for
          them.&rdquo;
        </p>

        <div className="mx-auto mt-10 grid max-w-[480px] gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
          <DemoSheet
            trigger={
              <button className="w-full sm:w-auto rounded-[14px] bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-all hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
                Try the demo →
              </button>
            }
          />
          <Link
            href="/family/home"
            className="w-full sm:w-auto rounded-[14px] border border-white/40 px-6 py-3.5 text-center text-[15px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-white/10 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            For you
          </Link>
          <Link
            href="/parent/home"
            className="w-full sm:w-auto rounded-[14px] border border-white/40 px-6 py-3.5 text-center text-[15px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-white/10 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            For your loved one
          </Link>
        </div>
      </section>

      {/* ======================================================================
          FOOTER
         ====================================================================== */}
      <footer className="border-t border-white/10 bg-ink px-6 py-10 text-white/60">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 text-[13px]">
          <div>© {new Date().getFullYear()} SafeLife, Inc.</div>
          <div className="flex gap-5">
            <Link className="hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-white" href="/terms">
              Terms
            </Link>
            <a className="hover:text-white" href="mailto:hello@safelife.app">
              hello@safelife.app
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
