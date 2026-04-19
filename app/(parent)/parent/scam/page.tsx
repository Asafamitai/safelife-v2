"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-frame";
import { CategoryTag } from "@/components/category-tag";
import { TourBanner } from "@/components/tour-banner";
import { classifyMessage, type ScamRating } from "@/lib/scam-heuristics";
import { useEventsStore } from "@/lib/store/events";
import { useTourStore } from "@/lib/tour";
import { cn } from "@/lib/utils";

const TONE: Record<
  ScamRating,
  { bg: string; ink: string; label: string; emoji: string }
> = {
  safe: { bg: "bg-ok-bg", ink: "text-ok-ink", label: "Looks safe", emoji: "✅" },
  suspicious: {
    bg: "bg-ride-bg",
    ink: "text-ride-ink",
    label: "Looks suspicious",
    emoji: "⚠️",
  },
  scam: {
    bg: "bg-scam-bg",
    ink: "text-scam-ink",
    label: "Likely a scam",
    emoji: "🚫",
  },
};

const SAMPLE =
  "URGENT: Your bank account will be suspended in 24 hours. Verify your account now: http://bit.ly/secure-bank — provide your SSN and a one-time code to keep access.";

export default function ParentScamPage() {
  const [text, setText] = useState("");
  const [blockedFor, setBlockedFor] = useState<string | null>(null);
  const prepend = useEventsStore((s) => s.prepend);
  const router = useRouter();
  const tourActive = useTourStore((s) => s.active === "scam-to-feed");
  const tourStep = useTourStore((s) => s.step);
  const advance = useTourStore((s) => s.advance);

  // Tour step 0 on this page: pre-fill the sample so the user doesn't stare at an empty box.
  useEffect(() => {
    if (tourActive && tourStep === 0 && !text) {
      setText(SAMPLE);
    }
  }, [tourActive, tourStep, text]);

  const result = useMemo(() => classifyMessage(text), [text]);
  const tone = TONE[result.rating];
  const isEmpty = text.trim().length === 0;

  function handleBlock() {
    const snippet = text.trim().slice(0, 120);
    prepend({
      id: `scam-${Date.now()}`,
      variant: "scam",
      tag: "Scam check",
      title: "Suspicious message blocked",
      body: snippet ? `“${snippet}${text.length > 120 ? "…" : ""}”` : undefined,
      time: "Now",
    });
    setBlockedFor(snippet || "the last message");
    setText("");
    if (tourActive) {
      advance();
      // Small delay so the user sees the "Blocked" confirmation before we jump.
      setTimeout(() => router.push("/family/home"), 900);
    }
  }

  function handleMarkSafe() {
    prepend({
      id: `scam-safe-${Date.now()}`,
      variant: "ok",
      tag: "Scam check",
      title: "Message marked safe",
      body: "Reviewed and dismissed.",
      time: "Now",
    });
    setText("");
  }

  return (
    <>
      <AppHeader
        parent
        subtitle="Scam Shield"
        title="Check a message"
      />

      <TourBanner
        tour="scam-to-feed"
        step={0}
        total={2}
        title="We loaded a sample scam for you"
        body="Read the analysis, then tap “Block and tell my family”."
      />

      <p className="px-5 pb-2 pt-2 text-[18px] leading-snug text-ink-2">
        Paste a text or email below. We’ll explain what we see in one sentence.
      </p>

      <div className="px-4 pb-3 pt-2">
        <label htmlFor="scam-input" className="sr-only">
          Message to check
        </label>
        <textarea
          id="scam-input"
          data-testid="scam-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the suspicious message here…"
          rows={6}
          className="w-full resize-none rounded-2xl border border-line bg-white p-4 text-[18px] leading-snug text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setText(SAMPLE)}
            className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[15px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Try a sample message
          </button>
          <button
            type="button"
            onClick={() => setText("")}
            disabled={isEmpty}
            className="min-h-[44px] rounded-xl px-4 py-2 text-[15px] font-semibold text-muted disabled:opacity-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear
          </button>
        </div>
      </div>

      <section
        aria-live="polite"
        className="px-4 pb-3 pt-2"
        data-testid="scam-result"
      >
        <div className={cn("rounded-2xl p-5", tone.bg)}>
          <div className="flex items-center gap-3">
            <span aria-hidden className="text-[28px]">
              {tone.emoji}
            </span>
            <div>
              <CategoryTag
                variant={
                  result.rating === "safe"
                    ? "ok"
                    : result.rating === "suspicious"
                      ? "ride"
                      : "scam"
                }
              >
                {isEmpty ? "Result" : tone.label}
              </CategoryTag>
              <p
                data-testid="scam-rating"
                className={cn(
                  "text-[20px] font-extrabold tracking-tight",
                  tone.ink
                )}
              >
                {isEmpty ? "Waiting for a message" : tone.label}
              </p>
            </div>
          </div>
          <p className={cn("mt-3 text-[17px] leading-snug", tone.ink)}>
            {result.explanation}
          </p>
          {result.hits.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {result.hits.slice(0, 6).map((h, i) => (
                <li
                  key={i}
                  className="rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-2"
                >
                  {h.category}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {!isEmpty && result.rating !== "safe" ? (
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={handleBlock}
              data-testid="scam-block"
              className="flex min-h-[60px] w-full items-center justify-center rounded-2xl bg-ink px-5 py-4 text-[20px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Block and tell my family
            </button>
            <button
              type="button"
              onClick={handleMarkSafe}
              className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-line bg-white px-5 py-4 text-[18px] font-semibold text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Mark safe
            </button>
          </div>
        ) : null}

        {blockedFor ? (
          <div
            role="status"
            data-testid="scam-blocked-toast"
            className="mt-4 rounded-2xl border border-ok-ink/20 bg-ok-bg p-4 text-[16px] font-bold text-ok-ink"
          >
            Blocked. Your family was notified.
          </div>
        ) : null}
      </section>
    </>
  );
}
