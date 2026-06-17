"use client";

import { useEffect, useRef, useState } from "react";

import type { FunnelStep } from "@/lib/funnels/types";

type InterstitialStepConfig = Extract<FunnelStep, { kind: "interstitial" }>;

// How long the bars animate on their own before the first question card slides
// in. Long enough to read as "we're working", short enough to keep momentum.
const QUESTION_REVEAL_DELAY = 1800;

// Per-row fill duration — must match the `loadingFill` animation + the
// sequential `animation-delay` step in globals.css. Used to time how much
// loading is left after the user answers, so the bars finish before advancing.
const ITEM_FILL_MS = 2600;

export function InterstitialStep({
  step,
  title,
  body,
  onAdvance,
}: {
  step: InterstitialStepConfig;
  title: string;
  body: string;
  /** Called when the user taps through the final loading question. */
  onAdvance?: () => void;
}) {
  const loadingItems = step.loadingItems ?? [];
  const questions = step.loadingQuestions ?? [];

  // Card sequence state. `revealed` gates the first card behind a short delay so
  // the bars get a beat to move first; `cardIndex` walks through the sequence;
  // `answered` flips once the user taps through the final card.
  const [revealed, setRevealed] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [answered, setAnswered] = useState(false);

  // Keep the latest advance callback in a ref so the finish timer below doesn't
  // reset on unrelated re-renders.
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (!questions.length) return;
    const t = setTimeout(() => setRevealed(true), QUESTION_REVEAL_DELAY);
    return () => clearTimeout(t);
  }, [questions.length]);

  // Once answered, the bars resume (no longer paused) and we let the loading
  // visibly finish before advancing — so the answer feels like it fed the plan.
  useEffect(() => {
    if (!answered) return;
    const remaining = Math.max(
      600,
      loadingItems.length * ITEM_FILL_MS - QUESTION_REVEAL_DELAY,
    );
    const t = setTimeout(() => onAdvanceRef.current?.(), remaining);
    return () => clearTimeout(t);
  }, [answered, loadingItems.length]);

  const activeQuestion =
    revealed && !answered ? questions[cardIndex] : undefined;

  // Buttons to render: explicit `options`, else the single `cta`.
  const options =
    activeQuestion?.options ??
    (activeQuestion?.cta ? [activeQuestion.cta] : []);

  const handleCardTap = () => {
    if (cardIndex < questions.length - 1) {
      setCardIndex((i) => i + 1);
      return;
    }
    setAnswered(true);
  };

  return (
    <div className="funnelInterstitial">
      <div className="funnelSpinner" aria-hidden />
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}
      {loadingItems.length ? (
        <div
          // Freeze the bars while a popup is up — the loading visibly pauses
          // until the user answers, then resumes/advances on tap.
          className={`funnelLoadingList${activeQuestion ? " isPaused" : ""}`}
          role="status"
          aria-label="Building your personalized plan"
        >
          {loadingItems.map((item) => (
            <div className="funnelLoadingItem" key={item}>
              <div className="funnelLoadingItemTop">
                <span>{item}</span>
                <span className="funnelLoadingCheck" aria-hidden>
                  ✓
                </span>
              </div>
              <div className="funnelLoadingTrack" aria-hidden>
                <div className="funnelLoadingFill" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeQuestion ? (
        <div className="funnelLoadingQuestionOverlay">
          <div
            className="funnelLoadingQuestion"
            // Re-key per card so the pop-in animation replays on each step.
            key={cardIndex}
            role="dialog"
            aria-modal="true"
            aria-label={activeQuestion.prompt}
          >
            <p className="funnelLoadingQuestionPrompt">{activeQuestion.prompt}</p>
            {activeQuestion.detail ? (
              <p className="funnelLoadingQuestionDetail">
                {activeQuestion.detail}
              </p>
            ) : null}
            {options.length > 1 ? (
              <div className="funnelLoadingQuestionOptions">
                {options.map((label) => (
                  <button
                    type="button"
                    key={label}
                    className="funnelLoadingQuestionOption"
                    onClick={handleCardTap}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="funnelPrimaryBtn funnelLoadingQuestionBtn"
                onClick={handleCardTap}
              >
                {options[0]}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
