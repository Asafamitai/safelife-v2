"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function InviteCard({
  code,
  url,
  counterpartLabel,
}: {
  code: string;
  url: string;
  /** Human label for the persona this invite delivers, e.g. "your parent". */
  counterpartLabel: string;
}) {
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  async function copy(value: string, kind: "url" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // Clipboard permissions can be denied — user can copy manually.
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        Share with {counterpartLabel}
      </p>
      <h3 className="mt-1 text-[18px] font-extrabold leading-snug tracking-tight text-ink">
        Send them this link
      </h3>
      <p className="mt-1 text-[13px] leading-snug text-ink-2">
        Opening it in another browser — even incognito — lands them in the
        matching side of SafeLife, pre-connected to you.
      </p>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label="Invite link"
            className="min-h-[44px] flex-1 rounded-xl border border-line bg-panel px-3 py-2 font-mono text-[12px] text-ink"
          />
          <button
            type="button"
            onClick={() => copy(url, "url")}
            className={cn(
              "min-h-[44px] rounded-xl px-4 py-2 text-[13px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              copied === "url" ? "bg-ok-ink" : "bg-ink"
            )}
          >
            {copied === "url" ? "Copied" : "Copy link"}
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[12px] font-semibold text-muted">Or share the code</span>
          <code
            aria-label="Invite code"
            className="rounded-md bg-panel px-2 py-1 font-mono text-[12px] font-bold text-ink"
          >
            {code.slice(0, 12)}…
          </code>
          <button
            type="button"
            onClick={() => copy(code, "code")}
            className="min-h-[36px] rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {copied === "code" ? "Copied" : "Copy code"}
          </button>
        </div>
      </div>
    </article>
  );
}
