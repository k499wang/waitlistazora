"use client";

import type { FunnelStep } from "@/lib/funnels/types";

type SingleChoiceStepConfig = Extract<FunnelStep, { kind: "single_choice" }>;

export function SingleChoiceStep({
  step,
  title,
  body,
  selectedOptionId,
  reassuringText,
  allowOptionHover,
  onEnableHover,
  onSelect,
}: {
  step: SingleChoiceStepConfig;
  title: string;
  body: string;
  selectedOptionId?: string;
  reassuringText?: string;
  allowOptionHover: boolean;
  onEnableHover: () => void;
  onSelect: (optionId: string) => void;
}) {
  if (reassuringText) {
    return (
      <div className="funnelReassurance" key={`re-${step.id}`}>
        <p className="funnelReassuranceText">{reassuringText}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="funnelQuestion">{title}</h1>
      {body ? <p className="funnelSubtext">{body}</p> : null}
      <div
        className={`funnelOptions${allowOptionHover ? " funnelOptionsCanHover" : ""}`}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse") {
            onEnableHover();
          }
        }}
      >
        {step.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`funnelOption${
              selectedOptionId === opt.id ? " funnelOptionSelected" : ""
            }`}
            onClick={() => onSelect(opt.id)}
          >
            {opt.emoji ? (
              <span className="funnelOptionEmoji" aria-hidden>
                {opt.emoji}
              </span>
            ) : null}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
