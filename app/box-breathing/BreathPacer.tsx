"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { getStoredAttribution } from "@/lib/client-attribution";

type Phase = { label: string; seconds: number; box: "expand" | "contract" | "hold-large" | "hold-small" };

// Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4
const phases: Phase[] = [
  { label: "Breathe in", seconds: 4, box: "expand" },
  { label: "Hold", seconds: 4, box: "hold-large" },
  { label: "Breathe out", seconds: 4, box: "contract" },
  { label: "Hold", seconds: 4, box: "hold-small" },
];

export default function BreathPacer() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(phases[0].seconds);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setCountdown((c) => {
        if (c > 1) return c - 1;
        // phase finished — advance
        setPhaseIndex((idx) => {
          const next = (idx + 1) % phases.length;
          if (next === 0) setCycles((n) => n + 1);
          return next;
        });
        // The phase-change effect resets the real value next frame; return a
        // sane number now to avoid a blank countdown flash.
        return phases[0].seconds;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  // Whenever the phase changes while running, reset the countdown to that phase's length.
  useEffect(() => {
    if (running) setCountdown(phases[phaseIndex].seconds);
  }, [phaseIndex, running]);

  const start = () => {
    setPhaseIndex(0);
    setCountdown(phases[0].seconds);
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
      <div className={`pacerBox ${running ? phase.box : "idle"}`}>
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
