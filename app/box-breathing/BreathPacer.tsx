"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { getStoredAttribution } from "@/lib/client-attribution";

// Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4.
// Each phase is one side of the square: the dot climbs the left side as you
// inhale, crosses the top while you hold, descends the right as you exhale,
// and returns along the bottom for the second hold.
const phases = [
  { label: "Breathe in", short: "Inhale", side: "left" },
  { label: "Hold", short: "Hold", side: "top" },
  { label: "Breathe out", short: "Exhale", side: "right" },
  { label: "Hold", short: "Hold", side: "bottom" },
] as const;

const PHASE_SECONDS = 4;
const CYCLE_SECONDS = phases.length * PHASE_SECONDS;

// Rounded-square track in a 220×220 viewBox. The path starts at the bottom of
// the left side and runs clockwise, so each quarter of its length is one side
// plus its trailing corner — keeping the dot in step with the four equal
// phases.
const R = 28;
const TRACK_D = [
  `M 10 ${210 - R}`,
  `L 10 ${10 + R}`,
  `Q 10 10 ${10 + R} 10`,
  `L ${210 - R} 10`,
  `Q 210 10 210 ${10 + R}`,
  `L 210 ${210 - R}`,
  `Q 210 210 ${210 - R} 210`,
  `L ${10 + R} 210`,
  `Q 10 210 10 ${210 - R}`,
  "Z",
].join(" ");

export default function BreathPacer() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASE_SECONDS);
  const [cycles, setCycles] = useState(0);

  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!running) return;
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const total = path.getTotalLength();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      // rAF timestamps are vsync-aligned and can precede the performance.now()
      // captured above, so clamp to avoid a negative phase index.
      const elapsed = Math.max(0, now - start) / 1000;
      const inCycle = elapsed % CYCLE_SECONDS;
      // Under reduced motion the dot steps once per second instead of gliding.
      const t = reduceMotion ? Math.floor(inCycle) : inCycle;
      const p = path.getPointAtLength((t / CYCLE_SECONDS) * total);
      dot.setAttribute("cx", String(p.x));
      dot.setAttribute("cy", String(p.y));

      setPhaseIndex(Math.floor(inCycle / PHASE_SECONDS) % phases.length);
      setCountdown(Math.ceil(PHASE_SECONDS - (inCycle % PHASE_SECONDS)) || PHASE_SECONDS);
      setCycles(Math.floor(elapsed / CYCLE_SECONDS));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const start = () => {
    setPhaseIndex(0);
    setCountdown(PHASE_SECONDS);
    setCycles(0);
    setRunning(true);
    posthog.capture("breath_tool_started", {
      technique: "box_breathing",
      ...getStoredAttribution(),
    });
  };

  const stop = () => {
    setRunning(false);
    posthog.capture("breath_tool_stopped", {
      technique: "box_breathing",
      cycles_completed: cycles,
      ...getStoredAttribution(),
    });
  };

  const phase = phases[phaseIndex];

  return (
    <div className="pacer">
      <div className={`pacerStage ${running ? "running" : "idle"}`}>
        <svg className="pacerSvg" viewBox="0 0 220 220" aria-hidden="true">
          <path ref={pathRef} className="pacerTrack" d={TRACK_D} />
          <circle ref={dotRef} className="pacerDot" r="7" cx="10" cy={210 - R} />
        </svg>
        {phases.map((p, i) => (
          <span
            key={i}
            className={`pacerSideLabel pacerSide-${p.side}${
              running && i === phaseIndex ? " active" : ""
            }`}
            aria-hidden="true"
          >
            {p.short}
          </span>
        ))}
        <div className="pacerInner">
          {running ? (
            <>
              <span className="pacerPhase">{phase.label}</span>
              <span className="pacerCount">{countdown}</span>
            </>
          ) : (
            <span className="pacerPhase">Ready</span>
          )}
        </div>
      </div>

      <div className="pacerControls">
        <button className="storeBtn pacerBtn" onClick={running ? stop : start}>
          {running ? "Stop" : "Start breathing"}
        </button>
        <span className="pacerCycles">
          {cycles} {cycles === 1 ? "round" : "rounds"} completed
        </span>
      </div>
    </div>
  );
}
