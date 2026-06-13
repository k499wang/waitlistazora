"use client";

import { useState } from "react";

import type { FunnelStep } from "@/lib/funnels/types";

type TextInputStepConfig = Extract<FunnelStep, { kind: "text_input" }>;

export function TextInputStep({
  step,
  title,
  body,
  onSubmit,
}: {
  step: TextInputStepConfig;
  title: string;
  body: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  return (
    <form
      className="funnelTextInput"
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed) onSubmit(trimmed);
      }}
    >
      <h1 className="funnelQuestion">{title}</h1>
      {body ? <p className="funnelSubtext">{body}</p> : null}
      <input
        className="authInput"
        type="text"
        autoFocus
        autoComplete="given-name"
        value={value}
        maxLength={step.maxLength ?? 40}
        placeholder={step.placeholder ?? ""}
        onChange={(e) => setValue(e.target.value)}
        aria-label={step.question}
      />
      <button type="submit" className="funnelPrimaryBtn" disabled={!trimmed}>
        Continue
      </button>
    </form>
  );
}
