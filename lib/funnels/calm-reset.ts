import type { FunnelConfig } from "./types";

// Calm Reset funnel structure, built on the "unique mechanism" pattern: the
// user's problem stays the goal (stress / sleep / focus), and camera-PPG
// biofeedback breathing ("Heart-Guided Breathing") is the named mechanism
// that solves all of them.
//
// Questions and info screens are interleaved so the user never sits through
// more than two info screens in a row — info pairs stay together
// conceptually but are broken up by a question to keep momentum:
//   goal + branch + tried_before → failure-reframe pair → me_time →
//   mechanism + accuracy proof → peace_time → calm_duration → live feedback →
//   body_signal → reset_blocker → social proof → building interstitial →
//   result → account → offer
//
// Branching: goal (stress / sleep / general) → 1 branch follow-up → joins the
// common path at `tried_before`. Info screens are intentional stops with a
// visual + Continue button; the building interstitial auto-advances.
//
// The accuracy info screen cites real published PPG validation studies
// (citation strings below). Institution names render as text wordmarks, not
// logos — clear trademark/endorsement review before using actual logo marks.

export const calmResetFunnel: FunnelConfig = {
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
        body: "Most apps ask you to trust the process. This gives you live feedback.",
      },
      {
        kind: "info",
        id: "open_loop",
        icon: "🔁",
        visual: "open_vs_closed_loop",
        title: "Close the loop",
        body: "Your brain sticks with habits when it can see a clear reward.",
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

      // ── INFO 2a + 2b: The mechanism + accuracy proof ─────────────────
      {
        kind: "info",
        id: "mechanism",
        icon: "📱",
        title: "Meet Heart-Guided Breathing",
        body: "Rest a fingertip on your camera and watch your pulse respond.",
        youtubeId: "KF36b_HjKW4",
      },
      {
        kind: "info",
        id: "accuracy_proof",
        icon: "🎓",
        visual: "ppg_vs_ecg",
        title: "Verified accuracy",
        body: "Azora uses camera PPG, a light-based heart-rate method validated against ECG.",
        institutions: [
          "MIT Media Lab",
          "Stanford Medicine",
          "University Hospital Zurich",
        ],
        citation:
          "Poh et al., Optics Express (2010) · Shcherbina et al., J. Pers. Med. (2017) · Coppetti et al., Eur. J. Prev. Cardiol. (2017)",
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

      // ── INFO 4: Live feedback (vagus nerve + real-time heart rate) ───
      {
        kind: "info",
        id: "live_feedback",
        icon: "💓",
        visual: "hr_falling",
        title: "Watch your heart rate fall, live",
        body: "Guided exhales help your body downshift while the number drops on screen.",
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

      // ── INFO: Backed by leading institutions (dedicated logo screen) ──
      // Reusable "backed by" social-proof screen — same data shape as the
      // breathhold funnel, so it drops into any future funnel unchanged.
      {
        kind: "info",
        id: "backed_by",
        icon: "🎓",
        title: "Built on science from leading institutions",
        body: "Heart-Guided Breathing draws on heart-rate and nervous-system research studied at places like these.",
        logos: [
          { src: "/standford.png", alt: "Stanford" },
          { src: "/harvard.png", alt: "Harvard" },
        ],
      },

      // ── INFO 5: Social proof ──────────────────────────────────────────
      {
        kind: "info",
        id: "social_proof",
        icon: "🔥",
        visual: "stat_ring",
        title: "Calm is a habit, not a one-off",
        body: "A few minutes a day works best when you can see your body responding.",
      },

      // ── Profile fields, delayed until the plan has value ──────────────
      {
        kind: "single_choice",
        id: "gender",
        question: "To tune the plan, how do you identify?",
        subtext: "Optional, but it helps us personalize your recommendations.",
        options: [
          { id: "female", emoji: "♀️", label: "Female" },
          { id: "male", emoji: "♂️", label: "Male" },
          { id: "nonbinary", emoji: "⚧️", label: "Non-binary" },
          { id: "unspecified", emoji: "🤍", label: "Prefer not to say" },
        ],
      },
      {
        kind: "single_choice",
        id: "age",
        question: "What age range are you in?",
        subtext: "Your nervous system shifts with age, so we'll match the reset to you.",
        options: [
          { id: "18_24", label: "18–24" },
          { id: "25_34", label: "25–34" },
          { id: "35_44", label: "35–44" },
          { id: "45_54", label: "45–54" },
          { id: "55_plus", label: "55+" },
        ],
      },
      {
        kind: "text_input",
        id: "name",
        question: "What should we call you?",
        subtext: "We'll use your name on the plan we build next.",
        placeholder: "Your first name",
        maxLength: 30,
      },

      // ── Building interstitial ──────────────────────────────────────────
      {
        kind: "interstitial",
        id: "building",
        title: "Calibrating your Heart-Guided Breathing plan, {{name}}…",
        body: "Matching your breath pacing to your goal, your schedule, and your rhythm.",
        loadingItems: [
          "Reading your stress pattern",
          "Tuning your breath pace",
          "Matching your reset window",
          "Preparing your in-app trial plan",
        ],
      },

      // ── Result ────────────────────────────────────────────────────────
      // Acceptance framing ("you qualify"), not delivery framing ("here's
      // your product") — the user is approved for something, not sold to.
      {
        kind: "result",
        id: "result",
        title: "{{name}}, you're a match for Heart-Guided Breathing",
        body:
          "Based on your answers, the way stress shows up for you is " +
          "exactly what live heart-rate biofeedback is built to catch. " +
          "Your daily plan has been approved and built.",
      },

      // ── Projection: the 2-week trend on its own screen ────────────────
      // Pulled out of the summary so the chart reads as its own beat. Chart
      // data comes from personalization.summary.projection + answers.
      {
        kind: "projection",
        id: "projection",
        title: "Here's where you're headed, {{name}}",
        body: "Your daily resets are built to soften the spikes first, then settle your baseline.",
      },

      // ── Summary: personalized plan recap ──────────────────────────────
      // Commitment anchor before the paywall: restates the user's own answers
      // as a concrete plan and contrasts it with what they've already tried —
      // turning data collection into proof the app understood them.
      {
        kind: "summary",
        id: "summary",
        title: "Here's your Heart-Guided Breathing plan, {{name}}",
        body: "Built from your answers. This is the daily reset we'll set up for you.",
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

    // Everything the runner personalizes from answers, plus the funnel-specific
    // offer copy. See FunnelPersonalization in types.ts for the template syntax.
    personalization: {
      analyticsSegments: {
        // Demographics for cohort analysis. `name` is intentionally excluded
        // (PII shouldn't flow to PostHog).
        gender: ["gender"],
        age: ["age"],
        goal: ["goal"],
        branch_answer: ["stress_body", "sleep_mind", "general_feel"],
        tried_before: ["tried_before"],
        me_time: ["me_time"],
        peace_time: ["peace_time"],
        calm_duration: ["calm_duration"],
        body_signal: ["body_signal"],
        reset_blocker: ["reset_blocker"],
      },
      shortAnswers: {
        goal: {
          stress: "a calmer mind",
          sleep: "deeper sleep",
          wellness: "feeling better overall",
          focus: "sharper focus",
          explore: "a calmer mind",
        },
        calm_duration: {
          two_min: "2-minute",
          five_min: "5-minute",
          ten_min: "10-minute",
        },
        peace_time: {
          morning: "morning",
          midday: "midday",
          evening: "evening",
          late: "late-night",
        },
        body_signal: {
          shallow: "shallow breathing",
          heart: "a racing heart",
          tight: "tense shoulders and jaw",
          fatigue: "sudden fatigue",
        },
        // Phrased for the "closes the loop" comparison line on the summary.
        tried_before: {
          apps: "Meditation apps",
          videos: "Breathing videos",
          other: "Supplements and teas",
        },
      },
      summary: {
        planRows: [
          { label: "Your goal", value: "{{goal:short|a calmer mind}}" },
          {
            label: "Daily reset",
            value:
              "{{calm_duration:short|5-minute}} session, {{peace_time:short|daily}}",
          },
          // Omitted when body_signal is unanswered (general/sleep branches).
          { label: "Tuned for", value: "{{body_signal:short}}" },
          { label: "How it works", value: "Live camera heart-rate biofeedback" },
        ],
        projection: {
          title: "Your stress response",
          stepId: "goal",
          endLabels: {
            stress: "Calm",
            sleep: "Rested",
            wellness: "Balanced",
            focus: "Clear",
            explore: "Calm",
          },
          fallbackEndLabel: "Calm",
          planLabel: "Azora",
          comparisonLabel: "Unguided",
          startLabel: "Today",
          endLabel: "Day 14",
          caption: ["Daily feedback helps", "keep progress from fading."],
        },
        // First-session claim is observable in-app; keep the 2-week claim soft
        // ("calmer baseline"), not medical.
        prediction: {
          kicker: "Based on your answers",
          text:
            "We predict you'll watch your heart rate fall in your very first " +
            "session — and feel a calmer baseline by **{{projection_date}}** " +
            "with your {{calm_duration:short|5-minute}} {{peace_time:short|daily}} resets.",
        },
        compare:
          "**{{tried_before:short}}** gave you no feedback, so the habit " +
          "never stuck. Your plan closes the loop — you'll watch it working " +
          "from day one.",
      },
      offer: {
        // Paywall headline personalized to the goal picked in Q1. Falls back to
        // the step's generic title when the answer is missing (e.g. post-OAuth
        // resume, where local answer state resets).
        headline: {
          stepId: "goal",
          byAnswer: {
            stress: "Your plan for a calmer mind is ready",
            sleep: "Your plan for deeper sleep is ready",
            wellness: "Your plan to feel better every day is ready",
            focus: "Your plan for sharper focus is ready",
          },
        },
        body:
          "Try it free in the app. Built around a daily " +
          "{{calm_duration:short}} {{peace_time:short}} reset.",
        anchorNote: "Everything a $300 wearable does — with just your phone.",
        trialTimeline: [
          {
            day: "Today",
            text:
              "Download the app, sign in, and watch your heart rate fall in " +
              "your first session",
          },
          {
            day: "Day 5",
            text: "Your daily streak builds and your stress trends take shape",
          },
          {
            day: "Day 7",
            text: "Trial ends. Cancel anytime before and pay nothing",
          },
        ],
        // Accuracy credibility: PPG validation, peer-reviewed sources.
        validation: {
          line: "Heart rate via PPG, validated against ECG in peer-reviewed research",
          sources: "MIT Media Lab · Stanford Medicine · University Hospital Zurich",
        },
        // PLACEHOLDER social proof — replace with real, verifiable customer
        // reviews before running paid traffic. Fabricated testimonials in ads
        // are an FTC / ad-platform compliance risk; wireframe copy only.
        testimonials: [
          {
            name: "Maya R.",
            meta: "Member since 2025",
            text:
              "Watching my heart rate actually drop on screen is the first " +
              "thing that's ever made breathing exercises stick for me.",
          },
          {
            name: "James T.",
            meta: "Verified subscriber",
            text:
              "Two weeks in and my 3am wake-ups have basically stopped. " +
              "Seeing the streak build keeps me honest.",
          },
          {
            name: "Priya N.",
            meta: "Member since 2025",
            text:
              "I've tried every meditation app out there. This is the only " +
              "one where I can actually see it working.",
          },
        ],
      },
    },
  };
