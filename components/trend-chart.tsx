import { cn } from "@/lib/utils";

/**
 * Inline SVG charts for the Trends tab. Three modes share the same axis
 * / gridline scaffolding so they feel consistent:
 *
 *   line    — two-series line chart (Avg + Peak). Used by Heart Rate.
 *   bar     — single-series bar chart. Used by Sleep.
 *   grouped — two bars per day: actual value + goal reference. Used by
 *             Activity, where the goal is a flat line of lighter bars.
 *
 * Styling knobs come from the parent via a color-variant class — the SVG
 * uses currentColor in places and named tokens in others so theme tokens
 * from tailwind.config stay the source of truth.
 */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type LineSeries = { label: string; values: number[]; dashed?: boolean };

interface LineProps {
  mode: "line";
  series: LineSeries[];
  yTicks: number[];
}

interface BarProps {
  mode: "bar";
  values: number[];
  yTicks: number[];
  /** Tailwind bg token class for the bar fill. */
  barClass: string;
}

interface GroupedProps {
  mode: "grouped";
  values: number[];
  goal: number;
  goalLabel: string;
  yTicks: number[];
  valueLabel: string;
  barClass: string;
}

type Props = (LineProps | BarProps | GroupedProps) & {
  stroke?: string;
  /** Accessible summary for screen readers. */
  ariaLabel?: string;
};

const W = 560;
const H = 200;
const PAD_T = 10;
const PAD_B = 26;
const PAD_L = 32;
const PAD_R = 12;

function plotArea() {
  return {
    x: PAD_L,
    y: PAD_T,
    w: W - PAD_L - PAD_R,
    h: H - PAD_T - PAD_B,
  };
}

function TrendAxis({ yTicks }: { yTicks: number[] }) {
  const { x, y, w, h } = plotArea();
  const min = yTicks[0];
  const max = yTicks[yTicks.length - 1];
  const span = Math.max(max - min, 1);
  return (
    <g>
      {yTicks.map((t, i) => {
        const ty = y + h - ((t - min) / span) * h;
        return (
          <g key={i}>
            <line
              x1={x}
              x2={x + w}
              y1={ty}
              y2={ty}
              stroke="#E6E9F0"
              strokeDasharray={i === 0 ? undefined : "4 4"}
              strokeWidth={1}
            />
            <text
              x={x - 8}
              y={ty + 3}
              fontSize={10}
              fill="#6B7280"
              textAnchor="end"
            >
              {t}
            </text>
          </g>
        );
      })}
      {DAYS.map((d, i) => {
        const dx = x + (w / (DAYS.length - 1)) * i;
        return (
          <text
            key={d}
            x={dx}
            y={y + h + 16}
            fontSize={10}
            fill="#6B7280"
            textAnchor="middle"
          >
            {d}
          </text>
        );
      })}
    </g>
  );
}

export function TrendChart(props: Props) {
  const { x, y, w, h } = plotArea();
  const yMin = props.yTicks[0];
  const yMax = props.yTicks[props.yTicks.length - 1];
  const ySpan = Math.max(yMax - yMin, 1);

  const xForIndex = (i: number) => x + (w / (DAYS.length - 1)) * i;
  const yForValue = (v: number) => y + h - ((v - yMin) / ySpan) * h;

  return (
    <svg
      role={props.ariaLabel ? "img" : "presentation"}
      aria-label={props.ariaLabel}
      viewBox={`0 0 ${W} ${H}`}
      className="h-[200px] w-full"
      preserveAspectRatio="none"
    >
      <TrendAxis yTicks={props.yTicks} />

      {props.mode === "line" ? (
        <g>
          {props.series.map((s, si) => {
            const points = s.values
              .map((v, i) => `${xForIndex(i).toFixed(1)},${yForValue(v).toFixed(1)}`)
              .join(" ");
            return (
              <polyline
                key={si}
                points={points}
                fill="none"
                stroke={props.stroke ?? "currentColor"}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "6 5" : undefined}
                opacity={s.dashed ? 0.75 : 1}
              />
            );
          })}
          {props.series[0].values.map((v, i) => (
            <circle
              key={i}
              cx={xForIndex(i)}
              cy={yForValue(v)}
              r={3.2}
              fill={props.stroke ?? "currentColor"}
            />
          ))}
        </g>
      ) : props.mode === "bar" ? (
        <g>
          {props.values.map((v, i) => {
            const bw = (w / DAYS.length) * 0.55;
            const bx = xForIndex(i) - bw / 2;
            const by = yForValue(v);
            const bh = y + h - by;
            return (
              <rect
                key={i}
                x={bx}
                y={by}
                width={bw}
                height={bh}
                rx={6}
                className={props.barClass}
              />
            );
          })}
        </g>
      ) : (
        <g>
          {props.values.map((v, i) => {
            const groupW = (w / DAYS.length) * 0.6;
            const bw = groupW / 2 - 2;
            const center = xForIndex(i);
            const valueX = center - bw - 1;
            const goalX = center + 1;
            const vy = yForValue(v);
            const vh = y + h - vy;
            const gy = yForValue(props.goal);
            const gh = y + h - gy;
            return (
              <g key={i}>
                <rect
                  x={valueX}
                  y={vy}
                  width={bw}
                  height={vh}
                  rx={4}
                  className={props.barClass}
                />
                <rect
                  x={goalX}
                  y={gy}
                  width={bw}
                  height={gh}
                  rx={4}
                  className={cn(props.barClass, "opacity-25")}
                />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
