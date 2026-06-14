"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useFunnelAnswers(funnelSlug: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Server-saved answers from earlier in the session (or a previous visit),
  // kept separate from `answers` so quiz options never render pre-selected.
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/funnel-answer")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { answers?: Record<string, string> } | null) => {
        if (!data?.answers || Object.keys(data.answers).length === 0) return;
        setSavedAnswers(data.answers);
      })
      .catch(() => {});
  }, []);

  const effectiveAnswers = useMemo(
    () => ({ ...savedAnswers, ...answers }),
    [answers, savedAnswers],
  );

  const recordAnswer = useCallback(
    (stepId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [stepId]: value }));

      fetch("/api/funnel-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_id: stepId,
          answer: { option_id: value },
          funnel_slug: funnelSlug,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    [funnelSlug],
  );

  return { answers, effectiveAnswers, recordAnswer };
}
