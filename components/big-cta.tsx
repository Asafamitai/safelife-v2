"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Parent variant uses larger min-height + 18pt body for accessibility. */
  parent?: boolean;
}

/**
 * Single dominant black CTA. Parent variant guarantees 56pt min-height
 * (well above 44pt min tap target) and 18pt label.
 */
export const BigCTA = React.forwardRef<HTMLButtonElement, Props>(
  ({ parent = false, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl bg-ink font-bold tracking-tight text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        parent
          ? "min-h-[72px] px-6 py-5 text-[20px]"
          : "min-h-[56px] px-5 py-4 text-[15px]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
BigCTA.displayName = "BigCTA";
