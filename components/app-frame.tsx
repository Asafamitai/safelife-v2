import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Demo shell for the parent and family routes.
 *
 * Desktop (≥ md): renders the app inside an iPhone-shaped chrome — rounded
 * body, notch, status bar — centered on a soft grey canvas with a "Back to
 * SafeLife" exit above. Content scrolls inside the phone; the bottom tab
 * bar stays pinned to the phone's bottom edge.
 *
 * Mobile (< md): no phone chrome (a phone inside a phone is silly). The
 * app fills the viewport; a slim top bar gives the same "← SafeLife" exit.
 */
export function AppFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#EDEFF5]">
      {/* Desktop exit + demo badge */}
      <div className="hidden items-center justify-between gap-3 px-6 py-5 md:flex">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink-2 shadow-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden>←</span> Back to SafeLife
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2">
          Demo preview
        </span>
      </div>

      {/* Mobile exit bar */}
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden>←</span> SafeLife
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2">
          Demo
        </span>
      </div>

      {/* Phone stage */}
      <div className="flex flex-1 items-start justify-center px-0 pb-0 md:items-center md:px-6 md:pb-8">
        <div className="relative w-full md:w-auto">
          <div className="relative md:rounded-[54px] md:bg-ink md:p-3 md:shadow-phone">
            {/* Notch (desktop only) */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[16px] z-20 hidden h-7 w-[120px] -translate-x-1/2 rounded-full bg-ink md:block"
            />

            {/* Inner screen — also the portal target for every Sheet
                opened inside the demo (see components/ui/sheet.tsx), so
                overlays and bottom-sheets render within the phone chrome
                instead of covering the whole viewport. */}
            <div
              id="demo-phone-viewport"
              className={cn(
                "relative flex flex-col overflow-hidden bg-off-white",
                "min-h-[calc(100vh-52px)] md:min-h-0 md:h-[820px] md:w-[400px] md:rounded-[42px]",
                className
              )}
            >
              {/* Status bar (desktop only) */}
              <div
                aria-hidden
                className="hidden items-center justify-between px-6 pb-1 pt-4 text-[13px] font-semibold text-ink md:flex"
              >
                <span>9:41</span>
                <span className="flex items-center gap-1.5 text-ink-2">
                  <span className="signal-bars inline-flex items-end">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="text-[11px] font-bold">5G</span>
                  <span className="font-bold">100%</span>
                </span>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppHeader({
  title,
  subtitle,
  right,
  parent = false,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  parent?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
      <div>
        <div className={cn("text-muted", parent ? "text-[15px]" : "text-[13px]")}>
          {subtitle ?? "SafeLife"}
        </div>
        <h1
          className={cn(
            "mt-0.5 font-extrabold leading-tight tracking-tight",
            parent ? "text-[28px]" : "text-[22px]"
          )}
        >
          {title}
        </h1>
      </div>
      {right ? <div>{right}</div> : null}
    </header>
  );
}
