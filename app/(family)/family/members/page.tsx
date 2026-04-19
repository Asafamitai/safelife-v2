"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { useMembersStore, type Member } from "@/lib/store/members";
import { cn } from "@/lib/utils";

const HUE_BG: Record<Member["hue"], string> = {
  0: "bg-gradient-to-br from-[#FAD0C4] to-[#FFD1FF] text-family-ink",
  1: "bg-gradient-to-br from-[#A1C4FD] to-[#C2E9FB] text-accent",
  2: "bg-gradient-to-br from-[#D4FC79] to-[#96E6A1] text-ok-ink",
  3: "bg-gradient-to-br from-[#FFE29F] to-[#FFA99F] text-ride-ink",
};

const ROLE_BADGE: Record<Member["role"], string> = {
  Parent: "bg-chip-blue text-accent",
  "Primary caregiver": "bg-ok-bg text-ok-ink",
  Family: "bg-family-bg text-family-ink",
};

export default function FamilyMembersPage() {
  const members = useMembersStore((s) => s.members);
  const add = useMembersStore((s) => s.add);
  const remove = useMembersStore((s) => s.remove);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    add({
      name: trimmed,
      initials: trimmed
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      role: "Family",
      hue: ((members.length % 4) as Member["hue"]),
    });
    setName("");
    setOpen(false);
  }

  return (
    <>
      <AppHeader
        subtitle="Family hub"
        title="Members"
        right={
          <span
            className="rounded-full bg-panel px-3 py-1 text-[12px] font-bold text-ink-2"
            aria-label={`${members.length} people`}
          >
            {members.length}
          </span>
        }
      />

      <p className="px-5 pb-2 text-[15px] leading-snug text-ink-2">
        Everyone connected to this family. The parent is at the top, caregivers
        below.
      </p>

      <section className="flex flex-1 flex-col gap-3 px-4 pb-3">
        {members.map((m) => (
          <article
            key={m.id}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4"
          >
            <span
              aria-hidden
              className={cn(
                "grid h-12 w-12 flex-shrink-0 place-items-center rounded-full text-[15px] font-bold",
                HUE_BG[m.hue]
              )}
            >
              {m.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-ink">{m.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]",
                    ROLE_BADGE[m.role]
                  )}
                >
                  {m.role}
                </span>
              </div>
              {m.contact ? (
                <p className="text-[12px] text-muted">{m.contact}</p>
              ) : null}
            </div>
            {m.role === "Family" ? (
              <button
                type="button"
                onClick={() => remove(m.id)}
                aria-label={`Remove ${m.name}`}
                className="min-h-[40px] rounded-xl border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Remove
              </button>
            ) : null}
          </article>
        ))}

        {open ? (
          <form
            onSubmit={handleAdd}
            className="rounded-2xl border border-accent/40 bg-white p-4"
          >
            <label htmlFor="member-name" className="text-[13px] font-bold text-ink">
              Name
            </label>
            <input
              id="member-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="mt-1 w-full rounded-xl border border-line bg-off-white p-3 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              autoFocus
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="min-h-[44px] flex-1 rounded-xl bg-ink px-4 py-2 text-[14px] font-bold text-white disabled:opacity-50 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Add to family
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setName("");
                }}
                className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-[56px] rounded-2xl border border-dashed border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            + Add a family member
          </button>
        )}
      </section>
    </>
  );
}
