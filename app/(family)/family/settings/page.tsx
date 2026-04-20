"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-frame";
import { useEventsStore } from "@/lib/store/events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { useMembersStore } from "@/lib/store/members";

export default function FamilySettingsPage() {
  const resetEvents = useEventsStore((s) => s.reset);
  const resetIntegrations = useIntegrationsStore((s) => s.reset);
  const resetMeds = useMedsStore((s) => s.reset);
  const resetMembers = useMembersStore((s) => s.reset);
  const memberCount = useMembersStore((s) => s.members.length);
  const connectedCount = useIntegrationsStore(
    (s) => Object.keys(s.connected).length
  );

  function resetAll() {
    resetEvents();
    resetIntegrations();
    resetMeds();
    resetMembers();
  }

  return (
    <>
      <AppHeader subtitle="Family hub" title="Settings" />

      <section className="flex flex-1 flex-col gap-3 px-4 pb-6">
        <SettingRow
          title="Notifications"
          body="Right alerts at the right time. Tuned to avoid noise."
          status="On"
        />
        <SettingRow
          title="Quiet hours"
          body="No non-urgent alerts between 10:00 PM and 7:00 AM."
          status="On"
        />
        <Link
          href="/family/members"
          className="rounded-2xl border border-line bg-white p-4 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-bold text-ink">Members</h3>
            <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-bold text-ink-2">
              {memberCount}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-2">
            See who’s connected to this family. Tap to manage.
          </p>
        </Link>
        <Link
          href="/family/connections"
          className="rounded-2xl border border-line bg-white p-4 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-bold text-ink">
              <span aria-hidden className="mr-1.5">🔌</span>
              Connected services
            </h3>
            <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[11px] font-bold text-ok-ink">
              {connectedCount} on
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-2">
            Pharmacies, health devices, fraud alerts, MCP servers, and more —
            opt-in per provider.
          </p>
        </Link>
        <SettingRow
          title="Privacy"
          body="No location tracking. No live audio or video. Opt-in per service."
          status="Strict"
        />

        <button
          type="button"
          onClick={resetAll}
          className="mt-4 min-h-[48px] rounded-2xl border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Reset demo data
        </button>
        <p className="px-1 text-[12px] leading-snug text-muted">
          Clears feed events, connected services, and confirmed meds back to
          their seeded state.
        </p>
      </section>
    </>
  );
}

function SettingRow({
  title,
  body,
  status,
}: {
  title: string;
  body: string;
  status?: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {status ? (
          <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[11px] font-bold text-ok-ink">
            {status}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[13px] leading-snug text-ink-2">{body}</p>
    </article>
  );
}
