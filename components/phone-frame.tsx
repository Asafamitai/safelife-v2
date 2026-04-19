import type { FC } from "react";
import Link from "next/link";
import { FeedCard } from "./feed-card";
import { StatusPill } from "./status-pill";

/**
 * Marketing-only phone mockup. The real parent/family apps live under
 * /app/(parent) and /app/(family) and use a different frame.
 *
 * Inline action chips (Review / Mark safe / Confirm / Reassign) are
 * decorative spans — clicks would have nowhere to go from a static
 * preview. The bottom "Check a message now" CTA is a real Link.
 */
export const PhoneFrame: FC = () => (
  <div className="relative flex justify-center">
    {/* Top-left annotation */}
    <div className="absolute -left-14 top-14 z-10 hidden max-w-[200px] rounded-2xl border border-line bg-white p-3.5 text-[12px] leading-snug text-ink-2 shadow-card lg:block">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        For families
      </div>
      Get alerts only when something matters.
    </div>

    <div className="relative h-[780px] w-[380px] rounded-[54px] bg-ink p-3.5 shadow-phone">
      {/* Notch */}
      <div className="absolute left-1/2 top-[18px] z-20 h-7 w-[120px] -translate-x-1/2 rounded-full bg-ink" />

      {/* Screen */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-off-white">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pb-1 pt-4 text-[13px] font-semibold text-ink">
          <span>9:41</span>
          <span className="flex items-center gap-1.5 text-ink-2">
            <span className="signal-bars inline-flex items-end">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="text-[11px] font-bold">5G</span>
            <span className="font-bold">100%</span>
          </span>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-5 pb-1.5 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-gradient-to-br from-ink to-ink-2 text-[15px] font-extrabold tracking-tight text-white">
              S
            </div>
            <div>
              <div className="text-[14px] font-bold tracking-tight">
                SafeLife
              </div>
              <div className="text-[11px] text-muted">Family hub</div>
            </div>
          </div>
          <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-gradient-to-br from-[#FAD0C4] to-[#FFD1FF] text-[13px] font-bold text-family-ink">
            MA
          </div>
        </div>

        {/* Greeting */}
        <div className="px-5 pb-2 pt-1.5">
          <div className="text-[13px] text-muted">Good morning, Maya</div>
          <h2 className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-tight">
            Mom&apos;s day so far
          </h2>
          <div className="mt-2.5">
            <StatusPill>Mom is okay</StatusPill>
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-2 pt-2">
          <div className="px-1.5 pb-0.5 pt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Today
          </div>

          <FeedCard
            variant="scam"
            tag="Scam check"
            title="Suspicious text blocked"
            body={`"This text asking for bank info looks suspicious. Do not click the link."`}
            time="Now"
            icon={<span aria-hidden>🛡️</span>}
            actions={
              <>
                <span
                  aria-hidden
                  className="rounded-[10px] border border-ink bg-ink px-3 py-2 text-xs font-bold text-white"
                >
                  Review
                </span>
                <span
                  aria-hidden
                  className="rounded-[10px] border border-[rgba(10,10,15,0.12)] bg-white/70 px-3 py-2 text-xs font-bold text-ink"
                >
                  Mark safe
                </span>
              </>
            }
          />

          <FeedCard
            variant="med"
            tag="Medication reminder"
            title="Morning meds — done"
            body="Blood pressure medication marked as taken at 8:00 AM."
            time="8:02"
            icon={<span aria-hidden>💊</span>}
          />

          <FeedCard
            variant="family"
            tag="Family update"
            title="Doctor tomorrow, 10:30 AM"
            body="Ride support booked. Dad will be notified 30 min before."
            time="Tue"
            icon={<span aria-hidden>📅</span>}
          />

          <FeedCard
            variant="ride"
            tag="Help in one tap"
            title="Mom asked for a ride home"
            body="Pickup at Dr. Levi's clinic in 12 min. Cost covered by you."
            time="11:24"
            icon={<span aria-hidden>🚕</span>}
            actions={
              <>
                <span
                  aria-hidden
                  className="rounded-[10px] border border-ink bg-ink px-3 py-2 text-xs font-bold text-white"
                >
                  Confirm
                </span>
                <span
                  aria-hidden
                  className="rounded-[10px] border border-[rgba(10,10,15,0.12)] bg-white/70 px-3 py-2 text-xs font-bold text-ink"
                >
                  Reassign
                </span>
              </>
            }
          />
        </div>

        {/* Bottom CTA */}
        <div className="px-4 pb-2.5 pt-2">
          <Link
            href="/family/home"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-[15px] font-bold tracking-tight text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Check a message now →
          </Link>
        </div>

        {/* Tabbar */}
        <div className="grid grid-cols-4 gap-1 border-t border-line bg-white px-4 pb-5 pt-2.5">
          {[
            { icon: "🏠", label: "Home", active: true },
            { icon: "🛡️", label: "Scam" },
            { icon: "💊", label: "Routines" },
            { icon: "👨‍👩‍👧", label: "Family" },
          ].map((t) => (
            <div
              key={t.label}
              className={`flex flex-col items-center gap-1 py-1 text-[10px] ${
                t.active ? "font-bold text-ink" : "text-muted"
              }`}
            >
              <div
                className={`grid h-[22px] w-[22px] place-items-center rounded-lg text-sm ${
                  t.active ? "bg-[#EEF2FF]" : ""
                }`}
              >
                <span aria-hidden>{t.icon}</span>
              </div>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom-right annotation */}
    <div className="absolute -right-14 bottom-10 z-10 hidden max-w-[200px] rounded-2xl border border-line bg-white p-3.5 text-[12px] leading-snug text-ink-2 shadow-card lg:block">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        For parents
      </div>
      Simple, voice-friendly help without learning new tech.
    </div>
  </div>
);
