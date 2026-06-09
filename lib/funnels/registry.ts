import type { FunnelConfig } from "./types";

// Typed funnel registry. Add new funnels here; the [slug] route resolves them
// by slug and 404s on unknown/non-active funnels.

const FUNNELS: Record<string, FunnelConfig> = {
  "calm-reset": {
    slug: "calm-reset",
    name: "Calm Reset",
    status: "active",
    intro:
      "Answer a few questions and we'll build a breathwork plan tuned exactly for you — guided by your heart rate, no wearables needed.",
    steps: [
      // ── Step 0: Goal (branches) ──
      {
        kind: "single_choice",
        id: "goal",
        question: "What brings you to Azora?",
        subtext: "Join 100,000+ people using breathwork to measurably lower stress. We'll personalize everything around your goal.",
        options: [
          { id: "stress", emoji: "😮‍💨", label: "Lower stress & anxiety", nextId: "stress_triggers" },
          { id: "sleep", emoji: "🌙", label: "Sleep better", nextId: "sleep_quality" },
          { id: "focus", emoji: "🎯", label: "Sharpen focus", nextId: "focus_challenge" },
          { id: "heart", emoji: "❤️", label: "Understand my heart health", nextId: "heart_concern" },
        ],
      },

      // ── Step 1a: Stress branch ──
      {
        kind: "single_choice",
        id: "stress_triggers",
        question: "What triggers your stress the most?",
        options: [
          { id: "work", emoji: "💼", label: "Work pressure", nextId: "frequency" },
          { id: "overwhelm", emoji: "🌪️", label: "Overwhelm — too much to do", nextId: "frequency" },
          { id: "relationships", emoji: "💔", label: "Relationships", nextId: "frequency" },
          { id: "health", emoji: "🏥", label: "Health worries", nextId: "frequency" },
          { id: "everything", emoji: "😵", label: "All of the above", nextId: "frequency" },
        ],
      },

      // ── Step 1b: Sleep branch ──
      {
        kind: "single_choice",
        id: "sleep_quality",
        question: "What's your biggest sleep struggle?",
        options: [
          { id: "cant_fall", emoji: "😳", label: "Can't fall asleep", nextId: "frequency" },
          { id: "wake_up", emoji: "😴", label: "Wake up during the night", nextId: "frequency" },
          { id: "tired_morning", emoji: "🥱", label: "Wake up tired no matter what", nextId: "frequency" },
          { id: "racing", emoji: "🧠", label: "Racing thoughts at bedtime", nextId: "frequency" },
        ],
      },

      // ── Step 1c: Focus branch ──
      {
        kind: "single_choice",
        id: "focus_challenge",
        question: "What derails your focus the most?",
        options: [
          { id: "phone", emoji: "📱", label: "Phone & notifications", nextId: "frequency" },
          { id: "brain_fog", emoji: "☁️", label: "Mental fog", nextId: "frequency" },
          { id: "procrastination", emoji: "🐌", label: "Procrastination", nextId: "frequency" },
          { id: "anxiety", emoji: "😰", label: "Anxiety about tasks", nextId: "frequency" },
        ],
      },

      // ── Step 1d: Heart branch ──
      {
        kind: "single_choice",
        id: "heart_concern",
        question: "What do you want to understand about your heart?",
        options: [
          { id: "stress_hr", emoji: "💓", label: "How stress affects my heart rate", nextId: "frequency" },
          { id: "recovery", emoji: "📉", label: "How well I recover after stress", nextId: "frequency" },
          { id: "trends", emoji: "📊", label: "Long-term health trends", nextId: "frequency" },
          { id: "all_heart", emoji: "🔬", label: "All of it — the full picture", nextId: "frequency" },
        ],
      },

      // ── Step 2: Frequency (common path begins) ──
      {
        kind: "single_choice",
        id: "frequency",
        question: "How often do you feel this way?",
        options: [
          { id: "daily", emoji: "🔥", label: "Most days" },
          { id: "weekly", emoji: "📅", label: "A few times a week" },
          { id: "sometimes", emoji: "🌤️", label: "Now and then" },
        ],
      },

      // ── Step 3: Time of day ──
      {
        kind: "single_choice",
        id: "time_of_day",
        question: "When would you most like to practice?",
        subtext: "Breathwork works best when it fits naturally into your day.",
        options: [
          { id: "morning", emoji: "🌅", label: "Morning — start fresh" },
          { id: "midday", emoji: "☀️", label: "Midday — hit reset" },
          { id: "evening", emoji: "🌆", label: "Evening — unwind" },
          { id: "bedtime", emoji: "🌙", label: "Before bed — sleep deeper" },
        ],
      },

      // ── Step 4: Session length ──
      {
        kind: "single_choice",
        id: "session_length",
        question: "How long can you commit per session?",
        subtext: "Even 2 minutes of measured breathing changes your physiology.",
        options: [
          { id: "two_min", emoji: "⏱️", label: "2 minutes — quick reset" },
          { id: "five_min", emoji: "🕐", label: "5 minutes — a real break" },
          { id: "ten_min", emoji: "🕙", label: "10 minutes — deep session" },
        ],
      },

      // ── Step 5: Experience ──
      {
        kind: "single_choice",
        id: "experience",
        question: "Have you tried breathwork before?",
        options: [
          { id: "new", emoji: "🌱", label: "I'm brand new" },
          { id: "some", emoji: "🧘", label: "A little" },
          { id: "routine", emoji: "✨", label: "It's part of my routine" },
        ],
      },

      // ── Step 6: Current coping ──
      {
        kind: "single_choice",
        id: "current_coping",
        question: "What do you currently do when stress hits?",
        options: [
          { id: "push_through", emoji: "😤", label: "Just push through it" },
          { id: "scroll", emoji: "📱", label: "Scroll my phone to escape" },
          { id: "breathe", emoji: "🫁", label: "Try to breathe or meditate" },
          { id: "exercise", emoji: "🏃", label: "Move my body — walk or exercise" },
        ],
      },

      // ── Step 7: Mindfulness level ──
      {
        kind: "single_choice",
        id: "mindfulness",
        question: "How familiar are you with mindfulness or meditation?",
        options: [
          { id: "beginner", emoji: "🌱", label: "Total beginner" },
          { id: "dabbled", emoji: "🌿", label: "I've dabbled" },
          { id: "regular", emoji: "🌳", label: "I practice regularly" },
        ],
      },

      // ── Step 8: Interstitial (spinner + title only, no grey body) ──
      {
        kind: "interstitial",
        id: "building",
        title: "Building your {{goal}} plan…",
        body: "",
      },

      // ── Step 9: Result ──
      {
        kind: "result",
        id: "result",
        title: "Your plan is ready",
        body: "We built a breathwork plan tuned to your goals, your rhythm, and your experience level.",
      },

      // ── Step 10: Offer ──
      {
        kind: "offer",
        id: "offer",
        title: "Try Azora Pro for free",
        body: "",
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
