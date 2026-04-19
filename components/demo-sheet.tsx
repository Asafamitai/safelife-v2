"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTourStore } from "@/lib/tour";
import { cn } from "@/lib/utils";

interface DemoFlow {
  href: string;
  emoji: string;
  title: string;
  blurb: string;
  audience: "Family" | "Parent";
  recommended?: boolean;
}

const FLOWS: DemoFlow[] = [
  {
    href: "/family/home",
    emoji: "🏠",
    title: "Family home",
    blurb: "The calm feed. Right alerts at the right time.",
    audience: "Family",
    recommended: true,
  },
  {
    href: "/family/connections",
    emoji: "🔌",
    title: "Connect data",
    blurb: "Pharmacies, health, fraud alerts — opt-in per service.",
    audience: "Family",
  },
  {
    href: "/family/timeline",
    emoji: "🗓️",
    title: "Timeline",
    blurb: "This week in one quiet list.",
    audience: "Family",
  },
  {
    href: "/parent/home",
    emoji: "👋",
    title: "Parent home",
    blurb: "Large type, one help button, today’s meds. Built for 65+.",
    audience: "Parent",
    recommended: true,
  },
  {
    href: "/parent/scam",
    emoji: "🛡️",
    title: "Scam check",
    blurb: "Paste any text. We rate it safe, suspicious, or scam.",
    audience: "Parent",
  },
  {
    href: "/parent/help",
    emoji: "🤝",
    title: "Help history",
    blurb: "What was asked for and where it was routed.",
    audience: "Parent",
  },
];

type PersonaFilter = "all" | "Family" | "Parent";

export function DemoSheet({ trigger }: { trigger: React.ReactNode }) {
  const [persona, setPersona] = useState<PersonaFilter>("all");
  const router = useRouter();
  const startTour = useTourStore((s) => s.start);

  const visible =
    persona === "all" ? FLOWS : FLOWS.filter((f) => f.audience === persona);

  function runGuidedTour() {
    startTour("scam-to-feed");
    router.push("/parent/scam");
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="md:max-h-[88vh]">
        <SheetHeader>
          <SheetTitle>Try the demo</SheetTitle>
          <SheetDescription>
            All data is mocked locally. Actions ripple across apps in real time.
          </SheetDescription>
        </SheetHeader>

        {/* Guided tour hero */}
        <div className="mt-5 rounded-2xl border border-ink bg-ink p-5 text-white">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/10 text-[22px]"
            >
              🧭
            </span>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]">
                30-second tour
              </span>
              <h3 className="mt-2 text-[18px] font-extrabold tracking-tight">
                See the end-to-end flow
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-white/80">
                Parent blocks a scam → it lands in the family feed, instantly.
                Two taps, no setup.
              </p>
            </div>
          </div>
          <SheetClose asChild>
            <button
              type="button"
              onClick={runGuidedTour}
              className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-ink transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Start guided tour <span aria-hidden>→</span>
            </button>
          </SheetClose>
        </div>

        {/* Persona filter */}
        <div
          role="tablist"
          aria-label="Filter by persona"
          className="mt-6 flex gap-2"
        >
          {(
            [
              { id: "all" as const, label: "All screens" },
              { id: "Family" as const, label: "For families" },
              { id: "Parent" as const, label: "For parents" },
            ]
          ).map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={persona === p.id}
              onClick={() => setPersona(p.id)}
              className={cn(
                "min-h-[36px] flex-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                persona === p.id
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-ink-2"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {visible.map((f) => (
            <li key={f.href}>
              <SheetClose asChild>
                <Link
                  href={f.href}
                  className={cn(
                    "flex h-full min-h-[96px] items-start gap-3 rounded-2xl border bg-white p-4 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    f.recommended ? "border-accent" : "border-line"
                  )}
                >
                  <span
                    aria-hidden
                    className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-panel text-[22px]"
                  >
                    {f.emoji}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[15px] font-bold text-ink">
                        {f.title}
                      </span>
                      <span
                        className={
                          f.audience === "Parent"
                            ? "rounded-full bg-ride-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ride-ink"
                            : "rounded-full bg-family-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-family-ink"
                        }
                      >
                        {f.audience}
                      </span>
                      {f.recommended ? (
                        <span className="rounded-full bg-chip-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
                          Start here
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 text-[13px] leading-snug text-ink-2">
                      {f.blurb}
                    </span>
                  </span>
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
