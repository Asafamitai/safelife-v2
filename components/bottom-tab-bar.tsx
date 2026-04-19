"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  icon: string;
}

interface Props {
  tabs: Tab[];
  /** Larger labels and tap targets for the parent app. */
  parent?: boolean;
}

const COLS: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export function BottomTabBar({ tabs, parent = false }: Props) {
  const pathname = usePathname();
  const cols = COLS[tabs.length] ?? "grid-cols-4";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "grid gap-1 border-t border-line bg-white px-4 pb-5 pt-2.5",
        cols
      )}
    >
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] flex-col items-center gap-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg",
              parent ? "text-[13px]" : "text-[10px]",
              active ? "font-bold text-ink" : "text-muted"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid place-items-center rounded-lg",
                parent ? "h-7 w-7 text-lg" : "h-[22px] w-[22px] text-sm",
                active ? "bg-[#EEF2FF]" : ""
              )}
            >
              {t.icon}
            </span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
