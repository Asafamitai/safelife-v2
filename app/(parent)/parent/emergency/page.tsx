"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { CategoryTag } from "@/components/category-tag";
import { NotifyEmergencySheet } from "@/components/notify-emergency-sheet";
import {
  EMERGENCY_ALERTS,
  SEVERITY_COPY,
  type EmergencyAlert,
} from "@/lib/emergency-alerts";
import { useMembersStore } from "@/lib/store/members";
import { cn } from "@/lib/utils";

/**
 * Parent-side Emergency dashboard.
 *
 * Three blocks, top to bottom:
 *   1. Status pill — green if all clear, red if any critical alerts, amber
 *      if only warnings.
 *   2. Active alerts list — severity pill + kind badge + source. Seeded
 *      from lib/emergency-alerts.ts; later a store / live provider.
 *   3. "Notify emergency contacts" card — caregivers are pre-checked;
 *      911 is off by default so the user opts in explicitly. CTA opens
 *      the multi-phase NotifyEmergencySheet.
 */

const AVATAR_TONES: Record<number, string> = {
  0: "from-[#A78BFA] to-[#7C3AED]", // Maya — purple
  1: "from-[#60A5FA] to-[#1D4ED8]", // Dad — blue
  2: "from-[#FB923C] to-[#EA580C]", // Sam — orange
  3: "from-[#34D399] to-[#059669]",
};

export default function ParentEmergencyPage() {
  const members = useMembersStore((s) => s.members);
  const caregivers = members.filter((m) => m.role !== "Parent");

  // Selection state — caregivers on by default, 911 off.
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(caregivers.map((m) => [m.id, true]))
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeAlerts = EMERGENCY_ALERTS.filter((a) => a.kind !== "resolved");
  const recentAlerts = EMERGENCY_ALERTS.filter((a) => a.kind === "resolved");

  const status = useMemo(() => {
    const anyCritical = activeAlerts.some((a) => a.severity === "critical");
    const anyWarning = activeAlerts.some((a) => a.severity === "warning");
    if (anyCritical)
      return { tone: "critical" as const, label: "Critical alert active" };
    if (anyWarning)
      return { tone: "warning" as const, label: "Something worth a look" };
    return { tone: "ok" as const, label: "All clear right now" };
  }, [activeAlerts]);

  const contactsForSheet = [
    ...caregivers
      .filter((m) => selected[m.id])
      .map((m) => ({ id: m.id, name: m.name, sublabel: m.contact })),
    ...(selected["e-911"]
      ? [{ id: "e-911", name: "911 / Emergency Services" }]
      : []),
  ];

  const canNotify = contactsForSheet.length > 0;

  return (
    <>
      <AppHeader
        parent
        subtitle="Emergency"
        title="Help is one tap away"
      />

      <section className="px-4 pb-3 pt-2" aria-label="Emergency status">
        <div
          className={cn(
            "rounded-2xl border px-5 py-4",
            status.tone === "ok"
              ? "border-ok-ink/20 bg-ok-bg"
              : status.tone === "warning"
                ? "border-ride-ink/20 bg-ride-bg"
                : "border-scam-ink/20 bg-scam-bg"
          )}
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full text-[20px]",
                status.tone === "ok"
                  ? "bg-white text-ok-ink"
                  : status.tone === "warning"
                    ? "bg-white text-ride-ink"
                    : "bg-white text-scam-ink"
              )}
            >
              {status.tone === "ok" ? "✓" : "!"}
            </span>
            <div>
              <div
                className={cn(
                  "text-[18px] font-extrabold tracking-tight",
                  status.tone === "ok"
                    ? "text-ok-ink"
                    : status.tone === "warning"
                      ? "text-ride-ink"
                      : "text-scam-ink"
                )}
              >
                {status.label}
              </div>
              <div className="text-[14px] text-ink-2">
                We’re watching health and location in the background.
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeAlerts.length > 0 ? (
        <section
          aria-label="Active alerts"
          className="flex flex-col gap-2.5 px-4 pb-3 pt-2"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[20px] font-extrabold tracking-tight text-ink">
              Active alerts
            </h2>
            <span className="text-[13px] text-muted">{activeAlerts.length}</span>
          </div>
          {activeAlerts.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </section>
      ) : null}

      <section
        aria-label="Notify emergency contacts"
        className="px-4 pb-3 pt-3"
      >
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
            Notify emergency contacts
          </h2>
          <p className="mt-1 text-[14px] leading-snug text-muted">
            Pick who should hear from you. We’ll text them your location and
            status.
          </p>

          <ul className="mt-4 space-y-2">
            {caregivers.map((m) => {
              const on = !!selected[m.id];
              return (
                <ContactRow
                  key={m.id}
                  initials={m.initials}
                  name={m.name}
                  sublabel={m.role === "Primary caregiver" ? "Primary" : m.role}
                  hue={m.hue}
                  selected={on}
                  onToggle={() =>
                    setSelected((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                  }
                />
              );
            })}
            <ContactRow
              initials="911"
              name="911 / Emergency"
              sublabel="Dispatchers and first responders"
              hue={0}
              tone="alarm"
              selected={!!selected["e-911"]}
              onToggle={() =>
                setSelected((prev) => ({
                  ...prev,
                  ["e-911"]: !prev["e-911"],
                }))
              }
            />
          </ul>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            disabled={!canNotify}
            className="mt-5 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-[18px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden>🔔</span> Notify Emergency Contacts
          </button>
        </div>
      </section>

      {recentAlerts.length > 0 ? (
        <section
          aria-label="Recent activity"
          className="flex flex-col gap-2.5 px-4 pb-6 pt-3"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
              Recent activity
            </h2>
          </div>
          {recentAlerts.map((a) => (
            <AlertCard key={a.id} alert={a} muted />
          ))}
        </section>
      ) : null}

      <NotifyEmergencySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        contacts={contactsForSheet}
      />
    </>
  );

  function ContactRow({
    initials,
    name,
    sublabel,
    hue,
    tone,
    selected,
    onToggle,
  }: {
    initials: string;
    name: string;
    sublabel?: string;
    hue: 0 | 1 | 2 | 3;
    tone?: "alarm";
    selected: boolean;
    onToggle: () => void;
  }) {
    const avatarClass =
      tone === "alarm"
        ? "bg-gradient-to-br from-[#F87171] to-[#B42318] text-white"
        : `bg-gradient-to-br ${AVATAR_TONES[hue]} text-white`;

    return (
      <li>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className={cn(
            "flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            selected
              ? "border-ink/20 bg-panel"
              : "border-line bg-white hover:bg-off-white"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-bold",
              avatarClass
            )}
          >
            {initials}
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-[17px] font-bold text-ink">{name}</span>
            {sublabel ? (
              <span className="text-[13px] text-muted">{sublabel}</span>
            ) : null}
          </span>
          <span
            aria-hidden
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
              selected
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-transparent"
            )}
          >
            ✓
          </span>
        </button>
      </li>
    );
  }
}

function AlertCard({
  alert,
  muted = false,
}: {
  alert: EmergencyAlert;
  muted?: boolean;
}) {
  const sev = SEVERITY_COPY[alert.severity];
  return (
    <article
      className={cn(
        "rounded-2xl border p-4",
        muted ? "border-line bg-off-white" : "border-line bg-white shadow-card"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em]",
            sev.pillBg,
            sev.pillInk
          )}
        >
          <span aria-hidden className={cn("h-2 w-2 rounded-full", sev.dot)} />
          {sev.label}
        </span>
        <CategoryTag variant={alert.kind === "health" ? "med" : alert.kind === "location" ? "ride" : "ok"}>
          {alert.kind}
        </CategoryTag>
        <span className="ml-auto text-[12px] text-muted">{alert.time}</span>
      </div>
      <h3 className="mt-2 text-[17px] font-extrabold tracking-tight text-ink">
        {alert.title}
      </h3>
      <p className="mt-1 text-[14px] leading-snug text-ink-2">{alert.body}</p>
      <div className="mt-2 text-[12px] text-muted">via {alert.source}</div>
    </article>
  );
}
