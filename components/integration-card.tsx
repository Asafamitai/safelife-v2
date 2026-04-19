"use client";

import { useEffect, useRef, useState } from "react";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";
import type { IntegrationProvider } from "@/lib/integrations";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<IntegrationProvider["kind"], string> = {
  mcp: "MCP",
  api: "API",
};

const KIND_TONE: Record<IntegrationProvider["kind"], string> = {
  mcp: "bg-family-bg text-family-ink",
  api: "bg-chip-blue text-accent",
};

export function IntegrationCard({
  provider,
}: {
  provider: IntegrationProvider;
}) {
  const isConnected = useIntegrationsStore((s) => s.isConnected(provider.id));
  const connect = useIntegrationsStore((s) => s.connect);
  const disconnect = useIntegrationsStore((s) => s.disconnect);
  const prependEvent = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);
  const connectedAt = useIntegrationsStore(
    (s) => s.connected[provider.id]?.connectedAt
  );

  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const confirmTimeout = useRef<number | null>(null);

  // Reset the confirm step if the user wanders away.
  useEffect(() => {
    return () => {
      if (confirmTimeout.current) window.clearTimeout(confirmTimeout.current);
    };
  }, []);

  function doDisconnect() {
    disconnect(provider.id);
    prependEvent({
      id: `int-disc-${provider.id}-${Date.now()}`,
      variant: "family",
      tag: "Connection",
      title: `${provider.name} disconnected`,
      body: "We’ll stop pulling updates from this service.",
      time: "Now",
    });
    pushToast({
      tone: "info",
      title: `${provider.name} disconnected`,
    });
    setConfirmingDisconnect(false);
  }

  function doConnect() {
    connect(provider.id);
    prependEvent({
      id: `int-conn-${provider.id}-${Date.now()}`,
      variant: "family",
      tag: "Connection",
      title: `${provider.name} connected`,
      body: provider.summary,
      time: "Now",
    });
    pushToast({
      tone: "ok",
      title: `${provider.name} connected`,
      body: provider.summary,
    });
  }

  function handlePrimary() {
    if (!isConnected) return doConnect();
    if (confirmingDisconnect) {
      if (confirmTimeout.current) window.clearTimeout(confirmTimeout.current);
      return doDisconnect();
    }
    setConfirmingDisconnect(true);
    confirmTimeout.current = window.setTimeout(
      () => setConfirmingDisconnect(false),
      3500
    );
  }

  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4"
      aria-labelledby={`int-${provider.id}-title`}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-panel text-[22px]"
        >
          {provider.emoji ?? "🔌"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3
              id={`int-${provider.id}-title`}
              className="text-[15px] font-bold text-ink"
            >
              {provider.name}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                KIND_TONE[provider.kind]
              )}
            >
              {KIND_LABEL[provider.kind]}
            </span>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ok-bg px-2 py-0.5 text-[10px] font-bold text-ok-ink">
                <span aria-hidden>●</span> On
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] leading-snug text-ink-2">
            {provider.summary}
          </p>
          <p className="mt-1.5 text-[11px] text-muted">
            {provider.authMethod}
            {isConnected && connectedAt ? ` · Connected ${connectedAt}` : null}
          </p>
        </div>
      </div>

      {isConnected && provider.liveData?.length ? (
        <dl className="rounded-xl bg-panel p-3">
          {provider.liveData.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 py-0.5 first:pt-0 last:pb-0"
            >
              <dt className="text-[12px] text-muted">{row.label}</dt>
              <dd className="text-[13px] font-bold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <button
        type="button"
        onClick={handlePrimary}
        aria-pressed={isConnected}
        aria-label={`${isConnected ? "Disconnect" : "Connect"} ${provider.name}`}
        className={cn(
          "min-h-[44px] w-full rounded-xl px-3 py-2 text-[14px] font-bold transition-all hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:translate-y-0 active:scale-[0.99]",
          !isConnected && "border border-ink bg-ink text-white active:bg-ink-2",
          isConnected && !confirmingDisconnect && "border border-line bg-white text-ink-2 hover:bg-panel",
          isConnected && confirmingDisconnect && "border border-scam-ink bg-scam-bg text-scam-ink"
        )}
      >
        {!isConnected
          ? "Connect"
          : confirmingDisconnect
            ? "Tap again to disconnect"
            : "Disconnect"}
      </button>
    </article>
  );
}
