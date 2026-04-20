"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Top-of-phone persona toggle for the demo. Renders as a full-width
 * segmented pill so there's no ambiguity about which side of the product
 * you're looking at. Only mounts inside /parent/* and /family/*.
 */
export function PersonaSwitch() {
  const pathname = usePathname();
  const isLovedOne = pathname.startsWith("/parent");
  const isYou = pathname.startsWith("/family");
  if (!isLovedOne && !isYou) return null;

  return (
    <div className="px-4 pb-1 pt-3" role="group" aria-label="Demo: switch persona">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-line bg-panel p-1 text-[13px] font-bold shadow-sm">
        <Link
          href="/family/home"
          aria-current={isYou ? "page" : undefined}
          className={cn(
            "rounded-full px-3 py-2 text-center leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            isYou
              ? "bg-ink text-white shadow-sm"
              : "text-ink-2 hover:text-ink"
          )}
        >
          For You
        </Link>
        <Link
          href="/parent/home"
          aria-current={isLovedOne ? "page" : undefined}
          className={cn(
            "rounded-full px-3 py-2 text-center leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            isLovedOne
              ? "bg-ink text-white shadow-sm"
              : "text-ink-2 hover:text-ink"
          )}
        >
          For Your Loved One
        </Link>
      </div>
    </div>
  );
}
