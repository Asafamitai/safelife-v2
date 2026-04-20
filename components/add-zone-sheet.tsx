"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SafeZoneMap } from "@/components/safe-zone-map";
import { useSafeZonesStore } from "@/lib/store/safe-zones";
import { useToastsStore } from "@/lib/store/toasts";
import { cn } from "@/lib/utils";

/**
 * Two-phase creation flow:
 *   1. name — pick a display name, icon, and radius
 *   2. place — tap the map to drop a pin; the pin moves to where you tap
 *              (decorative in v1, lat/lng comes later)
 *
 * Submitting phase 2 adds the zone to the store and drops a soft toast.
 */

type Phase = "name" | "place";

const ICONS = ["🏠", "🛒", "🌳", "🏛️", "🏥", "🏢", "🏖️", "🏋️", "☕"] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddZoneSheet({ open, onOpenChange }: Props) {
  const add = useSafeZonesStore((s) => s.add);
  const pushToast = useToastsStore((s) => s.push);

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("🏠");
  const [radius, setRadius] = useState(120);
  const [pin, setPin] = useState<{ x: number; y: number }>({ x: 200, y: 120 });

  // Reset state every time the sheet re-opens so the user isn't
  // editing a stale draft from the last time they canceled.
  useEffect(() => {
    if (open) {
      setPhase("name");
      setName("");
      setIcon("🏠");
      setRadius(120);
      setPin({ x: 200, y: 120 });
    }
  }, [open]);

  const canAdvance = name.trim().length > 0;

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 400;
    const relY = ((e.clientY - rect.top) / rect.height) * 240;
    setPin({ x: relX, y: relY });
  }

  function handleCreate() {
    add({ name: name.trim(), icon, radius, enabled: true });
    pushToast({
      tone: "ok",
      title: "Zone added",
      body: `${icon} ${name.trim()} will trigger alerts on entry and exit.`,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {phase === "name" ? "Name your zone" : "Pick location on map"}
          </SheetTitle>
        </SheetHeader>

        {phase === "name" ? (
          <div className="mt-4 space-y-5">
            <div>
              <label
                htmlFor="zone-name"
                className="sr-only"
              >
                Zone name
              </label>
              <input
                id="zone-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home, Pharmacy, Church..."
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                autoFocus
              />
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                Icon
              </div>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((i) => {
                  const active = i === icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      aria-pressed={active}
                      aria-label={`Choose icon ${i}`}
                      className={cn(
                        "grid aspect-square place-items-center rounded-xl border text-[20px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        active
                          ? "border-ink bg-panel"
                          : "border-line bg-white hover:bg-panel"
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  Radius
                </div>
                <div className="text-[14px] font-bold text-ink">{radius}m</div>
              </div>
              <input
                type="range"
                min={50}
                max={400}
                step={10}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                aria-label="Radius in meters"
                className="w-full accent-ink"
              />
            </div>

            <button
              type="button"
              onClick={() => canAdvance && setPhase("place")}
              disabled={!canAdvance}
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-[16px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
            >
              Next: Pick location on map →
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-[14px] leading-snug text-ink-2">
              Tap anywhere on the map to drop the pin. You can adjust again
              after saving.
            </p>

            <div
              onClick={handleMapClick}
              className="cursor-crosshair"
              role="button"
              aria-label="Pick a location on the map"
            >
              <SafeZoneMap pin={{ ...pin, icon }} className="h-[240px]" />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-3 text-[14px] text-ink-2">
              <span aria-hidden className="text-[18px]">
                📍
              </span>
              Pin at {Math.round(pin.x)}, {Math.round(pin.y)} — approx.
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={handleCreate}
                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-[16px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Create zone
              </button>
              <button
                type="button"
                onClick={() => setPhase("name")}
                className="min-h-[44px] rounded-2xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
