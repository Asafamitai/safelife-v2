import type { ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { PersonaSwitch } from "@/components/persona-switch";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame className="text-[18px]">
      <PersonaSwitch />
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      <BottomTabBar
        parent
        tabs={[
          { href: "/parent/home", label: "Home", icon: "🏠" },
          { href: "/parent/scam", label: "Protection", icon: "🛡️" },
          { href: "/parent/emergency", label: "Emergency", icon: "🚨" },
          { href: "/parent/help", label: "Help", icon: "🤝" },
          { href: "/parent/settings", label: "Settings", icon: "⚙️" },
        ]}
      />
    </AppFrame>
  );
}
