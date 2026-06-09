import type { FunnelConfig } from "./types";

// Typed funnel registry. Add new funnels here; the [slug] route resolves them
// by slug and 404s on unknown/non-active funnels.

const FUNNELS: Record<string, FunnelConfig> = {
  "calm-reset": {
    slug: "calm-reset",
    name: "Calm Reset",
    status: "active",
    intro:
      "Answer 3 quick questions and we'll build a breathwork plan tuned to your stress and recovery.",
    steps: [
      {
        kind: "single_choice",
        id: "goal",
        question: "What brings you to Azora?",
        subtext: "We'll personalize your plan around this.",
        options: [
          { id: "stress", emoji: "😮‍💨", label: "Lower stress & anxiety" },
          { id: "sleep", emoji: "🌙", label: "Sleep better" },
          { id: "focus", emoji: "🎯", label: "Sharpen focus" },
          { id: "heart", emoji: "❤️", label: "Understand my heart health" },
        ],
      },
      {
        kind: "single_choice",
        id: "frequency",
        question: "How often do you feel stressed?",
        options: [
          { id: "daily", emoji: "🔥", label: "Most days" },
          { id: "weekly", emoji: "📅", label: "A few times a week" },
          { id: "sometimes", emoji: "🌤️", label: "Now and then" },
        ],
      },
      {
        kind: "single_choice",
        id: "experience",
        question: "Have you tried breathwork before?",
        options: [
          { id: "new", emoji: "🌱", label: "I'm brand new" },
          { id: "some", emoji: "🧘", label: "A little" },
          { id: "lots", emoji: "✨", label: "It's part of my routine" },
        ],
      },
      {
        kind: "interstitial",
        id: "building",
        title: "Building your plan…",
        body: "Matching your answers to evidence-based breathing programs.",
      },
      {
        kind: "result",
        id: "result",
        title: "Your personalized plan is ready",
        body: "Based on your answers, Azora will guide daily breathwork, measure your heart rate through your camera, and track how your stress and recovery change week over week.",
      },
      {
        kind: "offer",
        id: "offer",
        title: "Unlock your full plan with Azora Pro",
        body: "Start your free trial now on the web — your plan carries straight into the app the moment you sign in.",
        offerKey: "annual",
      },
    ],
  },
};

export function getFunnel(slug: string): FunnelConfig | null {
  const funnel = FUNNELS[slug];
  if (!funnel || funnel.status !== "active") {
    return null;
  }
  return funnel;
}

export function listActiveFunnelSlugs(): string[] {
  return Object.values(FUNNELS)
    .filter((f) => f.status === "active")
    .map((f) => f.slug);
}
