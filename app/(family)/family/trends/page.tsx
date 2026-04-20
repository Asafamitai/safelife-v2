"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { TrendChart } from "@/components/trend-chart";
import { cn } from "@/lib/utils";

/**
 * Family-side Health Trends tab. Three synthetic 7-day series — heart
 * rate, sleep, activity — plus a weekly highlights summary. The tabs
 * switch the chart below; top summary row stays fixed so caregivers
 * always see the week in one glance.
 *
 * Real data: sourced later from Apple Health / Oura / Withings via the
 * integrations framework. These numbers are seeded for the demo and
 * intentionally include one "peak" day (Tue heart rate, Sat steps) so
 * the highlights section has something concrete to call out.
 */

type Metric = "hr" | "sleep" | "activity";

interface MetricMeta {
  id: Metric;
  label: string;
  emoji: string;
  summary: string;
  activeClass: string; // bg + ink when selected
  tintClass: string; // soft bg for icon badge
  inkClass: string; // value/text color in summary row
}

const METRICS: MetricMeta[] = [
  {
    id: "hr",
    label: "Heart Rate",
    emoji: "❤️",
    summary: "Avg HR 72 BPM",
    activeClass: "bg-scam-ink text-white",
    tintClass: "bg-scam-bg text-scam-ink",
    inkClass: "text-scam-ink",
  },
  {
    id: "sleep",
    label: "Sleep",
    emoji: "🌙",
    summary: "7.0h sleep avg",
    activeClass: "bg-family-ink text-white",
    tintClass: "bg-family-bg text-family-ink",
    inkClass: "text-family-ink",
  },
  {
    id: "activity",
    label: "Activity",
    emoji: "🏃",
    summary: "5.3k steps/day",
    activeClass: "bg-accent text-white",
    tintClass: "bg-chip-blue text-accent",
    inkClass: "text-accent",
  },
];

// Mon → Sun, 7 values each.
const HR_AVG = [70, 72, 69, 71, 70, 68, 72];
const HR_PEAK = [102, 112, 98, 104, 96, 90, 99];
const SLEEP_H = [6.4, 7.2, 5.8, 8.1, 6.8, 8.5, 7.0];
const STEPS = [5100, 4200, 6100, 3900, 5400, 7200, 5000];
const STEPS_GOAL = 5000;

const HIGHLIGHTS = [
  {
    emoji: "❤️",
    tint: "bg-scam-bg",
    title: "Peak HR 112 BPM on Tuesday",
    body: "Returned to normal within 10 min",
    chip: "Monitored",
    chipInk: "text-ride-ink",
  },
  {
    emoji: "🌙",
    tint: "bg-family-bg",
    title: "Best sleep Saturday · 8.5h",
    body: "Quality score 90 / 100",
    chip: "Great",
    chipInk: "text-ok-ink",
  },
  {
    emoji: "🏃",
    tint: "bg-chip-blue",
    title: "Goal hit 4 out of 7 days",
    body: "5,000 step target",
    chip: "On track",
    chipInk: "text-accent",
  },
];

export default function FamilyTrendsPage() {
  const [metric, setMetric] = useState<Metric>("hr");
  const current = METRICS.find((m) => m.id === metric)!;

  return (
    <>
      <AppHeader subtitle="Last 7 days" title="Health Trends" />

      <section
        aria-label="This week's averages"
        className="px-4 pt-1"
      >
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {METRICS.map((m) => (
            <div key={m.id} className={cn("text-[13px] font-semibold", m.inkClass)}>
              {m.summary}
            </div>
          ))}
        </div>
      </section>

      <section
        aria-label="Switch metric"
        className="grid grid-cols-3 gap-2 px-4 pt-4"
      >
        {METRICS.map((m) => {
          const active = m.id === metric;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border px-2 py-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? cn("border-transparent", m.activeClass)
                  : "border-line bg-white text-ink-2 hover:bg-panel"
              )}
            >
              <span aria-hidden className="text-[22px]">
                {m.emoji}
              </span>
              <span className="text-[13px] font-bold">{m.label}</span>
            </button>
          );
        })}
      </section>

      <section className="px-4 pt-4" aria-label={`${current.label} chart`}>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
                {current.label}
              </h2>
              <div className="text-[13px] text-muted">Mon – Sun · this week</div>
            </div>
            <span
              aria-hidden
              className={cn(
                "grid h-10 w-10 place-items-center rounded-2xl text-[18px]",
                current.tintClass
              )}
            >
              {current.emoji}
            </span>
          </div>

          <div className="mt-3 text-scam-ink">
            {metric === "hr" ? (
              <TrendChart
                mode="line"
                stroke="#B42318"
                yTicks={[50, 70, 90, 120]}
                ariaLabel={`Heart rate averages and peaks for each day of the week`}
                series={[
                  { label: "Avg", values: HR_AVG },
                  { label: "Peak", values: HR_PEAK, dashed: true },
                ]}
              />
            ) : metric === "sleep" ? (
              <TrendChart
                mode="bar"
                yTicks={[0, 3, 6, 10]}
                barClass="fill-family-ink"
                ariaLabel={`Hours of sleep per day this week`}
                values={SLEEP_H}
              />
            ) : (
              <TrendChart
                mode="grouped"
                yTicks={[0, 2000, 4000, 6000, 8000]}
                barClass="fill-accent"
                valueLabel="Steps"
                goalLabel="Goal (5k)"
                goal={STEPS_GOAL}
                ariaLabel={`Steps per day versus daily goal this week`}
                values={STEPS}
              />
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted">
            {metric === "hr" ? (
              <>
                <LegendSwatch label="Avg" color="#B42318" />
                <LegendSwatch label="Peak" color="#B42318" dashed />
              </>
            ) : metric === "activity" ? (
              <>
                <LegendSwatch label="Steps" colorClass="bg-accent" />
                <LegendSwatch
                  label="Goal (5k)"
                  colorClass="bg-accent opacity-25"
                />
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section
        aria-label="Weekly highlights"
        className="px-4 pb-6 pt-4"
      >
        <div className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-[16px] font-extrabold tracking-tight text-ink">
            Weekly highlights
          </h2>
          <ul className="mt-3 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h.title}
                className="flex items-start gap-3"
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-[18px]",
                    h.tint
                  )}
                >
                  {h.emoji}
                </span>
                <div className="flex-1">
                  <div className="text-[15px] font-extrabold leading-tight text-ink">
                    {h.title}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">{h.body}</div>
                </div>
                <span
                  className={cn(
                    "text-[13px] font-bold",
                    h.chipInk
                  )}
                >
                  {h.chip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function LegendSwatch({
  label,
  color,
  colorClass,
  dashed,
}: {
  label: string;
  color?: string;
  colorClass?: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {dashed ? (
        <span
          aria-hidden
          className="inline-block h-0 w-5 border-t-2 border-dashed"
          style={{ borderColor: color }}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "inline-block h-2 w-4 rounded-sm",
            colorClass
          )}
          style={colorClass ? undefined : { backgroundColor: color }}
        />
      )}
      {label}
    </span>
  );
}
