"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { useOnboardingStore } from "@/lib/store/onboarding";

export default function OnboardingDonePage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const invitedBy = useOnboardingStore((s) => s.invitedBy);
  const complete = useOnboardingStore((s) => s.complete);

  useEffect(() => {
    complete();
  }, [complete]);

  const destination =
    persona === "parent" ? "/parent/home/" : "/family/home/";
  const label = persona === "parent" ? "your home screen" : "the family hub";

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <OnboardingStepper step={3} />

      <div className="flex flex-col gap-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
          All set
        </p>
        <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-tight text-ink">
          {invitedBy ? `Welcome, invited by ${invitedBy} 👋` : "You're all set 🎉"}
        </h1>
        <p className="text-[15px] leading-snug text-ink-2">
          Opening {label} now. You can come back to onboarding any time
          from Settings.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
          Quick tour
        </p>
        <ul className="mt-2 grid gap-2 text-[14px] leading-snug text-ink-2">
          <li>· The big CTA is always one tap away.</li>
          <li>· Alerts only fire when something actually needs you.</li>
          <li>· Everything stays in this browser — it's a demo.</li>
        </ul>
      </div>

      <div className="mt-auto grid gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push(destination)}
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-5 text-[17px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Open SafeLife
        </button>
      </div>
    </section>
  );
}
