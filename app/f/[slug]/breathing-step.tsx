"use client";

import { useEffect, useRef, useState } from "react";

import type { FunnelStep } from "@/lib/funnels/types";

type BreathingConfig = Extract<FunnelStep, { kind: "breathing" }>;

/** Interactive "follow along" breathing/breath-hold exercise. An animated orb
 *  expands, holds, and contracts through the configured phases for `rounds`
 *  cycles. When it finishes (or the user skips), `onComplete` fires once, which
 *  the runner uses to unlock the Continue button. */
export function BreathingStep({
  step,
  title,
  body,
  isComplete,
  onComplete,
}: {
  step: BreathingConfig;
  title: string;
  body: string;
  isComplete: boolean;
  onComplete: () => void;
}) {
  const phases = step.phases;
  const total = phases.length * step.rounds;

  // When the user has already done this exercise (e.g. navigated back and
  // forward), start in the finished state instead of replaying it.
  const [index, setIndex] = useState(isComplete ? total : 0);
  const [started, setStarted] = useState(isComplete);
  const [count, setCount] = useState(phases[0]?.seconds ?? 0);
  const completedRef = useRef(isComplete);

  const finished = index >= total;
  const phase = finished ? null : phases[index % phases.length];
  const round = Math.min(step.rounds, Math.floor(index / phases.length) + 1);

  // Drive the phase clock: a per-second tick for the countdown, and a timer to
  // advance to the next phase. Re-runs whenever the phase index changes.
  useEffect(() => {
    if (!started || finished) return;
    const secs = phases[index % phases.length].seconds;
    setCount(secs);
    const tick = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    const advance = setTimeout(() => setIndex((i) => i + 1), secs * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(advance);
    };
  }, [started, index, finished, phases]);

  // Fire completion exactly once.
  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const skip = () => {
    completedRef.current = true;
    setIndex(total);
    onComplete();
  };

  const orbScale = !started ? 0.62 : (phase?.scale ?? 1);
  const transitionSecs = started && phase ? phase.seconds : 0.6;

  return (
    <div className="funnelInfo funnelBreathing">
      <h1 className="funnelQuestion">{title}</h1>
      {body ? <p className="funnelSubtext">{body}</p> : null}

      <div className="breathOrbWrap">
        <span className="breathOrbGlow" aria-hidden />
        <span
          className="breathOrb"
          aria-hidden
          style={{
            transform: `scale(${orbScale})`,
            transitionDuration: `${transitionSecs}s`,
          }}
        />
        <div className="breathOrbCenter">
          {!started ? (
            <button
              type="button"
              className="breathBegin"
              onClick={() => setStarted(true)}
            >
              Begin
            </button>
          ) : finished ? (
            <span className="breathPhaseLabel">Nicely done</span>
          ) : (
            <>
              <span className="breathPhaseLabel">{phase?.label}</span>
              <span className="breathCount">{count}</span>
            </>
          )}
        </div>
      </div>

      {started && !finished ? (
        <p className="breathRound">
          Round {round} of {step.rounds}
        </p>
      ) : (
        <p className="breathRound" aria-hidden />
      )}

      {started && !finished ? (
        <button type="button" className="breathSkip" onClick={skip}>
          Skip exercise
        </button>
      ) : null}
    </div>
  );
}
