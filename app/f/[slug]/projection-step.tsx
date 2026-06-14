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

  return (
    <div className="funnelInfo">
      {projection ? (
        <div className="funnelProjectionChart">
          <StressProjection
            title={projection.title}
            endLabel={
              projection.endLabels[answers[projection.stepId]] ??
              projection.fallbackEndLabel
            }
            targetDateLabel={`by ${projectionDateLabel()}`}
            planLabel={projection.planLabel}
            comparisonLabel={projection.comparisonLabel}
            startLabel={projection.startLabel}
            endTimeLabel={projection.endLabel}
            caption={projection.caption}
          />
        </div>
      ) : null}
      <h1 className="funnelQuestion">{title}</h1>
      {hasBody ? <p className="funnelSubtext">{body}</p> : null}
    </div>
  );
}
