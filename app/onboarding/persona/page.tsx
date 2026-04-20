"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { cn } from "@/lib/utils";

type Choice = "family" | "parent";

const OPTIONS: {
  id: Choice;
  title: string;
  body: string;
  emoji: string;
}[] = [
  {
    id: "family",
    emoji: "💙",
    title: "I'm the family member",
    body: "Checking in on a parent or loved one — get calm alerts, see daily activity.",
  },
  {
    id: "parent",
    emoji: "🙋",
    title: "I'm the loved one",
    body: "Big buttons, scam checks, meds reminders, and help in one tap.",
  },
];

export default function OnboardingPersonaPage() {
  const router = useRouter();
  const setPersona = useOnboardingStore((s) => s.setPersona);
  const [choice, setChoice] = useState<Choice | null>(null);

  function next() {
    if (!choice) return;
    setPersona(choice);
    router.push("/onboarding/connect/");
  }

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <OnboardingStepper step={1} />

      <div className="flex flex-col gap-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
          Who is this phone for?
        </p>
        <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-tight text-ink">
          Which side are you setting up?
        </h1>
        <p className="text-[14px] leading-snug text-ink-2">
          You can switch between sides later for the demo. In real life,
          each person uses the side that fits them.
        </p>
      </div>

      <ul className="grid gap-3">
        {OPTIONS.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => setChoice(o.id)}
              aria-pressed={choice === o.id}
              className={cn(
                "flex w-full min-h-[92px] items-start gap-4 rounded-2xl border bg-white p-5 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                choice === o.id
                  ? "border-ink shadow-sm"
                  : "border-line"
              )}
            >
              <span
                aria-hidden
                className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-panel text-[24px]"
              >
                {o.emoji}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-ink">{o.title}</span>
                <span className="text-[13px] leading-snug text-ink-2">{o.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto grid gap-3 pt-4">
        <button
          type="button"
          onClick={next}
          disabled={!choice}
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-5 text-[17px] font-bold text-white disabled:opacity-40 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Continue
        </button>
      </div>
    </section>
  );
}
