"use client";

import { resolvePersonalTemplate } from "@/lib/funnels/personalization";
import type { FunnelPersonalization } from "@/lib/funnels/types";

import { PlanRecap } from "./plan-recap";
import { renderBold } from "./render-bold";

export function SummaryStep({
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
  const prediction = personalization.summary.prediction;
  const predictionText = prediction
    ? resolvePersonalTemplate(
        prediction.text,
        answers,
        personalization.shortAnswers,
      )
    : null;
  const compareText = personalization.summary.compare
    ? resolvePersonalTemplate(
        personalization.summary.compare,
        answers,
        personalization.shortAnswers,
      )
    : null;

  return (
    <div className="funnelSummary">
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}

      {/* Projection chart lives on its own `projection` step now, not here. */}
      <PlanRecap
        personalization={personalization}
        answers={answers}
        showProjection={false}
      />

      {prediction && predictionText ? (
        <div className="summaryPrediction">
          <p className="summaryPredictionKicker">{prediction.kicker}</p>
          <p className="summaryPredictionText">{renderBold(predictionText)}</p>
        </div>
      ) : null}

      {compareText ? (
        <p className="summaryCompare">{renderBold(compareText)}</p>
      ) : null}
    </div>
  );
}
