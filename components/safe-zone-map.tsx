/**
 * Decorative map used on the Safe Zones page and inside the Add Zone
 * flow. No real map tiles — an SVG rendering of streets + parks + a few
 * zone pins so the page has something to anchor on. A later pass swaps
 * this for Mapbox / Google Maps once the geometry layer is real.
 */

interface Props {
  /** Optional pin position to draw (Add Zone preview). */
  pin?: { x: number; y: number; icon: string };
  /** Pre-placed zone markers. */
  zones?: { id: string; x: number; y: number; icon: string; active: boolean }[];
  /** Extra Tailwind classes on the outer container. */
  className?: string;
}

export function SafeZoneMap({ pin, zones, className }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-[#EFEEE6] ${className ?? ""}`}
      aria-hidden
    >
      <svg viewBox="0 0 400 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {/* Base */}
        <rect width={400} height={240} fill="#EFEEE6" />

        {/* Parks — blotchy green patches */}
        <ellipse cx={60} cy={60} rx={55} ry={40} fill="#CDE5C6" />
        <ellipse cx={320} cy={40} rx={40} ry={30} fill="#CDE5C6" opacity={0.7} />
        <ellipse cx={280} cy={200} rx={60} ry={36} fill="#CDE5C6" opacity={0.6} />

        {/* Water — top-left corner */}
        <path d="M0 0 L70 0 L60 50 L30 90 L0 80 Z" fill="#B8D9E8" opacity={0.7} />

        {/* Streets — a grid with slight variation */}
        <g stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round">
          <line x1={0} y1={50} x2={400} y2={48} />
          <line x1={0} y1={110} x2={400} y2={112} />
          <line x1={0} y1={170} x2={400} y2={168} />
        </g>
        <g stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round">
          <line x1={50} y1={0} x2={52} y2={240} />
          <line x1={150} y1={0} x2={148} y2={240} />
          <line x1={250} y1={0} x2={252} y2={240} />
          <line x1={350} y1={0} x2={348} y2={240} />
        </g>

        {/* Thinner alleys */}
        <g stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.6}>
          <line x1={0} y1={30} x2={400} y2={32} />
          <line x1={0} y1={80} x2={400} y2={82} />
          <line x1={0} y1={140} x2={400} y2={142} />
          <line x1={0} y1={200} x2={400} y2={202} />
          <line x1={100} y1={0} x2={102} y2={240} />
          <line x1={200} y1={0} x2={198} y2={240} />
          <line x1={300} y1={0} x2={302} y2={240} />
        </g>

        {/* Building blocks — subtle shadows */}
        <g fill="#D9D4C2" opacity={0.55}>
          <rect x={55} y={115} width={42} height={22} rx={2} />
          <rect x={105} y={85} width={40} height={20} rx={2} />
          <rect x={155} y={115} width={42} height={22} rx={2} />
          <rect x={205} y={85} width={40} height={20} rx={2} />
          <rect x={255} y={115} width={42} height={22} rx={2} />
          <rect x={305} y={55} width={40} height={20} rx={2} />
          <rect x={55} y={175} width={42} height={22} rx={2} />
          <rect x={155} y={175} width={42} height={22} rx={2} />
          <rect x={205} y={145} width={40} height={20} rx={2} />
        </g>

        {/* Zone pins */}
        {zones?.map((z) => (
          <g key={z.id} transform={`translate(${z.x} ${z.y})`}>
            <circle
              r={28}
              fill={z.active ? "#1357D3" : "#9CA3AF"}
              opacity={0.14}
            />
            <circle
              r={14}
              fill="#FFFFFF"
              stroke={z.active ? "#1357D3" : "#9CA3AF"}
              strokeWidth={2}
            />
            <text
              y={5}
              textAnchor="middle"
              fontSize={14}
            >
              {z.icon}
            </text>
          </g>
        ))}

        {/* Draggable pin preview */}
        {pin ? (
          <g transform={`translate(${pin.x} ${pin.y})`}>
            <circle r={30} fill="#0A0A0F" opacity={0.08} />
            <circle r={18} fill="#0A0A0F" />
            <text y={6} textAnchor="middle" fontSize={16}>
              {pin.icon}
            </text>
          </g>
        ) : null}
      </svg>

      {/* Corner label to feel like a real map */}
      <div className="pointer-events-none absolute right-2 top-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-2/70">
        New York University
      </div>
    </div>
  );
}
