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
  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label="A fingertip resting on a phone camera while Azora shows a live heart-rate reading"
    >
      <defs>
        <linearGradient id="cameraPhoneBody" x1="88" y1="16" x2="234" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef5f2" />
        </linearGradient>
        <linearGradient id="cameraScreen" x1="106" y1="42" x2="214" y2="184" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f9fbf8" />
          <stop offset="100%" stopColor="#e4efea" />
        </linearGradient>
        <radialGradient id="cameraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.5} />
          <stop offset="58%" stopColor={BRAND} stopOpacity={0.16} />
          <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="fingerTip" x1="212" y1="24" x2="276" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f6c7a8" />
          <stop offset="100%" stopColor="#d99070" />
        </linearGradient>
        <filter id="cameraSoftShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#1d2b33" floodOpacity="0.14" />
        </filter>
      </defs>

      <ellipse cx={160} cy={204} rx={82} ry={12} fill={TEXT} opacity={0.08} />

      <rect
        x={88}
        y={10}
        width={144}
        height={194}
        rx={30}
        fill="url(#cameraPhoneBody)"
        stroke={TEXT}
        strokeWidth={2.25}
        filter="url(#cameraSoftShadow)"
      />
      <rect
        x={104}
        y={34}
        width={112}
        height={150}
        rx={22}
        fill="url(#cameraScreen)"
        stroke={BRAND}
        strokeOpacity={0.14}
      />
      <rect x={139} y={20} width={42} height={5} rx={2.5} fill={TEXT} opacity={0.16} />

      <circle cx={160} cy={74} r={35} fill={BRAND_SOFT} />
      <circle className="visualPulse" cx={160} cy={74} r={24} fill={BRAND} opacity={0.18} />
      <path
        className="visualDraw"
        d="M128 77 c8 -24 15 -22 20 -6 c4 12 9 11 14 4 c6 -9 13 -8 18 2 c5 9 11 8 16 1"
        fill="none"
        stroke={BRAND}
        strokeWidth={4}
        strokeLinecap="round"
      />

      <text
        x={160}
        y={132}
        textAnchor="middle"
        fontSize={34}
        fontWeight={800}
        fill={TEXT}
      >
        72
      </text>
      <text
        x={190}
        y={129}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={SECONDARY}
      >
        BPM
      </text>
      <rect x={124} y={150} width={72} height={18} rx={9} fill="#ffffff" opacity={0.84} />
      <circle cx={137} cy={159} r={4} fill={BRAND} />
      <text
        x={147}
        y={163}
        fontSize={9}
        fontWeight={800}
        fill={BRAND}
      >
        LIVE
      </text>

      <circle cx={230} cy={54} r={48} fill="url(#cameraGlow)" />
      <rect x={196} y={18} width={68} height={70} rx={30} fill="url(#fingerTip)" />
      <path
        d="M210 78 c14 10 37 10 52 -2"
        fill="none"
        stroke="#a6604b"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.22}
      />
      <circle cx={230} cy={64} r={17} fill="#1d2b33" opacity={0.12} />
      <circle cx={230} cy={64} r={9} fill={BRAND} opacity={0.55} />
      <circle cx={230} cy={64} r={4} fill="#ffffff" opacity={0.85} />
    </svg>
  );
}

/**
 * Projected stress trend on the personalized plan card: a high, jagged
 * "today" level easing down to a calm low at the 2-week mark. Exported so the
 * summary plan card can embed it directly, not only via an info step.
 */
export function StressProjection({
  title = "Your stress response",
  endLabel = "Calm",
  targetDateLabel = "2 weeks",
  planLabel = "Azora plan",
  comparisonLabel = "Unguided",
  startLabel = "Today",
  endTimeLabel,
  caption = ["Your personalized plan helps", "keep progress going."],
}: {
  /** Large chart title inside the card. */
  title?: string;
  /** Outcome the curve lands on, named for the user's goal (e.g. "Rested"). */
  endLabel?: string;
  /** Right-axis time label, e.g. "by Jun 24". */
  targetDateLabel?: string;
  /** Label attached to the lower plan curve. */
  planLabel?: string;
  /** Label attached to the rebound/comparison curve. */
  comparisonLabel?: string;
  /** Left-axis time label. */
  startLabel?: string;
  /** Optional right-axis time label override. */
  endTimeLabel?: string;
  /** Claim-safe caption below the graph. */
  caption?: string[];
} = {}) {
  const finalTimeLabel = endTimeLabel ?? targetDateLabel;
  const captionLines = caption.slice(0, 2);

  return (
    <svg
      viewBox="0 0 360 360"
      role="img"
      aria-label={`${title}: ${planLabel} trends toward ${endLabel}, while ${comparisonLabel} rebounds`}
    >
      <defs>
        <linearGradient id="projectionPlanFill" x1="50" y1="0" x2="302" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={TEXT} stopOpacity={0.14} />
          <stop offset="70%" stopColor={TEXT} stopOpacity={0.05} />
          <stop offset="100%" stopColor={TEXT} stopOpacity={0} />
        </linearGradient>
        <clipPath id="projectionPlotClip">
          <rect x={50} y={92} width={252} height={116} />
        </clipPath>
      </defs>

      <rect
        x={12}
        y={10}
        width={336}
        height={334}
        rx={28}
        fill="#f7f7f6"
      />

      <text x={42} y={62} fontSize={23} fontWeight={800} fill={TEXT}>
        {title}
      </text>

      <line x1={50} y1={94} x2={302} y2={94} stroke="#d2d2cf" strokeWidth={1.4} strokeDasharray="3 5" />
      <line x1={50} y1={146} x2={302} y2={146} stroke="#d2d2cf" strokeWidth={1.4} strokeDasharray="3 5" />
      <line x1={50} y1={207} x2={302} y2={207} stroke={TEXT} strokeWidth={1.6} />

      <path
        d="M50 94 C84 94 113 95 140 115 S174 166 204 137 S248 72 302 58"
        fill="none"
        stroke="#d67370"
        strokeWidth={3.8}
        strokeLinecap="round"
      />

      <g clipPath="url(#projectionPlotClip)">
        <path
          d="M50 94 C100 92 145 94 178 125 S228 198 302 207 L50 207 Z"
          fill="url(#projectionPlanFill)"
        />
      </g>
      <path
        className="visualDraw"
        d="M50 94 C100 92 145 94 178 125 S228 198 302 207"
        fill="none"
        stroke={TEXT}
        strokeWidth={4.1}
        strokeLinecap="round"
      />

      <circle cx={50} cy={94} r={7.5} fill="#f7f7f6" stroke={TEXT} strokeWidth={3.8} />
      <circle cx={302} cy={207} r={7.5} fill="#f7f7f6" stroke={TEXT} strokeWidth={3.8} />

      <rect x={50} y={186} width={88} height={22} rx={11} fill="#ffffff" opacity={0.9} />
      <circle cx={62} cy={197} r={6} fill={TEXT} />
      <text x={74} y={201} fontSize={10.5} fontWeight={800} fill={TEXT}>
        {planLabel}
      </text>

      <text x={214} y={116} fontSize={12.5} fontWeight={800} fill={TEXT}>
        {comparisonLabel}
      </text>

      <text x={50} y={235} fontSize={15.5} fontWeight={800} fill={TEXT}>
        {startLabel}
      </text>
      <text x={302} y={235} textAnchor="end" fontSize={15.5} fontWeight={800} fill={TEXT}>
        {finalTimeLabel}
      </text>

      <text x={302} y={190} textAnchor="end" fontSize={12} fontWeight={800} fill={BRAND}>
        {endLabel}
      </text>

      {captionLines.map((line, index) => (
        <text
          key={line}
          x={180}
          y={286 + index * 22}
          textAnchor="middle"
          fontSize={16}
          fontWeight={800}
          fill={SECONDARY}
        >
          {line}
        </text>
      ))}
    </svg>
  );
}

/**
 * A breathing curve that starts shallow and tight on the left (anxiety reaching
 * the breath) and smoothly opens into deep, steady waves on the right (the
 * breath is intact and trainable, not broken). Props let a step retune the
 * labels, palette, and how dramatic the shallow→deep shift reads. Exported so
 * other surfaces can embed it, mirroring StressProjection.
 */
export function BreathWave({
  startLabel = "Shallow now",
  endLabel = "Deep & steady",
  stroke = BRAND,
  shallowAmplitude = 5,
  deepAmplitude = 26,
  shallowPeriod = 22,
  deepPeriod = 78,
}: {
  /** Caption under the tight left side. */
  startLabel?: string;
  /** Caption under the open right side. */
  endLabel?: string;
  /** Wave + accent color. */
  stroke?: string;
  /** Wave height at the left (anxious) edge, in px. */
  shallowAmplitude?: number;
  /** Wave height at the right (trained) edge, in px. */
  deepAmplitude?: number;
  /** Wave spacing at the left edge, in px (smaller = faster/tighter). */
  shallowPeriod?: number;
  /** Wave spacing at the right edge, in px (larger = slower/calmer). */
  deepPeriod?: number;
} = {}) {
  // Sample y(x) densely, accumulating phase so frequency can drift smoothly
  // from tight (left) to slow (right) while amplitude grows. At ~3px spacing
  // the polyline reads as a smooth curve without bezier bookkeeping.
  const x0 = 12;
  const x1 = 308;
  const baseline = 66;
  const points: Array<[number, number]> = [];
  let phase = 0;
  let prevX = x0;
  for (let x = x0; x <= x1; x += 3) {
    const t = (x - x0) / (x1 - x0);
    const period = shallowPeriod + t * (deepPeriod - shallowPeriod);
    const amplitude = shallowAmplitude + t * (deepAmplitude - shallowAmplitude);
    phase += ((x - prevX) / period) * 2 * Math.PI;
    prevX = x;
    points.push([x, baseline - amplitude * Math.sin(phase)]);
  }
  const round = (n: number) => Math.round(n * 10) / 10;
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
    .join(" ");
  const [crestX, crestY] = points[points.length - 1];

  return (
    <svg
      viewBox="0 0 320 132"
      role="img"
      aria-label="A breathing wave starting shallow and tight, then opening into deep, steady breaths"
    >
      <defs>
        <linearGradient id="breathWaveFade" x1="0" y1="0" x2="320" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={1} />
        </linearGradient>
      </defs>
      <path
        className="visualDraw"
        d={line}
        fill="none"
        stroke="url(#breathWaveFade)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        className="visualPulse"
        cx={round(crestX)}
        cy={round(crestY)}
        r={5}
        fill={stroke}
        opacity={0.5}
      />
      <circle cx={round(crestX)} cy={round(crestY)} r={4} fill={stroke} />
      <text x={x0} y={120} fontSize={11} fontWeight={600} fill={MUTED}>
        {startLabel}
      </text>
      <text
        x={x1}
        y={120}
        textAnchor="end"
        fontSize={11}
        fontWeight={700}
        fill={stroke}
      >
        {endLabel}
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
  breath_wave: BreathWave,
};

export function InfoStepVisual({ visual }: { visual: InfoVisualKey }) {
  const Visual = VISUALS[visual];
  return (
    <div className="funnelVisual">
      <Visual />
    </div>
  );
}
