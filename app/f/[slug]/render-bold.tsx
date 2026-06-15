import type { ReactNode } from "react";

/**
 * Render `**bold**` spans in funnel copy as <strong>, leaving the rest as
 * plain text. Shared by the summary and info steps so any template string
 * (recap reflections, predictions, etc.) bolds consistently.
 */
export function renderBold(text: string): ReactNode[] {
  return text
    .split("**")
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}
