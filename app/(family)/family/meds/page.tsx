"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { AddMedSheet } from "@/components/add-med-sheet";
import { MED_LOG } from "@/lib/meds-log";
import { useMedsStore, type Med, type MedTone } from "@/lib/store/meds";
import { cn } from "@/lib/utils";

/**
 * Family-side Medications tab. Caregiver surface for:
 *   - Setting up daily schedules (name, dose, time, days)
 *   - Toggling push reminders to the loved one per med
 *   - Confirming a dose was taken on the loved one's behalf
 *   - Reviewing a status log of recent taken / missed doses
 *
 * Data model lives in lib/store/meds.ts; the parent app reads the same
 * store via the existing "Today's meds" card, so confirming from either
 * side stays in sync.
 */

type Tab = "schedule" | "log";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const TONE_BG: Record<MedTone, string> = {
  blue: "bg-accent",
  amber: "bg-ride-ink",
  purple: "bg-family-ink",
  red: "bg-scam-ink",
  green: "bg-ok-ink",
};

const TONE_TINT: Record<MedTone, string> = {
  blue: "bg-chip-blue",
  amber: "bg-ride-bg",
  purple: "bg-family-bg",
  red: "bg-scam-bg",
  green: "bg-ok-bg",
};

export default function FamilyMedsPage() {
  const meds = useMedsStore((s) => s.meds);
  const confirm = useMedsStore((s) => s.confirm);
  const toggleReminders = useMedsStore((s) => s.toggleReminders);
  const remove = useMedsStore((s) => s.remove);

  const [tab, setTab] = useState<Tab>("schedule");
  const [addOpen, setAddOpen] = useState(false);

  const taken = meds.filter((m) => m.takenAt).length;
  const total = meds.length;
  const pending = total - taken;
  const pct = total === 0 ? 0 : Math.round((taken / total) * 100);

  const adherenceTone = useMemo(() => {
    if (total === 0) return { chip: "bg-panel text-muted", label: "—" };
    if (pending === 0) return { chip: "bg-ok-bg text-ok-ink", label: `${taken}/${total} taken` };
    return { chip: "bg-ride-bg text-ride-ink", label: `${taken}/${total} taken` };
  }, [taken, total, pending]);

  function handleMarkTaken(med: Med) {
    const stamp = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    confirm(med.id, stamp);
  }

  return (
    <>
      <AppHeader
        subtitle="Daily schedule"
        title="Medications"
        right={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span aria-hidden>+</span> Add
          </button>
        }
      />

      {/* Adherence summary */}
      <section
        aria-label="Today's adherence"
        className="px-4 pt-1"
      >
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-extrabold tracking-tight text-ink">
              Today’s adherence
            </h2>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[12px] font-bold",
                adherenceTone.chip
              )}
            >
              {adherenceTone.label}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-[13px] leading-snug text-ink-2">
            {pending === 0
              ? "All set for today."
              : `${pending} medication${pending === 1 ? "" : "s"} still pending`}
          </p>
        </div>
      </section>

      {/* Tab toggle */}
      <section className="px-4 pt-4" aria-label="View toggle">
        <div
          role="tablist"
          className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 text-[14px] font-bold shadow-sm"
        >
          {([
            { id: "schedule", label: "💊 Schedule" },
            { id: "log", label: "📋 Log" },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-3 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active ? "bg-ink text-white" : "text-ink-2 hover:text-ink"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "schedule" ? (
        <section
          aria-label="Scheduled medications"
          className="flex flex-col gap-3 px-4 pb-6 pt-4"
        >
          <div className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            {total} medication{total === 1 ? "" : "s"} scheduled
          </div>

          {meds.map((m) => (
            <MedScheduleCard
              key={m.id}
              med={m}
              onToggleReminders={() => toggleReminders(m.id)}
              onMarkTaken={() => handleMarkTaken(m)}
              onRemove={() => remove(m.id)}
            />
          ))}

          {total === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-center">
              <div className="text-[15px] font-semibold text-ink">
                No medications yet
              </div>
              <p className="mt-1 text-[13px] text-muted">
                Add one to start tracking daily adherence.
              </p>
            </div>
          ) : null}
        </section>
      ) : (
        <section
          aria-label="Medication log"
          className="flex flex-col gap-4 px-4 pb-6 pt-4"
        >
          <LogGroup day="today" label="Today" />
          <LogGroup day="yesterday" label="Yesterday" />
        </section>
      )}

      <AddMedSheet open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}

function MedScheduleCard({
  med,
  onToggleReminders,
  onMarkTaken,
  onRemove,
}: {
  med: Med;
  onToggleReminders: () => void;
  onMarkTaken: () => void;
  onRemove: () => void;
}) {
  const tone = med.tone;
  const dayPill = TONE_BG[tone];
  const iconTint = TONE_TINT[tone];
  const taken = !!med.takenAt;

  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[22px]",
            iconTint
          )}
        >
          {med.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-extrabold tracking-tight text-ink">
            {med.name}
          </div>
          <div className="text-[13px] text-muted">
            {med.dose} · {med.times.join(", ")}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${med.name}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden>✕</span>
        </button>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Scheduled days">
        {DAY_LABELS.map((d, i) => {
          const on = med.days[i];
          return (
            <li
              key={i}
              aria-label={`${d}: ${on ? "scheduled" : "off"}`}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold",
                on ? `${dayPill} text-white` : "bg-line text-muted"
              )}
            >
              {d}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleReminders}
          role="switch"
          aria-checked={med.remindersOn}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span
            aria-hidden
            className={cn(
              "relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors",
              med.remindersOn ? "bg-ink" : "bg-line"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                med.remindersOn ? "translate-x-[22px]" : "translate-x-0.5"
              )}
            />
          </span>
          <span
            className={cn(
              "text-[12px] font-semibold",
              med.remindersOn ? "text-ink-2" : "text-muted"
            )}
          >
            <span aria-hidden className="mr-1">
              {med.remindersOn ? "🔔" : "🔕"}
            </span>
            {med.remindersOn ? "Reminders on" : "Reminders off"}
          </span>
        </button>

        {taken ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-ok-bg px-3 py-1.5 text-[12px] font-bold text-ok-ink">
            <span aria-hidden>✓</span> Taken today
          </span>
        ) : (
          <button
            type="button"
            onClick={onMarkTaken}
            className="min-h-[36px] rounded-full bg-ink px-3.5 py-2 text-[12px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Mark taken
          </button>
        )}
      </div>
    </article>
  );
}

function LogGroup({ day, label }: { day: "today" | "yesterday"; label: string }) {
  const entries = MED_LOG.filter((e) => e.day === day);
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <ol className="relative ml-3 space-y-2.5 border-l border-line pl-5">
        {entries.map((e) => {
          const isTaken = e.status === "taken";
          return (
            <li key={e.id} className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-[27px] top-3.5 h-2.5 w-2.5 rounded-full ring-4 ring-off-white",
                  isTaken ? "bg-ok-ink" : "bg-scam-ink"
                )}
              />
              <article
                className={cn(
                  "rounded-2xl p-3",
                  isTaken ? "bg-ok-bg" : "bg-scam-bg"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={cn(
                      "text-[15px] font-extrabold tracking-tight",
                      isTaken ? "text-ok-ink" : "text-scam-ink"
                    )}
                  >
                    {e.medName} · {e.dose}
                  </div>
                  <div
                    className={cn(
                      "text-[12px] font-semibold",
                      isTaken ? "text-ok-ink" : "text-scam-ink"
                    )}
                  >
                    {e.loggedAt}
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1.5 text-[12px] font-semibold",
                    isTaken ? "text-ok-ink" : "text-scam-ink"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isTaken ? "bg-ok-ink" : "bg-scam-ink"
                    )}
                  />
                  {isTaken ? "Taken" : "Missed"}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
