"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { IntegrationCard } from "@/components/integration-card";
import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_PROVIDERS,
  type IntegrationCategoryId,
} from "@/lib/integrations";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { cn } from "@/lib/utils";

type Filter = "all" | IntegrationCategoryId;

export default function ConnectionsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const connectedCount = useIntegrationsStore(
    (s) => Object.keys(s.connected).length
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? INTEGRATION_PROVIDERS
        : INTEGRATION_PROVIDERS.filter((p) => p.category === filter),
    [filter]
  );

  const grouped = useMemo(() => {
    const groups: Record<string, typeof INTEGRATION_PROVIDERS> = {};
    for (const p of visible) {
      (groups[p.category] ??= []).push(p);
    }
    return groups;
  }, [visible]);

  return (
    <>
      <AppHeader
        subtitle="Family hub"
        title="Connect data"
        right={
          <span
            className="rounded-full bg-ok-bg px-3 py-1 text-[12px] font-bold text-ok-ink"
            aria-label={`${connectedCount} services connected`}
          >
            {connectedCount} connected
          </span>
        }
      />

      <p className="px-5 pb-3 text-[15px] leading-snug text-ink-2">
        Wire up pharmacies, health devices, fraud alerts, and more. Each one is
        opt-in, and you can disconnect any time.
      </p>

      <div className="mx-4 mb-3 rounded-2xl border border-line bg-chip-blue p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
          Integration Engine
        </p>
        <p className="mt-1 text-[13px] leading-snug text-ink-2">
          SafeLife uses MCP and open APIs to plug into the services your parent
          already uses — live data, no new logins for them to remember, and
          you stay in control of what's shared.
        </p>
      </div>

      <nav
        aria-label="Filter by category"
        className="flex gap-2 overflow-x-auto px-4 pb-3"
      >
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </FilterChip>
        {INTEGRATION_CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            <span aria-hidden className="mr-1">
              {c.emoji}
            </span>
            {c.label}
          </FilterChip>
        ))}
      </nav>

      <section className="flex flex-1 flex-col gap-6 px-4 pb-8">
        {INTEGRATION_CATEGORIES.filter((c) => grouped[c.id]?.length).map(
          (cat) => (
            <div key={cat.id} className="flex flex-col gap-3">
              <header className="px-1">
                <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
                  <span aria-hidden className="mr-1.5">
                    {cat.emoji}
                  </span>
                  {cat.label}
                </h2>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">
                  {cat.blurb}
                </p>
              </header>
              {grouped[cat.id]!.map((p) => (
                <IntegrationCard key={p.id} provider={p} />
              ))}
            </div>
          )
        )}
      </section>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-[36px] flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-ink-2"
      )}
    >
      {children}
    </button>
  );
}
