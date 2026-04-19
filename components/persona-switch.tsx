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
  const isParent = pathname.startsWith("/parent");
  const isFamily = pathname.startsWith("/family");
  if (!isParent && !isFamily) return null;

  const otherHref = isParent ? "/family/home" : "/parent/home";
  const otherLabel = isParent ? "Family view" : "Parent view";

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
          isParent ? "bg-ink text-white" : "bg-family-bg text-family-ink"
        )}
      >
        {isParent ? "Parent" : "Family"}
      </span>
      <Link
        href={otherHref}
        aria-label={`Switch to ${otherLabel}`}
        className="rounded-full px-2.5 py-1 text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:bg-line"
      >
        ⇄ {isParent ? "Family" : "Parent"}
      </Link>
    </div>
  );
}
