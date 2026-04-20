"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { EmptyState } from "@/components/empty-state";
import { useEventsStore } from "@/lib/store/events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { useMembersStore } from "@/lib/store/members";
import {
  answerAsync,
  SUGGESTIONS,
  type AskResultWithSource,
} from "@/lib/ask-parser";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations";
import { cn } from "@/lib/utils";
import { ClaudeStatusPill } from "@/components/claude-status-pill";
import { Skeleton } from "@/components/ui/skeleton";

interface QA {
  id: string;
  question: string;
  result: AskResultWithSource | null;
}

export default function FamilyAskPage() {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<QA[]>([]);

  const events = useEventsStore((s) => s.events);
  const meds = useMedsStore((s) => s.meds);
  const members = useMembersStore((s) => s.members);
  const connected = useIntegrationsStore((s) => s.connected);

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

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const id = `qa-${Date.now()}`;
    setHistory((h) => [{ id, question: trimmed, result: null }, ...h]);
    setText("");
    const result = await answerAsync(trimmed, snapshot);
    setHistory((h) => h.map((qa) => (qa.id === id ? { ...qa, result } : qa)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(text);
  }

  return (
    <>
      <AppHeader subtitle="Family hub" title="Ask anything" />

      <p className="px-5 pb-2 text-[15px] leading-snug text-ink-2">
        Free-text questions about your loved one. Answers come from the
        feed, meds, vitals, and connected services.
      </p>

      <form onSubmit={handleSubmit} className="px-4 pb-3 pt-2">
        <label htmlFor="ask-input" className="sr-only">
          Ask a question
        </label>
        <div className="flex items-stretch gap-2">
          <input
            id="ask-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Did dad take his morning meds?"
            className="min-h-[48px] flex-1 rounded-2xl border border-line bg-white p-3 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="min-h-[48px] rounded-2xl bg-ink px-4 py-2 text-[14px] font-bold text-white disabled:opacity-50 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Ask
          </button>
        </div>
      </form>

      {/* Suggested questions */}
      <div className="px-4 pb-4">
        <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
          Try
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="min-h-[36px] rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <section
        aria-label="Conversation"
        className="flex flex-1 flex-col gap-3 px-4 pb-6"
      >
        {history.length === 0 ? (
          <EmptyState
            emoji="💬"
            title="No questions yet"
            body="Ask anything above, or tap a suggestion. Answers cite the source."
          />
        ) : (
          history.map((qa) => <QACard key={qa.id} qa={qa} />)
        )}
      </section>
    </>
  );
}

function QACard({ qa }: { qa: QA }) {
  const isPending = qa.result === null;
  const isUnknown = qa.result?.intent === "unknown";

  return (
    <article className="flex flex-col gap-2.5">
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[14px] font-semibold leading-snug text-white">
        {qa.question}
      </div>
      {isPending ? (
        <div className="max-w-[90%] self-start rounded-2xl rounded-bl-md bg-panel p-4">
          <Skeleton className="h-[18px] w-3/4" />
          <Skeleton className="mt-2 h-[14px] w-full" />
          <Skeleton className="mt-1 h-[14px] w-5/6" />
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[90%] self-start rounded-2xl rounded-bl-md p-4",
            isUnknown ? "bg-panel" : "bg-chip-blue"
          )}
        >
          <p
            className={cn(
              "text-[15px] font-bold leading-snug",
              isUnknown ? "text-ink-2" : "text-ink"
            )}
          >
            {qa.result!.headline}
          </p>
          {qa.result!.bullets?.length ? (
            <ul className="mt-2 grid gap-1 text-[13px] leading-snug text-ink-2">
              {qa.result!.bullets.map((b, i) => (
                <li key={i}>· {b}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ClaudeStatusPill source={qa.result!.source} />
            {qa.result!.sources?.length ? (
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted">
                Source: {qa.result!.sources.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
