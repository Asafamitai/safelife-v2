"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppHeader } from "@/components/app-frame";
import { CategoryTag } from "@/components/category-tag";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";
import { useFinanceAlertsStore } from "@/lib/store/finance-alerts";
import type { FinanceAlertRules } from "@/lib/store/finance-alerts";
import {
  ACCOUNTS,
  BILLS,
  TRANSACTIONS,
  formatDollars,
  type Account,
  type Bill,
  type Txn,
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
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [disputedIds, setDisputedIds] = useState<Set<string>>(new Set());
  // Demo-only override so the user can tap "Edit limit" during a pitch.
  const [limitOverrides, setLimitOverrides] = useState<
    Record<string, number | undefined>
  >({});
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [reviewTxn, setReviewTxn] = useState<Txn | null>(null);

  const accounts = useMemo(
    () =>
      ACCOUNTS.map((a) => ({
        ...a,
        limitCents: limitOverrides[a.id] ?? a.limitCents,
      })),
    [limitOverrides]
  );

  const flagged = TRANSACTIONS.filter((t) => t.flag === "unusual");

  const hydrateAlerts = useFinanceAlertsStore((s) => s.hydrate);
  const alertRules = useFinanceAlertsStore((s) => s.rules);
  const setAlertRule = useFinanceAlertsStore((s) => s.set);
  useEffect(() => {
    hydrateAlerts();
  }, [hydrateAlerts]);

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
    setPendingBillId(null);
  }

  function approveCharge(txnId: string, merchant: string, amountCents: number) {
    if (approvedIds.has(txnId) || disputedIds.has(txnId)) return;
    prepend({
      id: `charge-approve-${txnId}-${Date.now()}`,
      variant: "ok",
      tag: "Financial monitoring",
      title: "Dad approved a flagged charge",
      body: `${formatDollars(amountCents)} at ${merchant} — cleared with SafeLife AI.`,
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
      title: "Dad disputed a charge",
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
                    {resolved ? (
                      <div className="mt-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold",
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
                          onClick={() => setReviewTxn(t)}
                          className="min-h-[44px] rounded-xl border border-ink bg-white px-4 py-2 text-[14px] font-bold text-ink hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            approveCharge(t.id, t.merchant, t.amountCents)
                          }
                          className="min-h-[44px] rounded-xl bg-ink px-4 py-2 text-[14px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            disputeCharge(t.id, t.merchant, t.amountCents)
                          }
                          className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

      {/* ========== Balances ========== */}
      <section
        aria-label="Account balances"
        className="flex flex-col gap-3 px-4 pb-2 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          Balances
        </h2>
        {accounts.map((a) => (
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
                {a.kind === "credit" &&
                typeof a.limitCents === "number" ? (
                  <CreditUtilization
                    account={a as Account & { limitCents: number }}
                    editing={editingLimitId === a.id}
                    onEdit={() => setEditingLimitId(a.id)}
                    onCancel={() => setEditingLimitId(null)}
                    onSave={(next) => {
                      setLimitOverrides((prev) => ({
                        ...prev,
                        [a.id]: next,
                      }));
                      setEditingLimitId(null);
                      pushToast({
                        tone: "ok",
                        title: "Limit updated",
                        body: `${a.institution} · ${formatDollars(next)}.`,
                      });
                    }}
                  />
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ========== Alert rules ========== */}
      <section
        aria-label="Alert rules"
        className="flex flex-col gap-2 px-4 pb-2 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          Alert me when…
        </h2>
        <div className="grid gap-2">
          <AlertRule
            rule="anyTransaction"
            label="Any transaction"
            body="Ping me for every single card swipe. Loud — off by default."
            on={alertRules.anyTransaction}
            onChange={(on) => setAlertRule("anyTransaction", on)}
          />
          <AlertRule
            rule="over100"
            label="Over $100"
            body="Flag charges above $100 so I can approve big ones."
            on={alertRules.over100}
            onChange={(on) => setAlertRule("over100", on)}
          />
          <AlertRule
            rule="over500"
            label="Over $500"
            body="Big-ticket threshold — always on unless you turn it off."
            on={alertRules.over500}
            onChange={(on) => setAlertRule("over500", on)}
          />
          <AlertRule
            rule="aiPattern"
            label="Unusual pattern (AI)"
            body="SafeLife AI flags anything outside Dad's normal spend."
            on={alertRules.aiPattern}
            onChange={(on) => setAlertRule("aiPattern", on)}
            highlight
          />
        </div>
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
          const isPending = pendingBillId === b.id;
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
                    onClick={() =>
                      isPending ? pay(b) : setPendingBillId(b.id)
                    }
                    disabled={isPaid}
                    className={cn(
                      "min-h-[44px] flex-shrink-0 rounded-xl px-4 py-2 text-[14px] font-bold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isPaid
                        ? "bg-ok-bg text-ok-ink"
                        : "bg-ink text-white hover:-translate-y-[1px]"
                    )}
                  >
                    {isPaid ? "✓ Paid" : isPending ? "Confirm" : "Pay"}
                  </button>
                ) : (
                  <span className="self-center rounded-full bg-ok-bg px-3 py-1 text-[12px] font-bold text-ok-ink">
                    Auto
                  </span>
                )}
              </div>

              {isPending && !isPaid ? (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-chip-blue px-3 py-2.5">
                  <p className="text-[13px] leading-snug text-ink-2">
                    Pay{" "}
                    <span className="font-bold text-ink">
                      {formatDollars(b.amountCents)}
                    </span>{" "}
                    from Checking?
                  </p>
                  <button
                    type="button"
                    onClick={() => setPendingBillId(null)}
                    className="min-h-[36px] rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {/* ========== More protections (Phase 2 stubs) ========== */}
      <section
        aria-label="More protections"
        className="flex flex-col gap-2 px-4 pb-2 pt-4"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          More protections
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { emoji: "♻️", title: "Recurring payments" },
            { emoji: "🎯", title: "Savings goals" },
            { emoji: "🧊", title: "Freeze a card" },
          ].map((s) => (
            <div
              key={s.title}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-3 py-3"
            >
              <span
                aria-hidden
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-panel text-[18px]"
              >
                {s.emoji}
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-[13px] font-bold text-ink">
                  {s.title}
                </span>
                <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted w-fit mt-0.5">
                  Coming soon
                </span>
              </div>
            </div>
          ))}
        </div>
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

      {/* ========== Transaction detail (review sheet) ========== */}
      <Sheet
        open={!!reviewTxn}
        onOpenChange={(o) => !o && setReviewTxn(null)}
      >
        <SheetContent>
          {reviewTxn ? (
            <TransactionDetail txn={reviewTxn} />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CreditUtilization({
  account,
  editing,
  onEdit,
  onCancel,
  onSave,
}: {
  account: Account & { limitCents: number };
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (next: number) => void;
}) {
  const [input, setInput] = useState(
    (account.limitCents / 100).toString()
  );
  const pct = Math.min(
    100,
    Math.round((account.balanceCents / account.limitCents) * 100)
  );
  const tone =
    pct > 70 ? "bg-scam-ink" : pct > 30 ? "bg-ride-ink" : "bg-ok-ink";

  if (editing) {
    return (
      <div className="mt-3 rounded-xl border border-accent/40 bg-white p-3">
        <label
          htmlFor={`limit-${account.id}`}
          className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
        >
          Credit limit
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[14px] font-bold text-ink">$</span>
          <input
            id={`limit-${account.id}`}
            type="number"
            min={0}
            step={100}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            className="min-h-[36px] flex-1 rounded-lg border border-line bg-white px-3 text-[14px] font-semibold text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <button
            type="button"
            onClick={() => {
              const dollars = Number(input);
              if (!Number.isFinite(dollars) || dollars <= 0) return;
              onSave(Math.round(dollars * 100));
            }}
            className="min-h-[36px] rounded-lg bg-ink px-3 text-[12px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[36px] rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[12px] text-muted">
        <span>
          <span className="font-bold text-ink-2">{pct}%</span> of{" "}
          {formatDollars(account.limitCents)}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md px-2 py-1 text-[11px] font-bold text-accent hover:bg-chip-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Edit limit
        </button>
      </div>
      <div
        aria-hidden
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-panel"
      >
        <div
          className={cn("h-full", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AlertRule({
  rule,
  label,
  body,
  on,
  onChange,
  highlight,
}: {
  rule: keyof FinanceAlertRules;
  label: string;
  body: string;
  on: boolean;
  onChange: (on: boolean) => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      data-rule={rule}
      className={cn(
        "flex min-h-[72px] items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        highlight ? "border-accent/40 bg-chip-blue" : "border-line"
      )}
    >
      <span className="flex flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-ink">{label}</span>
          {highlight ? (
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
              🧠 SafeLife AI
            </span>
          ) : null}
        </span>
        <span className="text-[13px] leading-snug text-ink-2">{body}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors",
          on ? "bg-ink" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
            on ? "translate-x-6" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}

function TransactionDetail({ txn }: { txn: Txn }) {
  const account = ACCOUNTS.find((a) => a.id === txn.accountId);
  return (
    <>
      <SheetHeader>
        <SheetTitle>Transaction detail</SheetTitle>
        <SheetDescription>
          SafeLife AI flagged this as unusual — here&apos;s the full record.
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
            <p className="mt-1 text-[20px] font-extrabold leading-snug text-ink">
              {formatDollars(txn.amountCents)} at {txn.merchant}
            </p>
            {txn.flagNote ? (
              <p className="mt-1 text-[14px] leading-snug text-scam-ink">
                {txn.flagNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 text-[13px]">
        <Field label="Merchant" value={txn.merchant} />
        <Field label="Amount" value={formatDollars(txn.amountCents)} />
        <Field
          label="Card"
          value={account ? account.institution : "—"}
        />
        <Field label="Date" value={txn.dateLabel} />
        <div className="col-span-2">
          <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Category
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">Online shopping</dd>
        </div>
      </dl>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
