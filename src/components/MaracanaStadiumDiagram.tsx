import { useMemo } from "react";

type Quadrant = "norte" | "sul" | "leste" | "oeste";
type Ring = "inferior" | "superior";

interface Props {
  sectorName?: string;
  /** Highlight color (default: teal accent used on the BP page) */
  highlightColor?: string;
  className?: string;
}

// Detect which segments to highlight from a sector name in PT/EN/ES.
function parseSector(name: string): { quadrants: Quadrant[]; rings: Ring[] } {
  const n = (name || "").toLowerCase();
  const quadrants: Quadrant[] = [];
  const rings: Ring[] = [];

  if (/(norte|north)/.test(n)) quadrants.push("norte");
  if (/(sul|south)/.test(n)) quadrants.push("sul");
  if (/(leste|east)/.test(n)) quadrants.push("leste");
  if (/(oeste|west)/.test(n)) quadrants.push("oeste");

  if (/(inferior|lower|baja|bajo)/.test(n)) rings.push("inferior");
  if (/(superior|upper|alta|alto)/.test(n)) rings.push("superior");

  // Defaults: if no quadrant matched, highlight all (e.g. generic / premium)
  if (quadrants.length === 0) {
    quadrants.push("norte", "sul", "leste", "oeste");
  }
  // If no ring specified, highlight both rings of the matched quadrants
  if (rings.length === 0) {
    rings.push("inferior", "superior");
  }
  return { quadrants, rings };
}

// Quadrant angle ranges (degrees, screen coords: 0 = right, 90 = down)
const QUADRANT_ANGLES: Record<Quadrant, [number, number]> = {
  leste: [-45, 45],
  sul: [45, 135],
  oeste: [135, 225],
  norte: [225, 315],
};

const CX = 110;
const CY = 80;
const RX_OUT = 95;
const RY_OUT = 65;
const RX_MID = 65;
const RY_MID = 42;
const RX_IN = 38;
const RY_IN = 22;

function arcRing(rxOut: number, ryOut: number, rxIn: number, ryIn: number, a1: number, a2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const p = (a: number, rx: number, ry: number) => [CX + rx * Math.cos(toRad(a)), CY + ry * Math.sin(toRad(a))];
  const [x1, y1] = p(a1, rxOut, ryOut);
  const [x2, y2] = p(a2, rxOut, ryOut);
  const [x3, y3] = p(a2, rxIn, ryIn);
  const [x4, y4] = p(a1, rxIn, ryIn);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rxOut} ${ryOut} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rxIn} ${ryIn} 0 0 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

export function MaracanaStadiumDiagram({ sectorName = "", highlightColor = "#2A9D8F", className }: Props) {
  const { quadrants, rings } = useMemo(() => parseSector(sectorName), [sectorName]);

  const segments: { d: string; quadrant: Quadrant; ring: Ring }[] = [];
  (Object.keys(QUADRANT_ANGLES) as Quadrant[]).forEach((q) => {
    const [a1, a2] = QUADRANT_ANGLES[q];
    segments.push({ d: arcRing(RX_OUT, RY_OUT, RX_MID, RY_MID, a1, a2), quadrant: q, ring: "superior" });
    segments.push({ d: arcRing(RX_MID, RY_MID, RX_IN, RY_IN, a1, a2), quadrant: q, ring: "inferior" });
  });

  const baseFill = "rgba(255,255,255,0.04)";
  const baseStroke = "rgba(255,255,255,0.12)";
  const highlightFill = `${highlightColor}`;

  return (
    <svg
      viewBox="0 0 220 160"
      className={className}
      role="img"
      aria-label={sectorName ? `Diagrama do Maracanã com setor ${sectorName} destacado` : "Diagrama do Maracanã"}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {/* Field */}
      <ellipse cx={CX} cy={CY} rx={RX_IN - 4} ry={RY_IN - 4} fill="rgba(0,155,59,0.18)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <line x1={CX} y1={CY - (RY_IN - 4)} x2={CX} y2={CY + (RY_IN - 4)} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r="3" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />

      {segments.map((s, i) => {
        const active = quadrants.includes(s.quadrant) && rings.includes(s.ring);
        return (
          <path
            key={i}
            d={s.d}
            fill={active ? highlightFill : baseFill}
            stroke={active ? highlightColor : baseStroke}
            strokeWidth="0.8"
            opacity={active ? 0.95 : 1}
          />
        );
      })}

      {/* Compass labels */}
      <text x={CX} y="14" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" fontWeight={600}>N</text>
      <text x={CX} y="156" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" fontWeight={600}>S</text>
      <text x="8" y={CY + 3} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" fontWeight={600}>O</text>
      <text x="212" y={CY + 3} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" fontWeight={600}>L</text>
    </svg>
  );
}

export default MaracanaStadiumDiagram;