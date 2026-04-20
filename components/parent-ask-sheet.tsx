"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BigCTA } from "@/components/big-cta";
import {
  answerAsync,
  type AskResultWithSource,
} from "@/lib/ask-parser";
import { ClaudeStatusPill } from "@/components/claude-status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations";
import { useEventsStore } from "@/lib/store/events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { useMembersStore } from "@/lib/store/members";
import { useToastsStore } from "@/lib/store/toasts";
import {
  cancelSpeech,
  isSpeechRecognitionSupported,
  recognizeOnce,
  speak,
} from "@/lib/speech";
import { cn } from "@/lib/utils";

interface PrebakedQuery {
  emoji: string;
  label: string;
  /** First-person phrasing that the parser will route correctly. */
  question: string;
}

const PREBAKED: PrebakedQuery[] = [
  { emoji: "💊", label: "Did I take my pills?", question: "Did I take my pills?" },
  { emoji: "📅", label: "What's next today?", question: "What's next today?" },
  { emoji: "👨‍👩‍👧", label: "Who's coming over?", question: "Who's in the family?" },
];

function answerToSpeech(result: AskResultWithSource): string {
  if (!result.bullets?.length) return result.headline;
  return `${result.headline} ${result.bullets.join(". ")}.`;
}

export function ParentAskSheet() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [result, setResult] = useState<AskResultWithSource | null>(null);
  const [pending, setPending] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);

  const events = useEventsStore((s) => s.events);
  const meds = useMedsStore((s) => s.meds);
  const members = useMembersStore((s) => s.members);
  const connected = useIntegrationsStore((s) => s.connected);
  const pushToast = useToastsStore((s) => s.push);

  const snapshot = useMemo(
    () => ({
      events,
      meds,
      members,
      connected: new Set(Object.keys(connected)),
      providers: INTEGRATION_PROVIDERS,
    }),
    [events, meds, members, connected]
  );

  // Feature-detect on mount; skips during SSR.
  useEffect(() => {
    setMicSupported(isSpeechRecognitionSupported());
  }, []);

  // Stop talking when the sheet closes.
  useEffect(() => {
    if (!open) {
      cancelSpeech();
      setListening(false);
    }
  }, [open]);

  async function ask(q: string) {
    setQuestion(q);
    setResult(null);
    setPending(true);
    try {
      const r = await answerAsync(q, snapshot);
      setResult(r);
      speak(answerToSpeech(r));
    } finally {
      setPending(false);
    }
  }

  async function handleMic() {
    if (listening) return;
    setListening(true);
    try {
      const transcript = await recognizeOnce();
      if (!transcript) {
        pushToast({
          tone: "warn",
          title: "Didn't catch that",
          body: "Try one of the buttons or tap the mic again.",
        });
        return;
      }
      ask(transcript);
    } catch (e) {
      const code = e instanceof Error ? e.message : "speech-recognition-error";
      pushToast({
        tone: "warn",
        title:
          code === "not-allowed"
            ? "Microphone permission needed"
            : code === "speech-recognition-no-result"
              ? "Didn't hear anything"
              : "Couldn't listen right now",
      });
    } finally {
      setListening(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <BigCTA parent aria-label="Ask SafeLife" className="bg-white text-ink border border-ink">
          <span aria-hidden className="text-[24px]">💬</span>
          Ask SafeLife
        </BigCTA>
      </SheetTrigger>
      <SheetContent className="pb-10">
        <SheetHeader>
          <SheetTitle>Ask SafeLife</SheetTitle>
          <SheetDescription>
            Tap a question, or hold the mic and speak.
          </SheetDescription>
        </SheetHeader>

        <ul className="mt-5 grid gap-3">
          {PREBAKED.map((p) => (
            <li key={p.label}>
              <button
                type="button"
                onClick={() => ask(p.question)}
                aria-label={p.label}
                className="flex w-full min-h-[68px] items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span
                  aria-hidden
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-panel text-[24px]"
                >
                  {p.emoji}
                </span>
                <span className="text-[18px] font-bold text-ink">{p.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {micSupported ? (
          <button
            type="button"
            onClick={handleMic}
            aria-pressed={listening}
            aria-busy={listening}
            className={cn(
              "mt-3 flex w-full min-h-[68px] items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-accent bg-chip-blue px-4 text-[18px] font-bold text-accent transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              listening && "animate-pulse"
            )}
          >
            <span aria-hidden className="text-[24px]">🎙️</span>
            {listening ? "Listening…" : "Tap and speak"}
          </button>
        ) : null}

        <section
          aria-live="polite"
          className="mt-5"
        >
          {pending ? (
            <div className="rounded-2xl bg-panel p-5">
              {question ? (
                <>
                  <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
                    You asked
                  </p>
                  <p className="mt-1 text-[16px] text-ink-2">{question}</p>
                </>
              ) : null}
              <Skeleton className="mt-3 h-[28px] w-3/4" />
              <Skeleton className="mt-2 h-[18px] w-full" />
              <Skeleton className="mt-1.5 h-[18px] w-5/6" />
            </div>
          ) : result ? (
            <div className="rounded-2xl bg-panel p-5">
              {question ? (
                <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
                  You asked
                </p>
              ) : null}
              {question ? (
                <p className="mt-1 text-[16px] text-ink-2">{question}</p>
              ) : null}
              <p className="mt-3 text-[22px] font-extrabold leading-snug tracking-tight text-ink">
                {result.headline}
              </p>
              {result.bullets?.length ? (
                <ul className="mt-3 grid gap-1.5 text-[18px] leading-snug text-ink-2">
                  {result.bullets.map((b, i) => (
                    <li key={i}>· {b}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ClaudeStatusPill source={result.source} />
                {result.sources?.length ? (
                  <p className="text-[12px] uppercase tracking-[0.08em] text-muted">
                    Source: {result.sources.join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="px-1 text-[15px] leading-snug text-muted">
              We'll read the answer out loud and show it here.
            </p>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}
