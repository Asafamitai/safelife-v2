"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { InviteCard } from "@/components/invite-card";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useMembersStore } from "@/lib/store/members";
import {
  generateInviteCode,
  inviteUrl,
  parseInviteCode,
} from "@/lib/invites";

export default function OnboardingConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectInner />
    </Suspense>
  );
}

function ConnectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const onboardingPersona = useOnboardingStore((s) => s.persona);
  const setInvitedBy = useOnboardingStore((s) => s.setInvitedBy);
  const setPersona = useOnboardingStore((s) => s.setPersona);
  const members = useMembersStore((s) => s.members);

  const urlInvite = params.get("invite");
  const [codeInput, setCodeInput] = useState(urlInvite ?? "");
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Auto-apply invite from URL on first mount.
  useEffect(() => {
    if (!urlInvite) return;
    const parsed = parseInviteCode(urlInvite);
    if (!parsed) return;
    setInvitedBy(parsed.memberName);
    // The invite's `role` is the role of the SENDER — the recipient
    // should become the counterpart.
    const recipientRole = parsed.role === "parent" ? "family" : "parent";
    setPersona(recipientRole);
  }, [urlInvite, setInvitedBy, setPersona]);

  // Who is the user? Determine which member to generate an invite for
  // (so the other side can see "invited by ...").
  const self = useMemo(() => {
    if (onboardingPersona === "parent") {
      return members.find((m) => m.role === "Parent") ?? members[0];
    }
    return members.find((m) => m.role === "Primary caregiver") ?? members[0];
  }, [members, onboardingPersona]);

  const generatedCode = useMemo(() => {
    if (!self || !onboardingPersona) return null;
    return generateInviteCode({
      memberId: self.id,
      memberName: self.name,
      role: onboardingPersona,
    });
  }, [self, onboardingPersona]);

  const generatedUrl = generatedCode ? inviteUrl(generatedCode) : null;

  function acceptTyped() {
    const parsed = parseInviteCode(codeInput.trim());
    if (!parsed) {
      setAcceptError("That code doesn't look right. Double-check and try again.");
      return;
    }
    setInvitedBy(parsed.memberName);
    const recipientRole = parsed.role === "parent" ? "family" : "parent";
    setPersona(recipientRole);
    setAcceptError(null);
    router.push("/onboarding/done/");
  }

  function finish() {
    router.push("/onboarding/done/");
  }

  const counterpartLabel =
    onboardingPersona === "parent" ? "your family member" : "your loved one";

  return (
    <section className="flex flex-1 flex-col gap-6 px-6 pb-8 pt-6">
      <OnboardingStepper step={2} />

      <div className="flex flex-col gap-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
          Connect the other side
        </p>
        <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-tight text-ink">
          {urlInvite
            ? "You've been invited 👋"
            : `Invite ${counterpartLabel}`}
        </h1>
        <p className="text-[14px] leading-snug text-ink-2">
          {urlInvite
            ? "You're being added to a SafeLife family. Tap Continue to finish."
            : "SafeLife works best when both sides are set up. Share this link so the other person can open their side in another browser."}
        </p>
      </div>

      {urlInvite ? (
        <UrlInviteSummary code={urlInvite} />
      ) : generatedUrl && generatedCode ? (
        <InviteCard
          code={generatedCode}
          url={generatedUrl}
          counterpartLabel={counterpartLabel}
        />
      ) : null}

      {!urlInvite ? (
        <details className="rounded-2xl border border-line bg-white p-4">
          <summary className="cursor-pointer text-[13px] font-bold text-ink">
            Have a code already? Paste it here
          </summary>
          <div className="mt-3 grid gap-2">
            <label htmlFor="invite-code" className="sr-only">
              Invite code
            </label>
            <input
              id="invite-code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste invite code"
              className="min-h-[44px] w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-[12px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <button
              type="button"
              onClick={acceptTyped}
              disabled={!codeInput.trim()}
              className="min-h-[44px] rounded-xl bg-ink px-4 py-2 text-[14px] font-bold text-white disabled:opacity-40 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Accept invite
            </button>
            {acceptError ? (
              <p role="alert" className="text-[12px] font-semibold text-scam-ink">
                {acceptError}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}

      <div className="mt-auto grid gap-3 pt-4">
        <button
          type="button"
          onClick={finish}
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-5 text-[17px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

function UrlInviteSummary({ code }: { code: string }) {
  const parsed = parseInviteCode(code);
  if (!parsed) {
    return (
      <article
        role="alert"
        className="rounded-2xl border border-scam-ink/20 bg-scam-bg p-5"
      >
        <h3 className="text-[16px] font-extrabold text-scam-ink">
          That invite link isn't valid
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-scam-ink/80">
          Ask the sender for a fresh link, or continue without accepting.
        </p>
      </article>
    );
  }
  const recipientRole = parsed.role === "parent" ? "family" : "parent";
  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        Invited by
      </p>
      <h3 className="mt-1 text-[20px] font-extrabold text-ink">
        {parsed.memberName}
      </h3>
      <p className="mt-2 text-[13px] leading-snug text-ink-2">
        You'll join as the{" "}
        <strong>
          {recipientRole === "parent" ? "loved one" : "family member"}
        </strong>{" "}
        side of this SafeLife family.
      </p>
    </article>
  );
}
