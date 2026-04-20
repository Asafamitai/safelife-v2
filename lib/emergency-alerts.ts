/**
 * Seed data for the parent-side Emergency dashboard. These are synthetic —
 * in production they'd come from connected health / location / fall-detection
 * providers (e.g. Apple Watch, Life Alert, AdhereTech, carrier alerts).
 *
 * Severity contract mirrors lib/anomalies.ts:
 *   critical — needs immediate action (fall, no-movement, SOS press)
 *   warning  — worth a look (vitals out of range, schedule drift)
 *   info     — context-only (resolved incidents, check-ins)
 */

export type EmergencySeverity = "critical" | "warning" | "info";
export type EmergencyKind = "health" | "location" | "device" | "resolved";

export interface EmergencyAlert {
  id: string;
  severity: EmergencySeverity;
  kind: EmergencyKind;
  title: string;
  body: string;
  time: string;
  /** Provider that surfaced the alert (e.g. "Apple Health", "Life Alert"). */
  source: string;
}

export const EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: "ea-1",
    severity: "warning",
    kind: "health",
    title: "Heart rate above resting range",
    body: "122 bpm for 8 minutes while seated. Consider checking in.",
    time: "10 min ago",
    source: "Apple Health",
  },
  {
    id: "ea-2",
    severity: "info",
    kind: "resolved",
    title: "Fall detection — false alarm",
    body: "Apple Watch detected a fall at 7:14 AM. Dismissed by Mom 12s later.",
    time: "2h ago",
    source: "Apple Watch",
  },
];

export const SEVERITY_COPY: Record<
  EmergencySeverity,
  { label: string; pillBg: string; pillInk: string; dot: string }
> = {
  critical: {
    label: "Critical",
    pillBg: "bg-scam-bg",
    pillInk: "text-scam-ink",
    dot: "bg-scam-ink",
  },
  warning: {
    label: "Warning",
    pillBg: "bg-ride-bg",
    pillInk: "text-ride-ink",
    dot: "bg-ride-ink",
  },
  info: {
    label: "Info",
    pillBg: "bg-chip-blue",
    pillInk: "text-accent",
    dot: "bg-accent",
  },
};
