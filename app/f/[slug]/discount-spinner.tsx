"use client";

// One-time discount spin-wheel shown as an overlay when the offer step first
// mounts. The wheel always lands on DISCOUNT_PCT — the "discounted" prices are
// the real prices charged at checkout; the anchors shown pre-spin are the
// undiscounted display prices from OFFER_DISPLAY. Whether a visitor has spun
// is tracked in localStorage only (no server state): returning visitors skip
// the wheel and see their discount already applied.

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

export const DISCOUNT_PCT = 60;

/** How long the "reserved for you" countdown runs after claiming. */
export const DISCOUNT_TIMER_MS = 15 * 60 * 1000;

const STORAGE_KEY = "azora_spin_discount_v1";

export interface SpinDiscount {
  pct: number;
  claimedAt: number;
}

export function readSpinDiscount(): SpinDiscount | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpinDiscount;
    if (typeof parsed.pct !== "number" || typeof parsed.claimedAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSpinDiscount(): SpinDiscount {
  const discount: SpinDiscount = { pct: DISCOUNT_PCT, claimedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(discount));
  } catch {
    // Private mode / blocked storage: the discount still applies this session.
  }
  return discount;
}

// Wheel segments, clockwise from the top. The win is the DISCOUNT_PCT slice.
const SEGMENTS = [
  { label: "10%", win: false },
  { label: "30%", win: false },
  { label: `${DISCOUNT_PCT}%`, win: true },
  { label: "5%", win: false },
  { label: "25%", win: false },
  { label: "15%", win: false },
  { label: "40%", win: false },
  { label: "20%", win: false },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const WIN_INDEX = SEGMENTS.findIndex((s) => s.win);
const SPIN_DURATION_MS = 4600;

const WHEEL_SIZE = 300;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 4;

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function wedgePath(index: number): string {
  const start = index * SEGMENT_ANGLE;
  const end = start + SEGMENT_ANGLE;
  const [x1, y1] = polar(start, RADIUS);
  const [x2, y2] = polar(end, RADIUS);
  return `M ${CX} ${CY} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
}

/** Confetti for the win moment — deterministic, mirrors the result step's. */
const WIN_CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 41) % 92}%`,
  delay: `${(i * 0.06).toFixed(2)}s`,
  size: `${6 + (i % 7)}px`,
  hue: i % 3 === 0 ? 42 : 187, // gold + teal, on-brand
  drift: `${-24 + (i % 48)}px`,
}));

export function DiscountSpinnerOverlay({
  funnelSlug,
  onClaim,
}: {
  funnelSlug: string;
  onClaim: (discount: SpinDiscount) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "won">("idle");
  const [rotation, setRotation] = useState(0);
  const viewFired = useRef(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (viewFired.current) return;
    viewFired.current = true;
    posthog.capture("web_spin_viewed", { funnel_slug: funnelSlug });
  }, [funnelSlug]);

  useEffect(() => {
    return () => {
      if (spinTimer.current) clearTimeout(spinTimer.current);
    };
  }, []);

  const spin = () => {
    if (phase !== "idle") return;
    // Land the winning wedge's center under the top pointer, with a little
    // jitter inside the wedge so the stop doesn't look machine-perfect.
    const winCenter = WIN_INDEX * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.5);
    const target = 5 * 360 + (360 - winCenter) + jitter;
    setRotation(target);
    setPhase("spinning");
    spinTimer.current = setTimeout(() => {
      setPhase("won");
      posthog.capture("web_spin_won", {
        funnel_slug: funnelSlug,
        discount_pct: DISCOUNT_PCT,
      });
    }, SPIN_DURATION_MS);
  };

  const claim = () => {
    const discount = saveSpinDiscount();
    posthog.capture("web_spin_claimed", {
      funnel_slug: funnelSlug,
      discount_pct: DISCOUNT_PCT,
    });
    onClaim(discount);
  };

  return (
    <div className="spinOverlay" role="dialog" aria-modal="true" aria-label="Spin to win a discount">
      <div className="spinPanel">
        {phase === "won" ? (
          <div className="confettiContainer" aria-hidden>
            {WIN_CONFETTI.map((p) => (
              <span
                key={p.id}
                className="confettiPiece"
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  width: p.size,
                  height: p.size,
                  backgroundColor: `hsl(${p.hue}, ${p.hue === 42 ? 55 : 35}%, ${p.hue === 42 ? 60 : 45}%)`,
                  "--drift": p.drift,
                } as React.CSSProperties}
              />
            ))}
          </div>
        ) : null}

        {phase === "won" ? (
          <>
            <p className="spinKicker">You landed on</p>
            <h2 className="spinHeadline spinHeadlineWon">{DISCOUNT_PCT}% off</h2>
            <p className="spinSub">
              Your one-time discount is locked in. It&apos;s already applied to
              the plans below.
            </p>
          </>
        ) : (
          <>
            <p className="spinKicker">Before you see your plan…</p>
            <h2 className="spinHeadline">Spin for your discount</h2>
            <p className="spinSub">
              Every new member gets one spin. Whatever you land on comes off
              your plan today.
            </p>
          </>
        )}

        <div className="spinWheelWrap" aria-hidden>
          <div className="spinPointer" />
          <svg
            className="spinWheel"
            viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition:
                phase === "idle"
                  ? "none"
                  : `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.64, 0.15, 1)`,
            }}
          >
            {SEGMENTS.map((seg, i) => (
              <path
                key={seg.label + i}
                d={wedgePath(i)}
                className={
                  seg.win
                    ? "spinWedgeWin"
                    : i % 2 === 0
                      ? "spinWedgeA"
                      : "spinWedgeB"
                }
              />
            ))}
            {SEGMENTS.map((seg, i) => {
              const mid = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
              const [tx, ty] = polar(mid, RADIUS * 0.68);
              return (
                <text
                  key={`t-${seg.label}-${i}`}
                  x={tx}
                  y={ty}
                  className={
                    seg.win
                      ? "spinLabel spinLabelWin"
                      : i % 2 === 0
                        ? "spinLabel spinLabelLight"
                        : "spinLabel spinLabelDark"
                  }
                  transform={`rotate(${mid}, ${tx}, ${ty})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {seg.label}
                </text>
              );
            })}
            <circle cx={CX} cy={CY} r={26} className="spinHub" />
            <text
              x={CX}
              y={CY}
              className="spinHubText"
              textAnchor="middle"
              dominantBaseline="central"
            >
              ✦
            </text>
          </svg>
        </div>

        {phase === "won" ? (
          <button type="button" className="checkoutCta spinCta" onClick={claim}>
            Claim my {DISCOUNT_PCT}% off
          </button>
        ) : (
          <button
            type="button"
            className="checkoutCta spinCta"
            onClick={spin}
            disabled={phase === "spinning"}
          >
            {phase === "spinning" ? "Good luck…" : "Spin the wheel"}
          </button>
        )}
        <p className="spinFinePrint">One spin per visitor · applied instantly</p>
      </div>
    </div>
  );
}
