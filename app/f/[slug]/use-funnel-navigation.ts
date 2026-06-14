"use client";

import { useCallback, useMemo, useState } from "react";

import type { FunnelStep } from "@/lib/funnels/types";

export function useFunnelNavigation(steps: FunnelStep[]) {
  const [currentId, setCurrentId] = useState(steps[0].id);
  const [history, setHistory] = useState<string[]>([]);

  const step = useMemo(
    () => steps.find((candidate) => candidate.id === currentId)!,
    [currentId, steps],
  );

  const defaultNext = useCallback(
    (fromId: string): string | null => {
      const idx = steps.findIndex((candidate) => candidate.id === fromId);
      if (idx < 0 || idx >= steps.length - 1) return null;
      return steps[idx + 1].id;
    },
    [steps],
  );

  const navigate = useCallback(
    (stepId: string) => {
      setHistory((prev) => [...prev, currentId]);
      setCurrentId(stepId);
    },
    [currentId],
  );

  const replace = useCallback((stepId: string) => {
    setCurrentId(stepId);
  }, []);

  const previousStepId = history[history.length - 1] ?? null;
  const goBack = useCallback(() => {
    if (!previousStepId) return;
    setHistory((prev) => prev.slice(0, -1));
    setCurrentId(previousStepId);
  }, [previousStepId]);

  return {
    currentId,
    step,
    history,
    previousStepId,
    defaultNext,
    navigate,
    replace,
    goBack,
  };
}
