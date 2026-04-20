"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMedsStore, type MedTone } from "@/lib/store/meds";
import { useToastsStore } from "@/lib/store/toasts";
import { cn } from "@/lib/utils";

/**
 * Add-medication sheet used by the family-side Medications tab.
 *
 * Inputs map 1:1 to the Med store shape. An icon is picked from a small
 * palette; its position also drives the tone (color) of the day pills
 * so icon + color stay coherent without asking the user to pick twice.
 */

const ICONS: { icon: string; tone: MedTone }[] = [
  { icon: "💊", tone: "blue" },
  { icon: "☀️", tone: "amber" },
  { icon: "💉", tone: "red" },
  { icon: "🩺", tone: "green" },
  { icon: "❤️", tone: "red" },
  { icon: "🧴", tone: "purple" },
  { icon: "🌿", tone: "green" },
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMedSheet({ open, onOpenChange }: Props) {
  const add = useMedsStore((s) => s.add);
  const pushToast = useToastsStore((s) => s.push);

  const [iconIndex, setIconIndex] = useState(0);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);
  const [remindersOn, setRemindersOn] = useState(true);

  // Reset when reopened.
  useEffect(() => {
    if (open) {
      setIconIndex(0);
      setName("");
      setDose("");
      setTime("08:00");
      setDays([true, true, true, true, true, true, true]);
      setRemindersOn(true);
    }
  }, [open]);

  const canSave = name.trim().length > 0 && dose.trim().length > 0;

  function toggleDay(i: number) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? !d : d)));
  }

  function handleSave() {
    const { icon, tone } = ICONS[iconIndex];
    const hour12 = formatTo12h(time);
    add({
      name: name.trim(),
      dose: dose.trim(),
      icon,
      tone,
      schedule: "Daily",
      takeAt: hour12,
      times: [time],
      days,
      remindersOn,
    });
    pushToast({
      tone: "ok",
      title: "Medication added",
      body: `${name.trim()} · ${dose.trim()} at ${time}.`,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add medication</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {/* Icon picker */}
          <div className="grid grid-cols-7 gap-2">
            {ICONS.map((c, i) => {
              const active = i === iconIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIconIndex(i)}
                  aria-pressed={active}
                  aria-label={`Choose icon ${c.icon}`}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl border text-[20px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "border-ink bg-panel"
                      : "border-line bg-white hover:bg-panel"
                  )}
                >
                  {c.icon}
                </button>
              );
            })}
          </div>

          {/* Name + dose */}
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Medication name"
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              autoFocus
            />
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Dose (e.g. 10 mg)"
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Time */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Time
            </div>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Time"
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[16px] text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Days */}
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Days
            </div>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((d, i) => {
                const on = days[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    aria-pressed={on}
                    aria-label={`Toggle ${d}`}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full text-[13px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      on
                        ? "bg-ink text-white"
                        : "border border-line bg-white text-ink-2 hover:bg-panel"
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminder toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={remindersOn}
            onClick={() => setRemindersOn((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="text-[15px] font-semibold text-ink">
              Send push reminder to loved one
            </span>
            <span
              aria-hidden
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                remindersOn ? "bg-ink" : "bg-line"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                  remindersOn ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-4 py-3 text-[16px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
          >
            Save medication
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatTo12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}
