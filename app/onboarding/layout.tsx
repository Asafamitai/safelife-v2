import type { ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";

/**
 * Minimal onboarding shell. Deliberately omits `PersonaSwitch` and the
 * `BottomTabBar` — both imply a chosen persona, and the whole point of
 * this flow is choosing one.
 */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppFrame>
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </AppFrame>
  );
}
