import { cn } from "@/lib/utils";

interface Props {
  values: number[];
  width?: number;
  height?: number;
  /** Tailwind text color class — drives the stroke via currentColor. */
  className?: string;
  /** Optional accessible label for screen readers. */
  ariaLabel?: string;
}

/**
 * Tiny inline SVG sparkline. Self-scales to min/max of `values`.
 * Stroke uses `currentColor` so colour comes from a parent text-* class.
 */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  className,
  ariaLabel,
}: Props) {
  if (values.length < 2) {
    return (
      <div
        aria-hidden
        style={{ width, height }}
        className="rounded bg-line/40"
      />
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const lastX = (values.length - 1) * stepX;
  const lastY = height - ((values[values.length - 1] - min) / span) * height;

  return (
    <svg
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="currentColor" />
    </svg>
  );
}
