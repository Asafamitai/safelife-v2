import Link from "next/link";
import { PhoneFrame } from "@/components/phone-frame";
import { DemoSheet } from "@/components/demo-sheet";

export default function LandingPage() {
  return (
    <main className="bg-hero-gradient">
      {/* ======================================================================
          HERO
         ====================================================================== */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-14 lg:pt-20">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          {/* Left: brand text, CTAs, stats */}
          <div>
            <span className="inline-block rounded-full bg-chip-blue px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.02em] text-accent">
              Trusted support for aging parents
            </span>

            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-tight text-ink lg:text-[64px]">
              Make sure your parents are safe — without checking on them all
              day.
            </h1>

            <p className="mt-6 max-w-[520px] text-[18px] leading-[1.5] text-ink-2">
              SafeLife helps aging parents avoid scams, manage daily tasks, and
              get help fast — while giving families peace of mind.
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
                Your app
              </Link>
              <Link
                href="/parent/home"
                className="w-full sm:w-auto rounded-[14px] border border-ink bg-white px-6 py-3.5 text-center text-[15px] font-semibold text-ink transition-all hover:-translate-y-[1px] hover:bg-panel active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Their app
              </Link>
            </div>

            <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
              {[
                { n: "1 tap", l: "to get help" },
                { n: "24/7", l: "scam check support" },
                { n: "1 app", l: "for the whole family" },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-[14px] border border-line bg-white p-4"
                >
                  <div className="text-[22px] font-extrabold tracking-tight">
                    {s.n}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phone */}
          <PhoneFrame />
        </div>
      </section>

      {/* ======================================================================
          PROBLEM
         ====================================================================== */}
      <section className="border-t border-line bg-off-white px-6 py-24">
        <div className="mx-auto max-w-[1080px] text-center">
          <h2 className="text-balance text-[36px] font-extrabold leading-[1.15] tracking-tight text-ink lg:text-[44px]">
            The problem is not one emergency. It is constant low-grade worry.
          </h2>
          <p className="mx-auto mt-5 max-w-[760px] text-[17px] leading-[1.5] text-ink-2">
            Parents are overwhelmed by apps, passwords, suspicious messages,
            appointment logistics, and everyday technology. Families end up
            becoming full-time remote support.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1160px] gap-5 md:grid-cols-3">
          {[
            {
              emoji: "🚨",
              title: "Scams feel constant",
              body: "Suspicious texts, calls, and emails create anxiety and real financial risk.",
            },
            {
              emoji: "📱",
              title: "Tech feels harder every year",
              body: "Simple tasks turn into frustrating moments that chip away at confidence and independence.",
            },
            {
              emoji: "👨‍👩‍👧",
              title: "Families carry the burden",
              body: "Adult children become the default help desk, even when they are juggling work, kids, and distance.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-line bg-white p-7 shadow-card"
            >
              <div className="text-2xl" aria-hidden>
                {c.emoji}
              </div>
              <h3 className="mt-4 text-[20px] font-extrabold tracking-tight text-ink">
                {c.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.5] text-ink-2">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================================
          SOLUTION
         ====================================================================== */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-[1160px] gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <h2 className="text-balance text-[36px] font-extrabold leading-[1.1] tracking-tight text-ink lg:text-[44px]">
              One trusted place for the things that matter most.
            </h2>
            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.5] text-ink-2">
              SafeLife keeps the experience simple for parents while giving
              family members visibility and peace of mind.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Scam Shield",
                body: "Check suspicious texts, emails, and links before taking action.",
              },
              {
                title: "Medication Reminders",
                body: "Simple prompts and confirmations that help keep daily routines on track.",
              },
              {
                title: "Help in One Tap",
                body: "Ask for help with appointments, rides, messages, and technology without frustration.",
              },
              {
                title: "Family Updates",
                body: "Get the right alerts at the right time without hovering or micromanaging.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <h3 className="text-[17px] font-bold tracking-tight text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.5] text-ink-2">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================
          AUDIENCES
         ====================================================================== */}
      <section className="bg-panel px-6 py-20">
        <div className="mx-auto grid max-w-[1160px] gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-8">
            <div className="text-[13px] text-muted">For you</div>
            <h3 className="mt-2 text-[28px] font-extrabold tracking-tight text-ink">
              Worry less
            </h3>
            <p className="mt-4 text-[15px] leading-[1.5] text-ink-2">
              Know when something matters, protect against common risks, and
              feel connected without checking in all day.
            </p>
          </div>
          <div className="rounded-2xl bg-ink p-8 text-white">
            <div className="text-[13px] text-white/60">For your loved one</div>
            <h3 className="mt-2 text-[28px] font-extrabold tracking-tight">
              Stay independent
            </h3>
            <p className="mt-4 text-[15px] leading-[1.5] text-white/80">
              Simple support for daily life without needing to master another
              complicated app.
            </p>
          </div>
          <div className="rounded-2xl bg-chip-blue p-8">
            <div className="text-[13px] text-accent">For everyone</div>
            <h3 className="mt-2 text-[28px] font-extrabold tracking-tight text-ink">
              Keep life moving
            </h3>
            <p className="mt-4 text-[15px] leading-[1.5] text-ink-2">
              Make reminders, appointments, and everyday support feel calm,
              safe, and manageable.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================================
          QUOTE / CTA
         ====================================================================== */}
      <section className="bg-ink px-6 py-24 text-center text-white">
        <p className="mx-auto max-w-[900px] text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight lg:text-[40px]">
          &ldquo;I just want to know they&apos;re okay — without becoming tech
          support every day.&rdquo;
        </p>
        <p className="mt-4 text-[15px] text-white/60">
          That is exactly what SafeLife is built for.
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
            Your app
          </Link>
          <Link
            href="/parent/home"
            className="w-full sm:w-auto rounded-[14px] border border-white/40 px-6 py-3.5 text-center text-[15px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-white/10 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Their app
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
