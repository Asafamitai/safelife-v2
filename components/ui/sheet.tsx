"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom / side sheet wrapper on top of Radix Dialog.
 *
 * Scoping: every sheet portals into `#demo-phone-viewport` when that
 * element exists (i.e. we're inside the parent/family demo shell, see
 * components/app-frame.tsx). Overlay + content then use `absolute`
 * positioning so they stay inside the iPhone chrome instead of
 * covering the whole viewport. Outside the demo (landing, /privacy,
 * /terms) the portal falls back to body + fixed positioning.
 */

const PHONE_VIEWPORT_ID = "demo-phone-viewport";

function usePhoneContainer(): HTMLElement | null {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setContainer(document.getElementById(PHONE_VIEWPORT_ID));
  }, []);
  return container;
}

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "bottom" | "right";
  showClose?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "bottom", showClose = true, ...props }, ref) => {
  const container = usePhoneContainer();
  const scoped = container != null;

  return (
    <DialogPrimitive.Portal container={container ?? undefined}>
      <DialogPrimitive.Overlay
        className={cn(
          scoped ? "absolute inset-0 z-30" : "fixed inset-0 z-50",
          "bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          scoped ? "absolute z-30" : "fixed z-50",
          "bg-white shadow-card focus:outline-none",
          side === "bottom"
            ? cn(
                "inset-x-0 bottom-0 rounded-t-3xl border-t border-line p-6 pb-8",
                scoped
                  ? "max-h-[88%] overflow-y-auto"
                  : "max-h-[90vh] overflow-y-auto"
              )
            : cn(
                "inset-y-0 right-0 overflow-y-auto border-l border-line p-6",
                scoped ? "w-full" : "w-full max-w-md h-full"
              ),
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "bottom"
            ? "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
            : "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          className
        )}
        {...props}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 pb-2", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[22px] font-extrabold tracking-tight text-ink", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-[15px] leading-snug text-ink-2", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
