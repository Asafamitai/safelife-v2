import type { ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { PersonaSwitch } from "@/components/persona-switch";

export default function FamilyLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame>
      <PersonaSwitch />
      <div className="flex flex-1 flex-col">{children}</div>
      <BottomTabBar
        tabs={[
          { href: "/family/home", label: "Home", icon: "🏠" },
          { href: "/family/ask", label: "Ask", icon: "💬" },
          { href: "/family/insights", label: "Insights", icon: "📈" },
          { href: "/family/connections", label: "Connect", icon: "🔌" },
          { href: "/family/settings", label: "Settings", icon: "⚙️" },
        ]}
      />
    </AppFrame>
  );
}
