"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BigCTA } from "@/components/big-cta";
import { Button } from "@/components/ui/button";

/**
 * Family-side placeholder sheet for "Check a message now". Real review flow
 * lands in a later milestone — for now this confirms the entry point exists
 * and routes the family member to the parent-side scam checker.
 */
export function CheckMessageSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <BigCTA aria-label="Check a message now">
          Check a message now <span aria-hidden>→</span>
        </BigCTA>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Check a message</SheetTitle>
          <SheetDescription>
            Forward or paste a suspicious text or email. SafeLife will explain
            whether it looks safe, suspicious, or a scam — in one sentence.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 grid gap-3">
          <Button asChild size="lg" variant="primary">
            <Link href="/parent/scam">Open scam checker</Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Not now
          </Button>
        </div>

        <p className="mt-5 text-[13px] leading-snug text-muted">
          Tip: you can also auto-forward suspicious texts from your parent&apos;s
          phone — turn it on in Settings later.
        </p>
      </SheetContent>
    </Sheet>
  );
}
