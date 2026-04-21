"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { CategoryTag } from "@/components/category-tag";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";
import {
  ACCOUNTS,
  BILLS,
  TRANSACTIONS,
  formatDollars,
  type Bill,
} from "@/lib/mock-finance";
import { cn } from "@/lib/utils";

/**
 * Parent-side Money dashboard.
 *
 * Layered top to bottom:
 *   1. "AI baseline" strip — frames the page as an AI-monitored surface.
 *   2. AI noticed — the flagged-unusual transactions bubble up first.
 *   3. Balances — checking, savings, credit (read-only summary).
 *   4. Recent activity — last six transactions with recurring/paid chips.
 *   5. Bills due — each bill has a one-tap "Pay with SafeLife" CTA.
 *   6. Quick actions — food, pharmacy, ride links (land in Help sheet flows
 *      on Home today; phase 2 wires each one to its own MCP call).
 */

export default function ParentMoneyPage() {
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  const flagged = TRANSACTIONS.filter((t) => t.flag === "unusual");

  function pay(bill: Bill) {
    if (paidIds.has(bill.id)) return;
    prepend({
      id: `bill-${bill.id}-${Date.now()}`,
      variant: "family",
      tag: "Task completed",
      title: `Dad paid ${bill.biller.split(" ")[0]}`,
      body: `${formatDollars(bill.amountCents)} · from Checking · confirmation emailed.`,
      time: "Now",
    });
    pushToast({
      tone: "ok",
      title: "Bill paid",
      body: `${bill.biller} · ${formatDollars(bill.amountCents)}.`,
    });
    setPaidIds((s) => new Set(s).add(bill.id));
  }

  return (
    <>
      <AppHeader parent subtitle="Money" title="Your accounts" />

      <div className="mx-4 mt-1 mb-2 rounded-2xl bg-chip-blue px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
          <span aria-hidden className="mr-1.5">🧠</span>
          SafeLife AI · financial baseline
        </p>
        <p className="mt-1 text-[14px] leading-snug text-ink-2">
          I watch your accounts, flag anything unusual in plain language,
          and can pay bills or place orders when you say so.
        </p>
      </div>

      {/* ========== AI noticed ========== */}
      {flagged.length > 0 ? (
        <section
          aria-label="AI flagged activity"
          className="flex flex-col gap-3 px-4 pb-2 pt-2"
        >
          <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
            AI noticed
          </h2>
          {flagged.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-scam-ink/20 bg-scam-bg p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-[22px]"
                >
                  🚩
                </span>
                <div className="flex-1">
                  <CategoryTag variant="scam">Unusual charge</CategoryTag>
                  <p className="mt-1 text-[18px] font-extrabold leading-snug text-ink">
                    {formatDollars(t.amountCents)} at {t.merchant}
                  </p>
                  {t.flagNote ? (
                    <p className="mt-1 text-[14px] leading-snug text-scam-ink">
                      {t.flagNote}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="min-h-[44px] rounded-xl bg-ink px-4 py-2 text-[14px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Dispute
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {/* ========== Balances ========== */}
      <section
        aria-label="Account balances"
        className="flex flex-col gap-3 px-4 pb-2 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          Balances
        </h2>
        {ACCOUNTS.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-line bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-panel text-[22px]"
              >
                {a.icon}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-ink-2">
                  {a.name} · {a.institution}
                </p>
                <p className="mt-0.5 text-[22px] font-extrabold tracking-tight text-ink">
                  {formatDollars(a.balanceCents)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                  {a.okNote ? (
                    <span className="rounded-full bg-ok-bg px-2 py-0.5 font-bold text-ok-ink">
                      {a.okNote}
                    </span>
                  ) : null}
                  {a.dueLabel ? (
                    <span className="rounded-full bg-ride-bg px-2 py-0.5 font-bold text-ride-ink">
                      Due {a.dueLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ========== Recent activity ========== */}
      <section
        aria-label="Recent activity"
        className="flex flex-col gap-2 px-4 pb-2 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          Recent activity
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {TRANSACTIONS.map((t, i) => (
            <li
              key={t.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                i !== TRANSACTIONS.length - 1 && "border-b border-line"
              )}
            >
              <span
                aria-hidden
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-panel text-[18px]"
              >
                {t.categoryIcon}
              </span>
              <div className="flex flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ink">
                    {t.merchant}
                  </p>
                  <p className="text-[12px] text-muted">
                    {t.dateLabel}
                    {t.flag === "paid" ? " · paid via SafeLife" : ""}
                    {t.flag === "recurring" ? " · recurring" : ""}
                  </p>
                </div>
                <p
                  className={cn(
                    "flex-shrink-0 text-[15px] font-extrabold tabular-nums",
                    t.amountCents < 0 ? "text-ink" : "text-ok-ink",
                    t.flag === "unusual" && "text-scam-ink"
                  )}
                >
                  {t.amountCents > 0 ? "+" : ""}
                  {formatDollars(t.amountCents)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ========== Bills due ========== */}
      <section
        aria-label="Bills due"
        className="flex flex-col gap-3 px-4 pb-2 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          Bills due
        </h2>
        {BILLS.map((b) => {
          const isPaid = paidIds.has(b.id);
          return (
            <article
              key={b.id}
              className="rounded-2xl border border-line bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-panel text-[22px]"
                >
                  {b.icon}
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-ink">{b.biller}</p>
                  <p className="mt-0.5 text-[13px] text-ink-2">
                    {formatDollars(b.amountCents)} · due {b.dueLabel}
                    {b.autoPay ? " · AutoPay on" : ""}
                  </p>
                </div>
                {!b.autoPay ? (
                  <button
                    type="button"
                    onClick={() => pay(b)}
                    disabled={isPaid}
                    className={cn(
                      "min-h-[44px] flex-shrink-0 rounded-xl px-4 py-2 text-[14px] font-bold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isPaid
                        ? "bg-ok-bg text-ok-ink"
                        : "bg-ink text-white hover:-translate-y-[1px]"
                    )}
                  >
                    {isPaid ? "✓ Paid" : "Pay"}
                  </button>
                ) : (
                  <span className="self-center rounded-full bg-ok-bg px-3 py-1 text-[12px] font-bold text-ok-ink">
                    Auto
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* ========== Quick actions ========== */}
      <section
        aria-label="Quick actions"
        className="flex flex-col gap-3 px-4 pb-8 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          Quick actions
        </h2>
        <div className="grid gap-2">
          {[
            {
              emoji: "🍔",
              title: "Order my usual lunch",
              body: "Uber Eats · Luigi's Pizza · ~$27 · 25 min",
            },
            {
              emoji: "💊",
              title: "Refill Lisinopril",
              body: "CVS · $18.40 · ready in 2 hours",
            },
            {
              emoji: "🚗",
              title: "Ride to Dr. Chen",
              body: "Uber · ~$14 · pickup in 12 min",
            },
          ].map((a) => (
            <div
              key={a.title}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4"
            >
              <span
                aria-hidden
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-panel text-[22px]"
              >
                {a.emoji}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-[15px] font-bold text-ink">
                  {a.title}
                </span>
                <span className="text-[13px] leading-snug text-ink-2">
                  {a.body}
                </span>
              </div>
              <span className="rounded-full bg-chip-blue px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
                Ask SafeLife
              </span>
            </div>
          ))}
        </div>
        <p className="px-1 pt-1 text-[12px] leading-snug text-muted">
          Tap "I need help" on the home screen to have SafeLife run any of
          these for you.
        </p>
      </section>
    </>
  );
}
