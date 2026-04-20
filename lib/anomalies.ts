/**
 * Rules-based anomaly detector. Inputs are the same stores the rest of
 * the app reads from + the timeseries layer. Each rule returns an
 * Anomaly when its condition fires; `detect()` runs them all.
 *
 * Severity contract:
 *   urgent — needs a human action soon (high BP, missed med >2h, spam spike)
 *   warn   — worth noticing this week (trending up, sleep drop)
 *   info   — heads-up only (positive trends, milestones)
 */

import type { Med } from "./store/meds";
import {
  TIMESERIES,
  average,
  deltaVsBaseline,
  latest,
} from "./timeseries";

export type Severity = "urgent" | "warn" | "info";

export interface Anomaly {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  /** Provider IDs that contributed to the detection. */
  sources: string[];
  /** Optional suggested next action label, e.g. "Call dad". */
  action?: string;
}

const SEVERITY_RANK: Record<Severity, number> = {
  urgent: 0,
  warn: 1,
  info: 2,
};

interface DetectInput {
  connected: Set<string>;
  meds: Med[];
}

function bpRule(connected: Set<string>): Anomaly | null {
  if (!connected.has("withings")) return null;
  const series = TIMESERIES.withings.bp;
  if (!series?.length) return null;
  const last = latest(series)!;
  const trend = deltaVsBaseline(series.map((r) => r.systolic));

  if (last.systolic >= 140 || last.diastolic >= 90) {
    return {
      id: "bp-high",
      severity: "urgent",
      title: `Blood pressure is high: ${last.systolic}/${last.diastolic}`,
      body:
        trend > 5
          ? `Up ${trend.toFixed(0)}% vs the 6-day average. Worth a check-in today.`
          : "Single high reading — re-check in 30 min before alerting.",
      sources: ["Withings"],
      action: "Call dad",
    };
  }
  if (trend > 10) {
    return {
      id: "bp-trend",
      severity: "warn",
      title: "Blood pressure trending up",
      body: `Up ${trend.toFixed(0)}% over the last 7 days. Worth flagging at the next visit.`,
      sources: ["Withings"],
    };
  }
  return null;
}

function sleepRule(connected: Set<string>): Anomaly | null {
  if (!connected.has("oura")) return null;
  const series = TIMESERIES.oura.sleepScore;
  if (!series?.length) return null;
  const trend = deltaVsBaseline(series);
  if (trend < -10) {
    return {
      id: "sleep-drop",
      severity: "warn",
      title: "Sleep quality dropped this week",
      body: `Score down ${Math.abs(trend).toFixed(0)}% vs the 6-day baseline (${latest(series)} last night).`,
      sources: ["Oura Ring"],
    };
  }
  return null;
}

function stepsRule(connected: Set<string>): Anomaly | null {
  const provider = connected.has("apple-health") ? "apple-health" : connected.has("fitbit") ? "fitbit" : null;
  if (!provider) return null;
  const series = TIMESERIES[provider].steps;
  if (!series?.length) return null;
  const today = latest(series)!;
  if (today < 1500) {
    return {
      id: "steps-low",
      severity: "warn",
      title: "Very low activity today",
      body: `Only ${today.toLocaleString()} steps so far. Average is ${average(series.slice(0, -1)).toLocaleString().split(".")[0]}.`,
      sources: [provider === "apple-health" ? "Apple Health" : "Fitbit"],
    };
  }
  return null;
}

function spamRule(connected: Set<string>): Anomaly | null {
  const provider = connected.has("verizon") ? "verizon" : connected.has("tmobile") ? "tmobile" : null;
  if (!provider) return null;
  const series = TIMESERIES[provider].spamCalls;
  if (!series?.length) return null;
  const today = latest(series)!;
  const baseline = average(series.slice(0, -1));
  if (today >= 10 && today >= baseline * 2) {
    return {
      id: "spam-spike",
      severity: "urgent",
      title: `${today} spam calls today`,
      body: `That's ${(today / Math.max(baseline, 1)).toFixed(1)}× the weekly average. Likely a fresh scam campaign.`,
      sources: [provider === "verizon" ? "Verizon Call Filter" : "T-Mobile Scam Shield"],
      action: "Tighten filter",
    };
  }
  return null;
}

function adherenceRule(connected: Set<string>): Anomaly | null {
  // Pillsy is the consumer-facing bottle — prefer it for the household
  // view when both providers are connected.
  const provider = connected.has("pillsy")
    ? "pillsy"
    : connected.has("adheretech")
      ? "adheretech"
      : null;
  if (!provider) return null;
  const series = TIMESERIES[provider].adherencePct;
  if (!series?.length) return null;
  const last = latest(series)!;
  const trend = deltaVsBaseline(series);
  const source = provider === "pillsy" ? "Pillsy" : "AdhereTech";

  if (last < 75) {
    return {
      id: `adherence-low-${provider}`,
      severity: "urgent",
      title: `Adherence dropped to ${last}% this week`,
      body:
        trend < -5
          ? `Down ${Math.abs(trend).toFixed(0)}% vs the 6-day baseline. Bottle opens are getting missed.`
          : "Latest week is below the 75% adherence floor.",
      sources: [source],
      action: "Remind dad",
    };
  }
  if (trend < -10) {
    return {
      id: `adherence-trend-${provider}`,
      severity: "warn",
      title: "Adherence trending down",
      body: `Down ${Math.abs(trend).toFixed(0)}% over the last 7 days (latest ${last}%).`,
      sources: [source],
      action: "Remind dad",
    };
  }
  return null;
}

function medsRule({ meds }: DetectInput): Anomaly | null {
  // Dose is "missed" in the demo if we're past noon and the morning dose
  // hasn't been confirmed. Simple heuristic — production would use real times.
  const morningMissed = meds.find(
    (m) => /morning/i.test(m.schedule) && !m.takenAt
  );
  if (!morningMissed) return null;
  const hour = new Date().getHours();
  if (hour < 11) return null;
  return {
    id: "meds-missed-morning",
    severity: "urgent",
    title: `Morning ${morningMissed.name} not confirmed`,
    body: `Due at ${morningMissed.takeAt}. It's now past ${hour}:00. Worth a quick call.`,
    sources: ["Medication tracker"],
    action: "Remind dad",
  };
}

export function detect(input: DetectInput): Anomaly[] {
  const rules = [
    bpRule(input.connected),
    sleepRule(input.connected),
    stepsRule(input.connected),
    spamRule(input.connected),
    adherenceRule(input.connected),
    medsRule(input),
  ];
  return rules
    .filter((a): a is Anomaly => a !== null)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

/** Stable surface for telling other features (Ask, banner) what's actively wrong. */
export const SEVERITY_LABEL: Record<Severity, string> = {
  urgent: "Needs attention",
  warn: "Worth a look",
  info: "Heads-up",
};
