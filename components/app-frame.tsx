import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile-first app shell used by the parent and family routes.
 * Centered phone-width column on desktop, full-width on mobile.
 */
export function AppFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-panel">
      <div
        className={cn(
          "relative mx-auto flex min-h-screen max-w-[440px] flex-col bg-off-white shadow-card md:my-0",
          className
        )}
      >
        {children}
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
    <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-6">
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
