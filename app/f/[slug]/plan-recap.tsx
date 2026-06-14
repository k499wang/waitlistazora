"use client";

import {
  projectionDateLabel,
  resolvePersonalTemplate,
} from "@/lib/funnels/personalization";
import type { FunnelPersonalization } from "@/lib/funnels/types";

import { StressProjection } from "./info-visuals";

/** Personalized plan card + projection graph, reused on the summary screen and
 *  again at the top of the paywall (results-first framing). */
export function PlanRecap({
  personalization,
  answers,
  showProjection = true,
}: {
  personalization: FunnelPersonalization;
  answers: Record<string, string>;
  showProjection?: boolean;
}) {
  const rows = personalization.summary.planRows.flatMap((row) => {
    const value = resolvePersonalTemplate(
      row.value,
      answers,
      personalization.shortAnswers,
    );
    return value === null ? [] : [{ label: row.label, value }];
  });
  const projection = personalization.summary.projection;

  return (
    <>
      <dl className="summaryPlanCard">
        {rows.map((row) => (
          <div key={row.label} className="summaryPlanRow">
            <dt className="summaryPlanLabel">{row.label}</dt>
            <dd className="summaryPlanValue">{row.value}</dd>
          </div>
        ))}
      </dl>

      {showProjection && projection ? (
        <div className="summaryProjection">
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
    </>
  );
}
