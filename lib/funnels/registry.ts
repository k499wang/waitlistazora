import type { FunnelConfig } from "./types";

// Typed funnel registry. Add new funnels here; the [slug] route resolves them
// by slug and 404s on unknown/non-active funnels.
//
// Calm Reset funnel structure (17 screens):
//   10 questions → 3 proof info screens (every ~3 question screens) →
//   1 building interstitial → result → offer
//
// Branching: goal (stress / sleep / general) → 1 branch follow-up → 9 common questions.
// Info screens are intentional stops with a visual + Continue button; the building
// interstitial auto-advances with a spinner.

const FUNNELS: Record<string, FunnelConfig> = {
  "calm-reset": {
    slug: "calm-reset",
    name: "Calm Reset",
    status: "active",
    intro:
      "A few gentle questions to build your calm, guided by your heart rate. No wearables needed.",
    steps: [
      // ── Q1: Goal (branches: stress, sleep, or general) ───────────────
      {
        kind: "single_choice",
        id: "goal",
        question: "What brings you here today?",
        subtext:
          "There are no wrong answers here, just where you're at right now.",
        reassurance:
          "That's a great place to start. We'll build from here.",
        options: [
          {
            id: "stress",
            emoji: "🌿",
            label: "I need to calm my mind",
            nextId: "stress_body",
          },
          {
            id: "sleep",
            emoji: "🌙",
            label: "I want to sleep deeply",
            nextId: "sleep_mind",
          },
          {
            id: "wellness",
            emoji: "✨",
            label: "I want to feel better overall",
            nextId: "general_feel",
          },
          {
            id: "focus",
            emoji: "🎯",
            label: "I want to sharpen my focus",
            nextId: "general_feel",
          },
          {
            id: "explore",
            emoji: "🔍",
            label: "I'm just exploring, curious what this is",
            nextId: "general_feel",
          },
        ],
      },

      // ── Q2a: Stress branch ────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "stress_body",
        question: "When stress shows up, where do you feel it most?",
        subtext:
          "Stress shows up in the body first. Noticing where is the first step to letting it go.",
        options: [
          {
            id: "racing",
            emoji: "🧠",
            label: "Racing thoughts, my mind won't slow down",
            nextId: "me_time",
          },
          {
            id: "chest",
            emoji: "🫀",
            label: "Tight chest, shallow quick breathing",
            nextId: "me_time",
          },
          {
            id: "shoulders",
            emoji: "💪",
            label: "Tense shoulders and jaw, always braced",
            nextId: "me_time",
          },
          {
            id: "stomach",
            emoji: "🦋",
            label: "Knot in my stomach, that uneasy flutter",
            nextId: "me_time",
          },
        ],
      },

      // ── Q2b: Sleep branch ─────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "sleep_mind",
        question: "What does your mind do when you lie down to sleep?",
        subtext:
          "What happens when your head hits the pillow? Understanding the pattern helps.",
        options: [
          {
            id: "replays",
            emoji: "🔄",
            label: "Replays the day, every moment",
            nextId: "me_time",
          },
          {
            id: "worries",
            emoji: "😟",
            label: "Worries about tomorrow, the list never stops",
            nextId: "me_time",
          },
          {
            id: "wont_quiet",
            emoji: "📣",
            label: "Just won't quiet down, thoughts bounce around",
            nextId: "me_time",
          },
          {
            id: "wake_mid",
            emoji: "⏰",
            label: "I fall asleep fine but wake up at 3am",
            nextId: "me_time",
          },
        ],
      },

      // ── Q2c: General path (wellness, focus, explore) ──────────────────
      {
        kind: "single_choice",
        id: "general_feel",
        question: "How are you feeling lately?",
        subtext:
          "No need to overthink it. Just go with what feels true right now.",
        options: [
          {
            id: "drained",
            emoji: "🪫",
            label: "Drained, running on empty most days",
            nextId: "me_time",
          },
          {
            id: "scattered",
            emoji: "🌪️",
            label: "Scattered, my attention is everywhere",
            nextId: "me_time",
          },
          {
            id: "flat",
            emoji: "🫥",
            label: "A bit flat, not bad not great, just there",
            nextId: "me_time",
          },
          {
            id: "okay",
            emoji: "🌤️",
            label: "Actually okay, just want to stay that way",
            nextId: "me_time",
          },
        ],
      },

      // ── Q3: Self-care frequency ───────────────────────────────────────
      {
        kind: "single_choice",
        id: "me_time",
        question: "How often do you take a moment just for yourself?",
        subtext:
          "Not a workout. Not scrolling your phone. Just a quiet pause where you're not doing anything for anyone.",
        options: [
          {
            id: "rarely",
            emoji: "💨",
            label: "Almost never, who has the time",
          },
          {
            id: "sometimes",
            emoji: "🌤️",
            label: "Once in a while, when things pile up",
          },
          {
            id: "often",
            emoji: "🕯️",
            label: "Most days, I protect a few minutes",
          },
        ],
      },

      // ── INFO 1: Science proof ─────────────────────────────────────────
      {
        kind: "info",
        id: "science_proof",
        icon: "🔬",
        title: "The science is clear",
        body:
          "Over 2,000 peer-reviewed studies confirm that slowing your exhale " +
          "activates the vagus nerve, your body's natural off switch for stress. " +
          "It lowers cortisol, steadies your heart rate, and works on your first try.",
      },

      // ── Q4: Peaceful moment ───────────────────────────────────────────
      {
        kind: "single_choice",
        id: "peace_time",
        question: "When do you feel most at peace during your day?",
        options: [
          {
            id: "morning",
            emoji: "🌅",
            label: "Early morning, before the world wakes up",
          },
          {
            id: "midday",
            emoji: "☀️",
            label: "Midday, I need a reset in the middle of things",
          },
          {
            id: "evening",
            emoji: "🌆",
            label: "Evening, winding down from the day",
          },
          {
            id: "late",
            emoji: "🌌",
            label: "Late at night, when everything is finally quiet",
          },
        ],
      },

      // ── Q5: What reset means ──────────────────────────────────────────
      {
        kind: "single_choice",
        id: "reset_meaning",
        question: "What does a 'reset' feel like to you?",
        subtext:
          "Everyone's calm looks different. Picture yours. What comes closest?",
        options: [
          {
            id: "clear",
            emoji: "💧",
            label: "Mental clarity, the fog lifts",
          },
          {
            id: "light",
            emoji: "🪶",
            label: "Feeling lighter, the weight lifts",
          },
          {
            id: "still",
            emoji: "🌊",
            label: "Stillness, my body finally unclenches",
          },
          {
            id: "energy",
            emoji: "🔋",
            label: "Renewed energy, ready for what's next",
          },
        ],
      },

      // ── Q6: Session length ────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "calm_duration",
        question: "How long do you need to feel truly calmed?",
        subtext:
          "Even 2 minutes of measured breathing shifts your nervous system. " +
          "This is about what fits your life, not what's 'enough.'",
        options: [
          {
            id: "two_min",
            emoji: "⏱️",
            label: "2 minutes, just enough to catch my breath",
          },
          {
            id: "five_min",
            emoji: "🕐",
            label: "5 minutes, a real pause that sticks",
          },
          {
            id: "ten_min",
            emoji: "🕙",
            label: "10 minutes, I want to go deep",
          },
        ],
      },

      // ── INFO 2: PPG heart rate ────────────────────────────────────────
      {
        kind: "info",
        id: "ppg_heart",
        icon: "📱",
        title: "Your phone reads your heart",
        body:
          "Azora uses PPG, the same light based technology found in hospital " +
          "pulse oximeters. Rest a finger on your camera to measure your " +
          "heart rate within 2% of medical grade devices. No strap. Just your " +
          "phone.",
      },

      // ── Q7: Breath experience ─────────────────────────────────────────
      {
        kind: "single_choice",
        id: "breath_experience",
        question: "Have you ever tried following your breath before?",
        subtext:
          "No experience needed. Your body already knows how to breathe, " +
          "we just guide the rhythm.",
        reassurance:
          "Everyone starts somewhere. Your body already knows how, you just found the guide.",
        options: [
          {
            id: "new",
            emoji: "🌱",
            label: "Never, this is all new to me",
          },
          {
            id: "curious",
            emoji: "🌿",
            label: "I've dabbled, tried an app or video once or twice",
          },
          {
            id: "regular",
            emoji: "🌳",
            label: "It's part of my life, I practice regularly",
          },
        ],
      },

      // ── Q8: What blocks the reset ─────────────────────────────────────
      {
        kind: "single_choice",
        id: "reset_blocker",
        question: "What usually gets in the way of taking a pause?",
        options: [
          {
            id: "guilt",
            emoji: "😞",
            label: "It feels selfish, there's too much to do",
          },
          {
            id: "forget",
            emoji: "🌊",
            label: "I forget, the day sweeps me away",
          },
          {
            id: "dont_know",
            emoji: "❓",
            label: "I don't know where to start",
          },
          {
            id: "skeptical",
            emoji: "🤔",
            label: "I'm not sure it'll actually work for me",
          },
        ],
      },

      // ── Q9: Body signals ──────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "body_signal",
        question: "How does your body tell you it needs a reset?",
        subtext:
          "Before your mind even registers stress, your body has already spoken. " +
          "What do you notice first?",
        options: [
          {
            id: "shallow",
            emoji: "🫁",
            label: "My breathing gets shallow, short quick inhales",
          },
          {
            id: "heart",
            emoji: "💓",
            label: "My heart races or pounds without reason",
          },
          {
            id: "tight",
            emoji: "🪨",
            label: "My shoulders or jaw tighten up",
          },
          {
            id: "fatigue",
            emoji: "🪫",
            label: "Sudden exhaustion, like a wave of heavy",
          },
        ],
      },

      // ── INFO 3: Social proof ──────────────────────────────────────────
      {
        kind: "info",
        id: "social_proof",
        icon: "👥",
        title: "You're not alone",
        body:
          "Over 100,000 people use Azora to reset their nervous system. " +
          "94% report lower stress within 2 weeks. It all " +
          "starts with one deep breath.",
      },

      // ── Q10: Current coping ───────────────────────────────────────────
      {
        kind: "single_choice",
        id: "coping_style",
        question: "What do you reach for when you need comfort?",
        subtext: "No judgment. This helps us understand what's already in your toolkit.",
        reassurance:
          "No judgment. Every way you cope made sense at some point. We're just adding one more tool.",
        options: [
          {
            id: "push",
            emoji: "😤",
            label: "I power through, keep going until it passes",
          },
          {
            id: "numb",
            emoji: "📱",
            label: "I distract myself, scroll snacks Netflix",
          },
          {
            id: "breathe",
            emoji: "🫁",
            label: "I breathe or meditate, I already lean into it",
          },
          {
            id: "move",
            emoji: "🚶",
            label: "I move, a walk or stretch",
          },
        ],
      },

      // ── Building interstitial ──────────────────────────────────────────
      {
        kind: "interstitial",
        id: "building",
        title: "Building your plan…",
        body: "",
      },

      // ── Result ────────────────────────────────────────────────────────
      {
        kind: "result",
        id: "result",
        title: "Your plan is done",
        body:
          "We built a breathwork plan tuned to your goals, your rhythm, " +
          "and where you are now.",
      },

      // ── Account (save the plan) ───────────────────────────────────────
      // Web2app pattern: account creation sits between the result and the
      // offer, framed as saving the plan the user just built. Purchases are
      // tied to the account, so asking here (instead of surprising the user
      // at checkout) makes the requirement explicit while motivation is high.
      {
        kind: "account",
        id: "account",
        title: "Save your plan",
        body:
          "Your plan only lives on this page right now. Create a free account " +
          "to keep it and unlock it on your phone.",
        benefits: [
          "Saves your personalized plan with every answer you gave",
          "Links your subscription to your account",
          "Syncs instantly to the iOS app when you sign in",
        ],
      },

      // ── Offer ─────────────────────────────────────────────────────────
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
