import type { FunnelConfig } from "./types";

// Typed funnel registry. Add new funnels here; the [slug] route resolves them
// by slug and 404s on unknown/non-active funnels.
//
// Calm Reset funnel structure (18 screens), built on the "unique mechanism"
// pattern: the user's problem stays the goal (stress / sleep / focus), and
// camera-PPG biofeedback breathing ("Heart-Guided Breathing") is the named
// mechanism that solves all of them:
//   8 questions → 9 info screens (failure reframe pair → mechanism +
//   accuracy proof → personal bridge pair (signature → camera makes it
//   visible) → live feedback → social proof), one idea per screen →
//   1 building interstitial → result → account → offer
//
// Branching: goal (stress / sleep / general) → 1 branch follow-up → joins the
// common path at `tried_before`. Info screens are intentional stops with a
// visual + Continue button; the building interstitial auto-advances.
//
// The accuracy info screen cites real published PPG validation studies
// (citation strings below). Institution names render as text wordmarks, not
// logos — clear trademark/endorsement review before using actual logo marks.

const FUNNELS: Record<string, FunnelConfig> = {
  "calm-reset": {
    slug: "calm-reset",
    name: "Calm Reset",
    status: "active",
    intro:
      "A few quick questions to build your plan. Then watch your own heart rate fall, live, using just your phone's camera.",
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
          "Stress hits the body before the mind notices. Where it lands tells us how to unwind it.",
        options: [
          {
            id: "racing",
            emoji: "🧠",
            label: "Racing thoughts, my mind won't slow down",
            nextId: "tried_before",
          },
          {
            id: "chest",
            emoji: "🫀",
            label: "Tight chest, shallow quick breathing",
            nextId: "tried_before",
          },
          {
            id: "shoulders",
            emoji: "💪",
            label: "Tense shoulders and jaw, always braced",
            nextId: "tried_before",
          },
          {
            id: "stomach",
            emoji: "🦋",
            label: "Knot in my stomach, that uneasy flutter",
            nextId: "tried_before",
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
            nextId: "tried_before",
          },
          {
            id: "worries",
            emoji: "😟",
            label: "Worries about tomorrow, the list never stops",
            nextId: "tried_before",
          },
          {
            id: "wont_quiet",
            emoji: "📣",
            label: "Just won't quiet down, thoughts bounce around",
            nextId: "tried_before",
          },
          {
            id: "wake_mid",
            emoji: "⏰",
            label: "I fall asleep fine but wake up at 3am",
            nextId: "tried_before",
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
            nextId: "tried_before",
          },
          {
            id: "scattered",
            emoji: "🌪️",
            label: "Scattered, my attention is everywhere",
            nextId: "tried_before",
          },
          {
            id: "flat",
            emoji: "🫥",
            label: "A bit flat, not bad not great, just there",
            nextId: "tried_before",
          },
          {
            id: "okay",
            emoji: "🌤️",
            label: "Actually okay, just want to stay that way",
            nextId: "tried_before",
          },
        ],
      },

      // ── Q3: What they've tried (sets up the failure reframe) ─────────
      {
        kind: "single_choice",
        id: "tried_before",
        question: "What have you already tried?",
        subtext:
          "Be honest. This answer shapes your plan more than any other.",
        reassurance:
          "Good to know. If those didn't stick, it's not on you. You'll see why in a moment.",
        options: [
          {
            id: "apps",
            emoji: "🧘",
            label: "Meditation apps like Calm or Headspace",
          },
          {
            id: "videos",
            emoji: "🫁",
            label: "Breathing exercises from YouTube or TikTok",
          },
          {
            id: "other",
            emoji: "🍵",
            label: "Supplements, teas, white noise, you name it",
          },
          {
            id: "nothing",
            emoji: "🌱",
            label: "Nothing yet, this is my first real try",
          },
        ],
      },

      // ── INFO 1a + 1b: Failure reframe (why what you tried didn't work) ─
      {
        kind: "info",
        id: "failure_reframe",
        icon: "🧘",
        visual: "fading_streak",
        title: "It's not a discipline problem",
        body:
          "Meditation and breathing apps ask you to close your eyes and " +
          "trust that something is happening. You never see proof, so by " +
          "day four most people quit.",
      },
      {
        kind: "info",
        id: "open_loop",
        icon: "🔁",
        visual: "open_vs_closed_loop",
        title: "Scientists call it an open loop",
        body:
          "No feedback means your brain never gets a reward, and the habit " +
          "never forms. Closing the loop changes everything.",
      },

      // ── Q4: Self-care frequency ───────────────────────────────────────
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

      // ── Q5: Peaceful moment ───────────────────────────────────────────
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

      // ── INFO 2a + 2b: The mechanism + accuracy proof ─────────────────
      {
        kind: "info",
        id: "mechanism",
        icon: "📱",
        title: "Meet Heart-Guided Breathing",
        body:
          "Rest a fingertip on your camera and the Azora app reads your " +
          "pulse with PPG, the same light-based technology inside hospital " +
          "pulse oximeters. No wearable, just your phone and the app. " +
          "Watch it work:",
        youtubeId: "KF36b_HjKW4",
      },
      {
        kind: "info",
        id: "accuracy_proof",
        icon: "🎓",
        visual: "ppg_vs_ecg",
        title: "Verified accuracy",
        body:
          "PPG heart rate measurement has been validated against medical " +
          "ECG in peer-reviewed studies. Azora uses the same science and " +
          "reads within 2% of medical-grade devices.",
        institutions: [
          "MIT Media Lab",
          "Stanford Medicine",
          "University Hospital Zurich",
        ],
        citation:
          "Poh et al., Optics Express (2010) · Shcherbina et al., J. Pers. Med. (2017) · Coppetti et al., Eur. J. Prev. Cardiol. (2017)",
      },

      // ── INFO 3a + 3b: Personal bridge — connects the symptom they
      // described to the PPG science they just learned, without quoting
      // their answer back. Screen 1: the feeling is a real, measurable
      // nervous-system state. Screen 2: Azora's camera makes it visible.
      {
        kind: "info",
        id: "stress_signature",
        icon: "🫀",
        visual: "stress_signature",
        title: "That feeling has a signature",
        body:
          "Racing mind, tight chest, restless nights — they all trace back " +
          "to a nervous system stuck on high alert. And it's written in " +
          "your heartbeat.",
      },
      {
        kind: "info",
        id: "signature_visible",
        icon: "📷",
        visual: "camera_ppg",
        title: "Azora makes it visible",
        body:
          "Rest a fingertip on your camera and that signature appears on " +
          "screen. What you could only feel becomes a number you can " +
          "watch — and change.",
      },

      // ── INFO 4: Live feedback (vagus nerve + real-time heart rate) ───
      {
        kind: "info",
        id: "live_feedback",
        icon: "💓",
        visual: "hr_falling",
        title: "Watch your heart rate fall, live",
        body:
          "Guided exhales activate the vagus nerve, your body's natural off " +
          "switch for stress, while the number drops on your screen. Proof, " +
          "in your very first session in the app.",
      },

      // ── Q6: Session length ────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "calm_duration",
        question: "How long do you need to feel truly calmed?",
        subtext:
          "Even 2 minutes of paced breathing shifts your nervous system. " +
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

      // ── Q7: Body signals ──────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "body_signal",
        question: "How does your body tell you it needs a reset?",
        subtext:
          "Before your mind registers stress, your heart has already spoken. " +
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

      // ── Q8: What blocks the reset (skeptics get answered next) ───────
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

      // ── INFO 5: Social proof ──────────────────────────────────────────
      {
        kind: "info",
        id: "social_proof",
        icon: "🔥",
        visual: "stat_ring",
        title: "Calm is a habit, not a one-off",
        body:
          "A few minutes a day is what moves the numbers, and seeing your " +
          "heart respond is what keeps you coming back. The app keeps your " +
          "streak going, and 94% of members report lower stress within 2 weeks.",
      },

      // ── Building interstitial ──────────────────────────────────────────
      {
        kind: "interstitial",
        id: "building",
        title: "Calibrating your Heart-Guided Breathing plan…",
        body: "Matching your breath pacing to your goal, your schedule, and your rhythm.",
      },

      // ── Result ────────────────────────────────────────────────────────
      {
        kind: "result",
        id: "result",
        title: "Your plan is ready",
        body:
          "A daily Heart-Guided Breathing plan tuned to your goal, your " +
          "schedule, and the way stress shows up in your body. Your sessions " +
          "happen in the Azora app on your phone.",
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
          "Keeps your personalized Heart-Guided Breathing plan",
          "Links your subscription to your account",
          "Unlocks your plan in the iOS app, where your daily sessions happen",
        ],
      },

      // ── Offer ─────────────────────────────────────────────────────────
      {
        kind: "offer",
        id: "offer",
        title: "Try Azora for free",
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
