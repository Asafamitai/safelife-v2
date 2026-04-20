"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-frame";
import { HelpSheet } from "@/components/help-sheet";
import { MedCard } from "@/components/med-card";
import { ParentAskSheet } from "@/components/parent-ask-sheet";
import { useMedsStore } from "@/lib/store/meds";

export default function ParentHomePage() {
  const meds = useMedsStore((s) => s.meds);
  const allTaken = meds.every((m) => m.takenAt);

  return (
    <>
      <AppHeader
        parent
        subtitle="Good morning, Dad"
        title={allTaken ? "You’re all set today" : "Today"}
      />

      <p className="px-5 pb-2 text-[18px] leading-snug text-ink-2">
        {allTaken
          ? "Nothing pending. Tap below if you need anything."
          : "A couple of things to do. Take your time."}
      </p>

      <section
        aria-label="I need help"
        className="flex flex-col gap-3 px-4 pb-2 pt-3"
      >
        <HelpSheet />
        <ParentAskSheet />
      </section>

      <section
        aria-label="Today’s medications"
        className="flex flex-col gap-3 px-4 pb-3 pt-4"
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
            Today’s meds
          </h2>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-ok-bg px-2.5 py-1 text-[12px] font-bold text-ok-ink"
            aria-label="7 day streak"
          >
            <span aria-hidden>🔥</span> 7 day streak
          </span>
        </div>
        {meds.map((m) => (
          <MedCard key={m.id} med={m} />
        ))}
      </section>

      <section
        aria-label="Protection entry"
        className="px-4 pb-6 pt-3"
      >
        <Link
          href="/parent/scam"
          className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-line bg-scam-bg p-5 text-scam-ink transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span aria-hidden className="text-[28px]">🛡️</span>
          <span className="flex flex-col">
            <span className="text-[20px] font-extrabold">
              Check a message
            </span>
            <span className="text-[16px] leading-snug">
              Paste a text, email, or link. We’ll tell you if it’s safe.
            </span>
          </span>
        </Link>
      </section>
    </>
  );
}
