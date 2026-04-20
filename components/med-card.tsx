"use client";

import { useEventsStore } from "@/lib/store/events";
import { useMedsStore, type Med } from "@/lib/store/meds";
import { useToastsStore } from "@/lib/store/toasts";
import { CategoryTag } from "@/components/category-tag";

/**
 * Parent-side medication card with a 56pt+ confirm button.
 * Confirming surfaces a soft note in the family feed.
 */
export function MedCard({ med }: { med: Med }) {
  const confirm = useMedsStore((s) => s.confirm);
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);
  const taken = !!med.takenAt;

  function onConfirm() {
    const stamp = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    confirm(med.id, stamp);
    prepend({
      id: `med-${med.id}-${Date.now()}`,
      variant: "med",
      tag: "Daily flow",
      title: `${med.schedule} meds — done`,
      body: `${med.name} ${med.dose} marked as taken at ${stamp}.`,
      time: stamp,
    });
    pushToast({
      tone: "ok",
      title: "Nice work",
      body: `${med.name} marked as taken.`,
    });
  }

  return (
    <article
      className="rounded-2xl border border-line bg-white p-5"
      aria-labelledby={`med-${med.id}-title`}
    >
      <div className="flex items-center justify-between">
        <CategoryTag variant="med">Medication</CategoryTag>
        <span className="text-[15px] font-semibold text-muted">
          {med.takeAt}
        </span>
      </div>

      <h3
        id={`med-${med.id}-title`}
        className="mt-2 text-[22px] font-extrabold tracking-tight text-ink"
      >
        {med.name}
      </h3>
      <p className="mt-1 text-[18px] text-ink-2">
        {med.dose} · {med.schedule}
      </p>

      {taken ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-ok-bg px-4 py-3 text-[16px] font-bold text-ok-ink">
          <span aria-hidden>✓</span>
          Taken at {med.takenAt}
        </div>
      ) : (
        <button
          type="button"
          onClick={onConfirm}
          aria-label={`Mark ${med.name} as taken`}
          className="mt-4 flex w-full min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-[20px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          I took it
        </button>
      )}
    </article>
  );
}
