"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { CategoryTag } from "@/components/category-tag";
import { useEventsStore } from "@/lib/store/events";
import { useMedsStore } from "@/lib/store/meds";
import { useToastsStore } from "@/lib/store/toasts";
import {
  ACCOUNTS,
  BILLS,
  TRANSACTIONS,
  formatDollars,
} from "@/lib/mock-finance";
import { cn } from "@/lib/utils";

/**
 * Family-side mirror of the parent Money page. Read-only with two
 * exceptions: a family member (e.g. Maya) can Approve or Dispute a
 * flagged charge on Dad's behalf — same handlers, same feed events as
 * the parent page writes.
 *
 * Layered top to bottom:
 *   1. "Dad's week" summary — counts of flagged, paid, meds.
 *   2. AI noticed — the same unusual-charge card with Approve/Dispute.
 *   3. Dad's accounts — balances snapshot.
 *   4. Recent activity — same TRANSACTIONS feed, compact.
 *   5. Bills this month — status only; paying happens on Dad's phone.
 */
export default function FamilyMoneyPage() {
  const meds = useMedsStore((s) => s.meds);
  const events = useEventsStore((s) => s.events);
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);

  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [disputedIds, setDisputedIds] = useState<Set<string>>(new Set());

  const flagged = TRANSACTIONS.filter((t) => t.flag === "unusual");
  const paidThisWeek = TRANSACTIONS.filter((t) => t.flag === "paid").length;
  const medsTaken = meds.filter((m) => m.takenAt).length;
  const billsPaidByDad = events.filter((e) =>
    e.id.startsWith("bill-")
  ).length;

  function approveCharge(txnId: string, merchant: string, amountCents: number) {
    if (approvedIds.has(txnId) || disputedIds.has(txnId)) return;
    prepend({
      id: `charge-approve-${txnId}-${Date.now()}`,
      variant: "ok",
      tag: "Financial monitoring",
      title: "Maya approved a flagged charge",
      body: `${formatDollars(amountCents)} at ${merchant} — cleared on Dad's behalf.`,
      time: "Now",
    });
    pushToast({
      tone: "ok",
      title: "Charge approved",
      body: `${merchant} · ${formatDollars(amountCents)}.`,
    });
    setApprovedIds((s) => new Set(s).add(txnId));
  }

  function disputeCharge(txnId: string, merchant: string, amountCents: number) {
    if (approvedIds.has(txnId) || disputedIds.has(txnId)) return;
    prepend({
      id: `charge-dispute-${txnId}-${Date.now()}`,
      variant: "scam",
      tag: "Financial monitoring",
      title: "Maya disputed a charge for Dad",
      body: `${formatDollars(amountCents)} at ${merchant} — under review. Chase notified.`,
      time: "Now",
    });
    pushToast({
      tone: "warn",
      title: "Dispute filed",
      body: `${merchant} · we'll follow up when Chase responds.`,
    });
    setDisputedIds((s) => new Set(s).add(txnId));
  }

  return (
    <>
      <AppHeader subtitle="Family hub" title="Dad’s money" />

      {/* ========== Week summary ========== */}
      <section
        aria-label="This week"
        className="flex gap-2 px-4 pb-2 pt-2"
      >
        <WeekCell label="Flagged" value={`${flagged.length}`} tone="scam" />
        <WeekCell
          label="Bills paid"
          value={`${billsPaidByDad + paidThisWeek}`}
          tone="ok"
        />
        <WeekCell
          label="Meds taken"
          value={`${medsTaken}/${meds.length}`}
          tone="ok"
        />
      </section>

      {/* ========== AI noticed ========== */}
      {flagged.length > 0 ? (
        <section
          aria-label="AI flagged activity"
          className="flex flex-col gap-3 px-4 pb-2 pt-2"
        >
          <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            AI noticed
          </h2>
          {flagged.map((t) => {
            const resolved = approvedIds.has(t.id) || disputedIds.has(t.id);
            const approved = approvedIds.has(t.id);
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-scam-ink/20 bg-scam-bg p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white text-[20px]"
                  >
                    🚩
                  </span>
                  <div className="flex-1">
                    <CategoryTag variant="scam">Unusual charge</CategoryTag>
                    <p className="mt-1 text-[16px] font-extrabold leading-snug text-ink">
                      {formatDollars(t.amountCents)} at {t.merchant}
                    </p>
                    {t.flagNote ? (
                      <p className="mt-1 text-[13px] leading-snug text-scam-ink">
                        {t.flagNote}
                      </p>
                    ) : null}
                    {resolved ? (
                      <div className="mt-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold",
                            approved
                              ? "bg-ok-bg text-ok-ink"
                              : "bg-ride-bg text-ride-ink"
                          )}
                        >
                          {approved ? "✓ Approved" : "⚠ Dispute filed"}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            approveCharge(t.id, t.merchant, t.amountCents)
                          }
                          className="min-h-[40px] rounded-xl bg-ink px-3.5 py-2 text-[13px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Approve for Dad
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            disputeCharge(t.id, t.merchant, t.amountCents)
                          }
                          className="min-h-[40px] rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Dispute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      {/* ========== Dad's accounts ========== */}
      <section
        aria-label="Dad's accounts"
        className="flex flex-col gap-2 px-4 pb-2 pt-3"
      >
        <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Dad’s accounts
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {ACCOUNTS.map((a, i) => (
            <li
              key={a.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                i !== ACCOUNTS.length - 1 && "border-b border-line"
              )}
            >
              <span
                aria-hidden
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-panel text-[18px]"
              >
                {a.icon}
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-2">
                    {a.name} · {a.institution}
                  </p>
                  {a.dueLabel ? (
                    <p className="text-[11px] font-bold text-ride-ink">
                      Due {a.dueLabel}
                    </p>
                  ) : null}
                </div>
                <p className="flex-shrink-0 text-[15px] font-extrabold tabular-nums text-ink">
                  {formatDollars(a.balanceCents)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ========== Recent activity ========== */}
      <section
        aria-label="Recent activity"
        className="flex flex-col gap-2 px-4 pb-2 pt-3"
      >
        <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Recent activity
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {TRANSACTIONS.slice(0, 6).map((t, i) => (
            <li
              key={t.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5",
                i !== 5 && "border-b border-line"
              )}
            >
              <span
                aria-hidden
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-panel text-[14px]"
              >
                {t.categoryIcon}
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-ink">
                    {t.merchant}
                  </p>
                  <p className="text-[11px] text-muted">
                    {t.dateLabel}
                    {t.flag === "paid" ? " · paid via SafeLife" : ""}
                    {t.flag === "recurring" ? " · recurring" : ""}
                  </p>
                </div>
                <p
                  className={cn(
                    "flex-shrink-0 text-[13px] font-extrabold tabular-nums",
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

      {/* ========== Bills ========== */}
      <section
        aria-label="Bills this month"
        className="flex flex-col gap-2 px-4 pb-6 pt-3"
      >
        <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Bills this month
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {BILLS.map((b, i) => (
            <li
              key={b.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                i !== BILLS.length - 1 && "border-b border-line"
              )}
            >
              <span
                aria-hidden
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-panel text-[18px]"
              >
                {b.icon}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-ink">{b.biller}</p>
                <p className="text-[11px] text-ink-2">
                  {formatDollars(b.amountCents)} · due {b.dueLabel}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                  b.autoPay
                    ? "bg-ok-bg text-ok-ink"
                    : "bg-ride-bg text-ride-ink"
                )}
              >
                {b.autoPay ? "Auto" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
        <p className="px-1 pt-1 text-[11px] leading-snug text-muted">
          Dad pays manual bills from his Home screen. You’ll see them here
          the moment they’re paid.
        </p>
      </section>
    </>
  );
}

function WeekCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "scam" | "ok";
}) {
  return (
    <div
      className={cn(
        "flex-1 rounded-2xl border p-3",
        tone === "scam" ? "border-scam-ink/20 bg-scam-bg" : "border-line bg-white"
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[22px] font-extrabold tracking-tight",
          tone === "scam" ? "text-scam-ink" : "text-ink"
        )}
      >
        {value}
      </p>
    </div>
  );
}
