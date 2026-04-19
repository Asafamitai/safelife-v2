"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Tiny pill at the very top of the phone frame that lets you jump between
 * the Parent and Family apps. Useful for the demo — in shipping clients
 * each user only sees their own side.
 */
export function PersonaSwitch() {
  const pathname = usePathname();
  const isParent = pathname.startsWith("/parent");
  const isFamily = pathname.startsWith("/family");

  // Only show on the in-app routes.
  if (!isParent && !isFamily) return null;

  return (
    <div
      role="group"
      aria-label="Demo: switch persona"
      className="mx-4 mt-3 inline-grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 text-[12px] font-bold"
    >
      <Link
        href="/parent/home"
        className={cn(
          "rounded-full px-3 py-1.5 text-center transition-colors",
          isParent ? "bg-ink text-white" : "text-ink-2 hover:bg-panel"
        )}
      >
        Parent
      </Link>
      <Link
        href="/family/home"
        className={cn(
          "rounded-full px-3 py-1.5 text-center transition-colors",
          isFamily ? "bg-ink text-white" : "text-ink-2 hover:bg-panel"
        )}
      >
        Family
      </Link>
    </div>
  );
}
