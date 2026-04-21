"use client";

import Link from "next/link";
import { OnboardingStepper } from "@/components/onboarding-stepper";

export default function OnboardingWelcomePage() {
  return (
    <section className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <OnboardingStepper step={0} />

      <div className="flex flex-col gap-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
          Welcome to SafeLife
        </p>
        <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
          Make sure they’re safe — without checking on them all day.
        </h1>
        <p className="text-[15px] leading-snug text-ink-2">
          SafeLife has two sides — one for the family member keeping watch,
          one for the loved one living their day. We’ll set both up in
          about a minute.
        </p>
      </div>

      <ul className="grid gap-3 pt-2 text-[15px] leading-snug text-ink-2">
        <Perk emoji="🛡" label="Protection — suspicious texts and charges flagged in plain English." />
        <Perk emoji="💳" label="Bills, ride, pharmacy, food — SafeLife gets it done." />
        <Perk emoji="💊" label="Medication reminders — one tap to confirm." />
        <Perk emoji="🙋" label="Help in one tap — for anything else." />
      </ul>

      <div className="mt-auto grid gap-3 pt-4">
        <Link
          href="/onboarding/persona/"
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-5 text-[17px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Get started
        </Link>
        <Link
          href="/family/home/"
          className="text-center text-[13px] font-semibold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Just exploring — skip onboarding
        </Link>
      </div>
    </section>
  );
}

function Perk({ emoji, label }: { emoji: string; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-panel text-[20px]"
      >
        {emoji}
      </span>
      <span className="pt-1.5">{label}</span>
    </li>
  );
}
