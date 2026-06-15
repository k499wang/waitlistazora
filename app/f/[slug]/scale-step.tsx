"use client";

import type { FunnelStep } from "@/lib/funnels/types";

type ScaleStepConfig = Extract<FunnelStep, { kind: "scale" }>;

// 5-point agree/disagree Likert rendered as a horizontal slider. The five
// snap points are radio inputs styled as ticks on a track; the selected tick
// becomes the slider handle and the track fills up to it. Selecting a point
// calls onSelect — the runner records it and auto-advances after a brief,
// resettable pause, so a mistap can be corrected before it commits.
const POINTS = [1, 2, 3, 4, 5] as const;

export function ScaleStep({
  step,
  title,
  body,
  selectedValue,
  onSelect,
}: {
  step: ScaleStepConfig;
  title: string;
  body: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
}) {
  const selected = selectedValue ? Number(selectedValue) : null;
  const minLabel = step.minLabel ?? "Strongly disagree";
  const maxLabel = step.maxLabel ?? "Strongly agree";
  // Fill the track from the left up to the selected tick (0%–100% across 5
  // points). Nothing filled until the user picks.
  const fillPct =
    selected != null ? ((selected - 1) / (POINTS.length - 1)) * 100 : 0;

  return (
    <>
      <h1 className="funnelQuestion">{title}</h1>
      {body ? <p className="funnelSubtext">{body}</p> : null}

      <div
        className="funnelScale"
        role="radiogroup"
        aria-label={step.statement}
      >
        <div className="funnelScaleTrack" aria-hidden>
          <div className="funnelScaleTrackBase" />
          <div
            className="funnelScaleTrackFill"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="funnelScalePoints">
          {POINTS.map((point) => {
            const isSelected = selected === point;
            const emoji = step.emojis?.[point - 1];
            return (
              <button
                key={point}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={
                  point === 1
                    ? minLabel
                    : point === POINTS.length
                      ? maxLabel
                      : `${point}`
                }
                className={`funnelScalePoint${
                  isSelected ? " funnelScalePointSelected" : ""
                }${emoji ? " funnelScalePointEmoji" : ""}`}
                onClick={() => onSelect(String(point))}
              >
                {emoji ? (
                  <span className="funnelScaleEmoji" aria-hidden>
                    {emoji}
                  </span>
                ) : (
                  <span className="funnelScaleDot" />
                )}
              </button>
            );
          })}
        </div>
        <div className="funnelScaleLabels">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </>
  );
}
