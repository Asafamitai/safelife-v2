/**
 * Mock 7-day timeseries per connected provider. In production this is
 * populated by the data-sync workers; here we hardcode realistic shapes
 * so the analysis layer has something to detect anomalies in.
 *
 * Convention: arrays are oldest → newest, length 7. Latest reading =
 * `series[series.length - 1]`. Index 0 is "6 days ago".
 */

export interface BPReading {
  systolic: number;
  diastolic: number;
}

export interface ProviderSeries {
  /** Apple Health / Fitbit. Daily steps. */
  steps?: number[];
  /** Withings + Apple. Daily resting HR (bpm). */
  restingHr?: number[];
  /** Withings. Daily morning BP. */
  bp?: BPReading[];
  /** Oura. Nightly sleep score 0-100. */
  sleepScore?: number[];
  /** Verizon / T-Mobile. Daily spam-call count. */
  spamCalls?: number[];
  /** Pillsy / AdhereTech. Daily measured adherence %, 0-100. */
  adherencePct?: number[];
}

/**
 * Per-provider series. Keys match `IntegrationProvider.id`. Only providers
 * that emit a numeric stream we can analyze are listed.
 */
export const TIMESERIES: Record<string, ProviderSeries> = {
  withings: {
    bp: [
      { systolic: 124, diastolic: 78 },
      { systolic: 126, diastolic: 80 },
      { systolic: 128, diastolic: 80 },
      { systolic: 130, diastolic: 82 },
      { systolic: 134, diastolic: 84 },
      { systolic: 138, diastolic: 86 },
      // Latest reading is high enough to trip the anomaly rule.
      { systolic: 146, diastolic: 92 },
    ],
    restingHr: [66, 67, 68, 67, 69, 70, 72],
  },
  "apple-health": {
    steps: [4800, 5100, 4600, 5300, 4900, 4700, 4210],
    restingHr: [67, 68, 68, 67, 69, 70, 71],
  },
  fitbit: {
    steps: [3900, 4100, 4400, 4200, 4000, 3800, 3700],
  },
  oura: {
    sleepScore: [82, 80, 79, 78, 76, 73, 68],
  },
  verizon: {
    // Spam calls trending up dramatically — flag candidate.
    spamCalls: [2, 3, 2, 4, 6, 11, 23],
  },
  tmobile: {
    spamCalls: [1, 2, 1, 3, 4, 8, 15],
  },
  // Consumer smart bottle — declining trend so the anomaly detector has
  // something concrete to flag for the demo.
  pillsy: {
    adherencePct: [95, 92, 86, 90, 86, 79, 71],
  },
  // Clinical-grade bottle — stable trend. Shown as a foil to Pillsy.
  adheretech: {
    adherencePct: [98, 96, 94, 95, 92, 90, 92],
  },
};

export function latest<T>(series: T[] | undefined): T | undefined {
  return series && series.length > 0 ? series[series.length - 1] : undefined;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Percent delta of latest vs the average of the rest. Positive = up. */
export function deltaVsBaseline(values: number[]): number {
  if (values.length < 2) return 0;
  const last = values[values.length - 1];
  const baseline = average(values.slice(0, -1));
  if (baseline === 0) return 0;
  return ((last - baseline) / baseline) * 100;
}
