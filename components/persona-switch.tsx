"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Compact persona toggle anchored to the top-right of the in-app phone
 * frame. Only renders inside /parent/* and /family/*; outside the apps
 * (landing, /privacy, /terms) it stays hidden.
 */
export function PersonaSwitch() {
  const pathname = usePathname();
  const isLovedOne = pathname.startsWith("/parent");
  const isYou = pathname.startsWith("/family");
  if (!isLovedOne && !isYou) return null;

  const otherHref = isLovedOne ? "/family/home" : "/parent/home";
  const otherLabel = isLovedOne ? "your view" : "their view";

  return (
    <div
      role="group"
      aria-label="Demo: switch persona"
      className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-line bg-white/95 p-0.5 text-[11px] font-bold shadow-card backdrop-blur"
    >
      <span
        aria-current="page"
        className={cn(
          "rounded-full px-2.5 py-1",
          isLovedOne ? "bg-ride-bg text-ride-ink" : "bg-family-bg text-family-ink"
        )}
      >
        {isLovedOne ? "Their app" : "Your app"}
      </span>
      <Link
        href={otherHref}
        aria-label={`Switch to ${otherLabel}`}
        className="rounded-full px-2.5 py-1 text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:bg-line"
      >
        ⇄ {isLovedOne ? "Yours" : "Theirs"}
      </Link>
    </div>
  );
}
