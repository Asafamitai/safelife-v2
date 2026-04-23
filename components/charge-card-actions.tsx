"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryTag } from "@/components/category-tag";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";
import { TRANSACTIONS, formatDollars, ACCOUNTS } from "@/lib/mock-finance";
import type { MockEvent } from "@/lib/mock-events";

/**
 * Family-side actions for a `tag === "Financial monitoring"` card. Review
 * opens a transaction-detail sheet (merchant / amount / date / card / AI
 * note) instead of the scam-message modal. Approve/Dispute write to the
 * events feed — same shape as the parent-side Money page handlers.
 */
export function ChargeCardActions({ event }: { event: MockEvent }) {
  const [open, setOpen] = useState(false);
  const [resolved, setResolved] = useState<"approved" | "disputed" | null>(
    null
  );
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);

  // Try to correlate the feed event with the richer transaction in
  // mock-finance so the detail sheet can show merchant/amount/card.
  const txn = useMemo(
    () => TRANSACTIONS.find((t) => t.flag === "unusual") ?? null,
    []
  );
  const account = useMemo(
    () => ACCOUNTS.find((a) => a.id === txn?.accountId) ?? null,
    [txn]
  );

  function approve() {
    if (resolved) return;
    prepend({
      id: `charge-approve-feed-${event.id}-${Date.now()}`,
      variant: "ok",
      tag: "Financial monitoring",
      title: "Family approved the charge",
      body: txn
        ? `${formatDollars(txn.amountCents)} at ${txn.merchant} — cleared with SafeLife AI.`
        : "Flagged charge approved.",
      time: "Now",
    });
    pushToast({ tone: "ok", title: "Charge approved" });
    setResolved("approved");
    setOpen(false);
  }

  function dispute() {
    if (resolved) return;
    prepend({
      id: `charge-dispute-feed-${event.id}-${Date.now()}`,
      variant: "scam",
      tag: "Financial monitoring",
      title: "Family disputed the charge",
      body: txn
        ? `${formatDollars(txn.amountCents)} at ${txn.merchant} — under review. Card issuer notified.`
        : "Flagged charge disputed — issuer notified.",
      time: "Now",
    });
    pushToast({
      tone: "warn",
      title: "Dispute filed",
      body: "We'll follow up when the card issuer responds.",
    });
    setResolved("disputed");
    setOpen(false);
  }

  if (resolved) {
    return (
      <span
        className={
          resolved === "approved"
            ? "rounded-[10px] bg-ok-bg px-3 py-2 text-xs font-bold text-ok-ink"
            : "rounded-[10px] bg-ride-bg px-3 py-2 text-xs font-bold text-ride-ink"
        }
      >
        {resolved === "approved" ? "✓ Approved" : "⚠ Dispute filed"}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[10px] border border-ink bg-ink px-3 py-2 text-xs font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Review
      </button>
      <button
        type="button"
        onClick={approve}
        className="rounded-[10px] border border-[rgba(10,10,15,0.12)] bg-white/70 px-3 py-2 text-xs font-bold text-ink hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Approve
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Transaction detail</SheetTitle>
            <SheetDescription>
              SafeLife AI flagged this as unusual. Here&apos;s the full
              record.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 rounded-2xl border border-scam-ink/20 bg-scam-bg p-4">
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
                  {txn
                    ? `${formatDollars(txn.amountCents)} at ${txn.merchant}`
                    : event.title}
                </p>
                {txn?.flagNote ? (
                  <p className="mt-1 text-[13px] leading-snug text-scam-ink">
                    {txn.flagNote}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {txn ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 text-[13px]">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  Merchant
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {txn.merchant}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  Amount
                </dt>
                <dd className="mt-0.5 font-semibold text-ink tabular-nums">
                  {formatDollars(txn.amountCents)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  Card
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {account ? account.institution : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  Date
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {txn.dateLabel}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  Category
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  Online shopping
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={approve}
              className="min-h-[48px] rounded-xl bg-ink px-4 py-3 text-[14px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Approve this charge
            </button>
            <button
              type="button"
              onClick={dispute}
              className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Dispute — something's wrong
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
