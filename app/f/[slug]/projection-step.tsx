"use client";

import { projectionDateLabel } from "@/lib/funnels/personalization";
import type { FunnelPersonalization } from "@/lib/funnels/types";

import { StressProjection } from "./info-visuals";

/** Standalone screen for the 2-week projection chart. Same chart the summary
 *  used to embed, now its own beat. Derived from the user's answers and
 *  `personalization.summary.projection`. */
export function ProjectionStep({
  title,
  body,
  personalization,
  answers,
}: {
  title: string;
  body: string;
  personalization: FunnelPersonalization;
  answers: Record<string, string>;
}) {
  const projection = personalization.summary.projection;
  const hasBody = body.trim().length > 0;
  const lowerLabel = (value?: string) => value?.toLocaleLowerCase();

  // Chart heading is the metric the user chose to improve (e.g. "Your stress"
  // or "Your sleep quality"), keyed off their goal answer — not the screen
  // headline. Falls back when the answer isn't mapped.
  const metricTitle = projection
    ? projection.metricLabels?.[answers[projection.stepId]] ??
      projection.fallbackMetricLabel ??
      projection.title
    : undefined;

  return (
    <div className="funnelInfo">
      {projection ? (
        <div className="funnelProjectionChart">
          <StressProjection
            title={metricTitle}
            endLabel="with azora"
            targetDateLabel={`by ${projectionDateLabel()}`}
            comparisonLabel={lowerLabel(projection.comparisonLabel)}
            startLabel={lowerLabel(projection.startLabel)}
            endTimeLabel={lowerLabel(projection.endLabel)}
            caption={projection.caption}
          />
        </div>
      ) : null}
      <h1 className="funnelQuestion">{title}</h1>
      {hasBody ? <p className="funnelSubtext">{body}</p> : null}
    </div>
  );
}
