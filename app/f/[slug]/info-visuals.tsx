// Inline SVG diagrams for funnel info screens, keyed by InfoVisualKey.
// Colors mirror the :root palette in globals.css (brand #3e6f77,
// accent #c9a36a, muted #92a0a4, text #1d2b33) — SVG presentation
// attributes can't use var(), so the hex values are repeated here.
// Animation classes (.visualDraw, .visualPulse, .visualRingFill,
// .visualDash) are defined in globals.css with reduced-motion fallbacks.

import type { InfoVisualKey } from "@/lib/funnels/types";

const BRAND = "#3e6f77";
const ACCENT = "#c9a36a";
const MUTED = "#92a0a4";
const SECONDARY = "#5d6c72";
const TEXT = "#1d2b33";
const BRAND_SOFT = "rgba(62, 111, 119, 0.1)";

/** Day-streak tiles fading out: ticks on days 1–3, day 4 abandoned. */
function FadingStreak() {
  const tiles = [
    { x: 8, day: "Day 1", opacity: 1 },
    { x: 88, day: "Day 2", opacity: 0.7 },
    { x: 168, day: "Day 3", opacity: 0.4 },
  ];
  return (
    <svg
      viewBox="0 0 320 100"
      role="img"
      aria-label="A meditation streak fading: days one through three checked with decreasing confidence, day four abandoned"
    >
      {tiles.map((t) => (
        <g key={t.day} opacity={t.opacity}>
          <rect
            x={t.x}
            y={8}
            width={64}
            height={64}
            rx={14}
            fill="#fff"
            stroke={BRAND}
            strokeWidth={1.5}
          />
          <path
            d={`M${t.x + 20} 40 l8 9 l16 -18`}
            fill="none"
            stroke={BRAND}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x={t.x + 32}
            y={92}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={SECONDARY}
          >
            {t.day}
          </text>
        </g>
      ))}
      <rect
        x={248}
        y={8}
        width={64}
        height={64}
        rx={14}
        fill="none"
        stroke={MUTED}
        strokeWidth={1.5}
        strokeDasharray="5 5"
      />
      <text
        x={280}
        y={48}
        textAnchor="middle"
        fontSize={24}
        fontWeight={700}
        fill={MUTED}
      >
        ?
      </text>
      <text
        x={280}
        y={92}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={MUTED}
      >
        Day 4
      </text>
    </svg>
  );
}

/** Open loop (broken, no feedback) vs closed loop (heart feedback). */
function OpenVsClosedLoop() {
  return (
    <svg
      viewBox="0 0 320 128"
      role="img"
      aria-label="Diagram comparing an open loop with no feedback to a closed feedback loop with heart data"
    >
      {/* Open loop: arc with a gap, question mark inside */}
      <path
        d="M 104 38 A 34 34 0 1 0 104 74"
        fill="none"
        stroke={MUTED}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="2 7"
      />
      <polygon points="104,30 116,38 102,46" fill={MUTED} />
      <text
        x={80}
        y={66}
        textAnchor="middle"
        fontSize={28}
        fontWeight={700}
        fill={MUTED}
      >
        ?
      </text>
      <text
        x={80}
        y={120}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={SECONDARY}
      >
        Guesswork
      </text>

      {/* Closed loop: full circle with marching dashes + heart */}
      <circle
        className="visualDash"
        cx={240}
        cy={56}
        r={34}
        fill={BRAND_SOFT}
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="5 7"
      />
      <polygon points="240,16 252,24 238,32" fill={BRAND} />
      <path
        d="M240 68 c-9 -7 -14 -12 -14 -18 c0 -8 11 -10 14 -3 c3 -7 14 -5 14 3 c0 6 -5 11 -14 18 z"
        fill={BRAND}
      />
      <text
        x={240}
        y={120}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={BRAND}
      >
        Live feedback
      </text>
    </svg>
  );
}

/** ECG vs PPG waveforms tracking each other, with a ±2% badge. */
function PpgVsEcg() {
  // Identical pulse shape for both traces — the point of the diagram is
  // that the two readings overlap almost perfectly (within 2%).
  const beat = "c14 -34 26 -30 34 -12 c6 12 14 10 22 12 c10 2 22 0 34 0";
  return (
    <svg
      viewBox="0 0 320 132"
      role="img"
      aria-label="Chart of the Azora PPG pulse wave overlapping a medical ECG trace almost exactly, within two percent"
    >
      {/* ECG trace (medical reference) */}
      <path
        d={`M8 76 ${beat} ${beat} ${beat}`}
        fill="none"
        stroke={MUTED}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* PPG trace (Azora) — same shape, 3px offset: visibly overlapping */}
      <path
        className="visualDraw"
        d={`M8 79 ${beat} ${beat} ${beat}`}
        fill="none"
        stroke={BRAND}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* ±2% badge */}
      <rect x={250} y={6} width={60} height={26} rx={13} fill={ACCENT} />
      <text
        x={280}
        y={24}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="#fff"
      >
        ±2%
      </text>
      {/* Legend */}
      <line x1={62} y1={124} x2={80} y2={124} stroke={MUTED} strokeWidth={2} />
      <text x={86} y={128} fontSize={11} fontWeight={600} fill={SECONDARY}>
        Medical ECG
      </text>
      <line
        x1={178}
        y1={124}
        x2={196}
        y2={124}
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text x={202} y={128} fontSize={11} fontWeight={600} fill={BRAND}>
        Azora PPG
      </text>
    </svg>
  );
}

/** Heart rate falling live: descending line, 78 → 62 bpm. */
function HrFalling() {
  return (
    <svg
      viewBox="0 0 320 132"
      role="img"
      aria-label="Live heart rate chart falling from 78 to 62 beats per minute during a breathing session"
    >
      <defs>
        <linearGradient id="hrFallFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity={0.18} />
          <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d="M16 36 C40 48 56 34 76 44 S116 68 136 64 S176 90 196 84 S240 106 260 98 S288 100 300 100 L300 128 L16 128 Z"
        fill="url(#hrFallFill)"
      />
      <path
        className="visualDraw"
        d="M16 36 C40 48 56 34 76 44 S116 68 136 64 S176 90 196 84 S240 106 260 98 S288 100 300 100"
        fill="none"
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text x={16} y={22} fontSize={13} fontWeight={700} fill={MUTED}>
        78 bpm
      </text>
      <circle
        className="visualPulse"
        cx={300}
        cy={100}
        r={5}
        fill={BRAND}
        opacity={0.5}
      />
      <circle cx={300} cy={100} r={5} fill={BRAND} />
      <text
        x={300}
        y={82}
        textAnchor="end"
        fontSize={15}
        fontWeight={800}
        fill={BRAND}
      >
        62 bpm
      </text>
    </svg>
  );
}

/** 94% stat ring with a 2-week label. */
function StatRing() {
  // r=48 → circumference ≈ 301.6; 94% leaves ≈ 18.1 undrawn.
  const circumference = 2 * Math.PI * 48;
  return (
    <svg
      viewBox="0 0 320 152"
      role="img"
      aria-label="Ring chart showing 94 percent of members report lower stress within two weeks"
    >
      <circle
        cx={160}
        cy={66}
        r={48}
        fill="none"
        stroke="rgba(0, 0, 0, 0.08)"
        strokeWidth={10}
      />
      <circle
        className="visualRingFill"
        cx={160}
        cy={66}
        r={48}
        fill="none"
        stroke={BRAND}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        transform="rotate(-90 160 66)"
      />
      <text
        x={160}
        y={66}
        textAnchor="middle"
        fontSize={28}
        fontWeight={800}
        fill={TEXT}
      >
        94%
      </text>
      <text
        x={160}
        y={86}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill={SECONDARY}
      >
        lower stress
      </text>
      <text
        x={160}
        y={146}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={SECONDARY}
      >
        within 2 weeks of daily use
      </text>
    </svg>
  );
}

/** A beating heart writing a fast, jagged trace — stress as a signature. */
function StressSignature() {
  // One fast, slightly elevated beat (~32px period), repeated across the line.
  const beat = "h5 l3 -6 3 6 l3 3 3 -26 3 30 3 -7 h6";
  return (
    <svg
      viewBox="0 0 320 124"
      role="img"
      aria-label="A heart writing a fast, jagged heart-rate trace labeled high alert"
    >
      <path
        className="visualHeartbeat"
        d="M40 78 c-11 -8 -17 -14 -17 -22 c0 -10 13 -12 17 -4 c4 -8 17 -6 17 4 c0 8 -6 14 -17 22 z"
        fill="#f87171"
      />
      <path
        className="visualDraw"
        d={`M68 64 ${beat} ${beat} ${beat} ${beat} ${beat} ${beat} ${beat}`}
        fill="none"
        stroke="#f87171"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x={228}
        y={10}
        width={82}
        height={24}
        rx={12}
        fill="rgba(248, 113, 113, 0.14)"
      />
      <text
        x={269}
        y={26}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#d05757"
      >
        High alert
      </text>
      <text
        x={188}
        y={112}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={SECONDARY}
      >
        fast, shallow rhythm — your body bracing
      </text>
    </svg>
  );
}

/** Live PPG heart-rate reading displayed inside a phone frame. */
function CameraPpg() {
  // Smooth PPG pulse beats sized to span the phone screen (~44px period).
  const beat = "c6 -20 11 -18 15 -6 c3 8 7 7 11 8 c7 1 12 0 18 -2";
  return (
    <svg
      viewBox="0 0 320 156"
      role="img"
      aria-label="A phone showing a live PPG heart-rate reading of 72 beats per minute"
    >
      {/* Phone frame */}
      <rect
        x={102}
        y={6}
        width={116}
        height={144}
        rx={20}
        fill="#fff"
        stroke={TEXT}
        strokeWidth={2.5}
      />
      {/* Notch */}
      <rect x={140} y={14} width={40} height={6} rx={3} fill={TEXT} opacity={0.18} />
      {/* Live reading */}
      <text
        x={160}
        y={62}
        textAnchor="middle"
        fontSize={30}
        fontWeight={800}
        fill={TEXT}
      >
        72
      </text>
      <text
        x={160}
        y={78}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        letterSpacing={1}
        fill={SECONDARY}
      >
        BPM
      </text>
      {/* PPG wave across the screen */}
      <path
        className="visualDraw"
        d={`M114 116 ${beat} ${beat}`}
        fill="none"
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Live pulse dot at the wave's end */}
      <circle className="visualPulse" cx={202} cy={116} r={4.5} fill={BRAND} opacity={0.5} />
      <circle cx={202} cy={116} r={4.5} fill={BRAND} />
      {/* LIVE chip */}
      <rect x={134} y={130} width={52} height={14} rx={7} fill={BRAND_SOFT} />
      <text
        x={160}
        y={140}
        textAnchor="middle"
        fontSize={9}
        fontWeight={800}
        letterSpacing={1}
        fill={BRAND}
      >
        LIVE
      </text>
    </svg>
  );
}

/**
 * Projected stress trend on the personalized plan card: a high, jagged
 * "today" level easing down to a calm low at the 2-week mark. Exported so the
 * summary plan card can embed it directly, not only via an info step.
 */
export function StressProjection() {
  return (
    <svg
      viewBox="0 0 320 132"
      role="img"
      aria-label="Projected stress level trending down from high today to low within two weeks of daily use"
    >
      <defs>
        <linearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity={0.16} />
          <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Jagged early section settling into a smooth low tail. */}
      <path
        d="M16 30 l10 14 l10 -18 l10 22 l10 -10 C90 50 118 78 150 86 S214 104 260 104 S294 106 304 106 L304 128 L16 128 Z"
        fill="url(#projFill)"
      />
      <path
        className="visualDraw"
        d="M16 30 l10 14 l10 -18 l10 22 l10 -10 C90 50 118 78 150 86 S214 104 260 104 S294 106 304 106"
        fill="none"
        stroke={BRAND}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x={16} y={20} fontSize={11} fontWeight={700} fill="#d05757">
        High alert
      </text>
      <text x={16} y={122} fontSize={11} fontWeight={600} fill={SECONDARY}>
        Today
      </text>
      <circle className="visualPulse" cx={304} cy={106} r={5} fill={BRAND} opacity={0.5} />
      <circle cx={304} cy={106} r={5} fill={BRAND} />
      <text x={304} y={90} textAnchor="end" fontSize={12} fontWeight={800} fill={BRAND}>
        Calm
      </text>
      <text x={304} y={122} textAnchor="end" fontSize={11} fontWeight={600} fill={SECONDARY}>
        2 weeks
      </text>
    </svg>
  );
}

const VISUALS: Record<InfoVisualKey, () => React.JSX.Element> = {
  fading_streak: FadingStreak,
  open_vs_closed_loop: OpenVsClosedLoop,
  ppg_vs_ecg: PpgVsEcg,
  hr_falling: HrFalling,
  stat_ring: StatRing,
  stress_signature: StressSignature,
  camera_ppg: CameraPpg,
  stress_projection: StressProjection,
};

export function InfoStepVisual({ visual }: { visual: InfoVisualKey }) {
  const Visual = VISUALS[visual];
  return (
    <div className="funnelVisual">
      <Visual />
    </div>
  );
}
