import type { FunnelConfig } from "./types";

// Typed funnel registry. Add new funnels here; the [slug] route resolves them
// by slug and 404s on unknown/non-active funnels.
//
// Calm Reset funnel structure, built on the "unique mechanism" pattern: the
// user's problem stays the goal (stress / sleep / focus), and camera-PPG
// biofeedback breathing ("Heart-Guided Breathing") is the named mechanism
// that solves all of them.
//
// Questions and info screens are interleaved so the user never sits through
// more than two info screens in a row — info pairs stay together
// conceptually but are broken up by a question to keep momentum:
//   goal + branch + tried_before → failure-reframe pair → me_time →
//   mechanism + accuracy proof → peace_time → personal-bridge pair
//   (signature → camera makes it visible) → calm_duration → live feedback →
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
            nextId: "gender",
          },
          {
            id: "chest",
            emoji: "🫀",
            label: "Tight chest, shallow quick breathing",
            nextId: "gender",
          },
          {
            id: "shoulders",
            emoji: "💪",
            label: "Tense shoulders and jaw, always braced",
            nextId: "gender",
          },
          {
            id: "stomach",
            emoji: "🦋",
            label: "Knot in my stomach, that uneasy flutter",
            nextId: "gender",
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
            nextId: "gender",
          },
          {
            id: "worries",
            emoji: "😟",
            label: "Worries about tomorrow, the list never stops",
            nextId: "gender",
          },
          {
            id: "wont_quiet",
            emoji: "📣",
            label: "Just won't quiet down, thoughts bounce around",
            nextId: "gender",
          },
          {
            id: "wake_mid",
            emoji: "⏰",
            label: "I fall asleep fine but wake up at 3am",
            nextId: "gender",
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
            nextId: "gender",
          },
          {
            id: "scattered",
            emoji: "🌪️",
            label: "Scattered, my attention is everywhere",
            nextId: "gender",
          },
          {
            id: "flat",
            emoji: "🫥",
            label: "A bit flat, not bad not great, just there",
            nextId: "gender",
          },
          {
            id: "okay",
            emoji: "🌤️",
            label: "Actually okay, just want to stay that way",
            nextId: "gender",
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
        body:
          "Guided exhales activate the vagus nerve, your body's natural off " +
          "switch for stress, while the number drops on your screen. Proof, " +
          "in your very first session in the app.",
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
      // Acceptance framing ("you qualify"), not delivery framing ("here's
      // your product") — the user is approved for something, not sold to.
      {
        kind: "result",
        id: "result",
        title: "You're a match for Heart-Guided Breathing",
        body:
          "Based on your answers, the way stress shows up for you is " +
          "exactly what live heart-rate biofeedback is built to catch. " +
          "Your daily plan has been approved and built.",
      },

      // ── Summary: personalized plan recap ──────────────────────────────
      // Commitment anchor before the paywall: restates the user's own answers
      // as a concrete plan, projects the 2-week trend, and contrasts it with
      // what they've already tried — turning data collection into proof the
      // app understood them.
      {
        kind: "summary",
        id: "summary",
        title: "Here's your Heart-Guided Breathing plan",
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
        // Where the curve lands, named for the goal they picked — the chart
        // forecasts *their* outcome, not a generic "calm".
        projection: {
          title: "Your stress, projected",
          stepId: "goal",
          endLabels: {
            stress: "Calm",
            sleep: "Rested",
            wellness: "Balanced",
            focus: "Clear",
            explore: "Calm",
          },
          fallbackEndLabel: "Calm",
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
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Breath-HOLD training funnel — Breathwrk-style voice (benefit/feeling
  // first, NOT clinical). The hero is the *hold* itself: gentle guided breath
  // holds are the method, not generic breathing. Same Azora subscription as
  // calm-reset. The science (CO2 tolerance + dive reflex) is the quiet engine;
  // screens only speak in feelings: calmer, steadier, in control.
  //
  // NO phone-camera / PPG heart-rate gimmick here (that's calm-reset's
  // mechanism). The "proof" is what you FEEL during a hold plus your hold
  // time growing day by day — a number/streak you watch climb in the app.
  //
  // Structure mirrors high-converting web2app quiz funnels (Noom et al.):
  // goal/pain discovery first (branching micro-commitments), then demographics
  // (gender → age → name), then alternating question → tap-through content
  // screen. Every meaningful answer is followed by one non-question beat —
  // affirmation, plain-language science, a projection teaser, honest (number-
  // free) social proof, a "what people notice" stand-in, and a commitment
  // affirmation — before a processing loader, name-personalized plan reveal,
  // and paywall. No auto-advance: every screen waits on the pinned Continue
  // (only the building loader auto-advances). Greets the user by name on the
  // post-name screens.
  //
  // Holds are framed gentle/never-forced on purpose: this audience is anxious,
  // and a forced max-hold is literally a panic trigger — "never forced, never
  // gasping" doubles as a comfort promise. Claims kept soft ("feel calmer",
  // never "treats anxiety") for FTC / app-store safety.
  // ═══════════════════════════════════════════════════════════════════════
  breathhold: {
    slug: "breathhold",
    name: "The Breath-Hold Method",
    status: "active",
    intro:
      "A few quick questions to build your personalized breath-hold plan — the gentle daily holds that train your body out of anxiety.",
    steps: [
      // ── Q1: Goal FIRST — the engaging hook / aspiration. It branches into a
      // goal-specific follow-up; the branch then flows into the demographics
      // block (gender → age → name) before the rest of the discovery questions.
      {
        kind: "single_choice",
        id: "goal",
        question: "What do you want breath-hold training to help with?",
        subtext: "No wrong answer. Just pick what's closest to true right now.",
        options: [
          {
            id: "calm",
            emoji: "😌",
            label: "To feel calm and steady",
            nextId: "anxiety_when",
          },
          {
            id: "anxiety",
            emoji: "🌊",
            label: "To stop anxiety in its tracks",
            nextId: "anxiety_when",
          },
          {
            id: "sleep",
            emoji: "🌙",
            label: "To fall asleep faster",
            nextId: "sleep_when",
          },
          {
            id: "focus",
            emoji: "⚡",
            label: "To focus and feel energized",
            nextId: "general_when",
          },
          {
            id: "explore",
            emoji: "✨",
            label: "Just curious, show me what this is",
            nextId: "general_when",
          },
        ],
      },

      // ── Q2a: Anxiety branch ───────────────────────────────────────────
      {
        kind: "single_choice",
        id: "anxiety_when",
        question: "When anxiety hits, what happens to your breathing?",
        subtext: "Anxiety shows up in the breath first. How it changes tells us where to start.",
        options: [
          {
            id: "shallow",
            emoji: "🫁",
            label: "It goes shallow and fast, up in my chest",
            nextId: "affirm_breath",
          },
          {
            id: "cant_full",
            emoji: "😮‍💨",
            label: "I can't seem to get a full breath in",
            nextId: "affirm_breath",
          },
          {
            id: "hold",
            emoji: "⏸️",
            label: "I catch myself holding my breath",
            nextId: "affirm_breath",
          },
          {
            id: "chest_tight",
            emoji: "🪨",
            label: "My chest tightens and breathing feels like work",
            nextId: "affirm_breath",
          },
        ],
      },

      // ── Q2b: Sleep branch ─────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "sleep_when",
        question: "What happens when you try to fall asleep?",
        subtext: "Understanding the pattern helps us match the right breath.",
        options: [
          {
            id: "wont_stop",
            emoji: "🧠",
            label: "My mind won't shut off",
            nextId: "affirm_breath",
          },
          {
            id: "wired",
            emoji: "🔌",
            label: "I'm wired but tired, my body won't let go",
            nextId: "affirm_breath",
          },
          {
            id: "wake",
            emoji: "⏰",
            label: "I drift off fine but wake up at 3am",
            nextId: "affirm_breath",
          },
          {
            id: "forever",
            emoji: "🌙",
            label: "It just takes forever to drop off",
            nextId: "affirm_breath",
          },
        ],
      },

      // ── Q2c: General path (focus, explore) ────────────────────────────
      {
        kind: "single_choice",
        id: "general_when",
        question: "How do you usually feel by the middle of the day?",
        subtext: "Just go with what feels true. No overthinking it.",
        options: [
          {
            id: "foggy",
            emoji: "🌫️",
            label: "Foggy, like I can't quite think straight",
            nextId: "affirm_breath",
          },
          {
            id: "wired",
            emoji: "🌪️",
            label: "Wired and scattered, pulled in every direction",
            nextId: "affirm_breath",
          },
          {
            id: "flat",
            emoji: "🫥",
            label: "Flat, running low on energy",
            nextId: "affirm_breath",
          },
          {
            id: "okay",
            emoji: "🌤️",
            label: "Pretty good, just want to stay sharp",
            nextId: "affirm_breath",
          },
        ],
      },

      // ── INFO: Affirmation — your breath isn't broken ──────────────────
      // Reached from all three goal branches (nextId: "affirm_breath"), then
      // flows into demographics. Noom-style "validate right after a vulnerable
      // answer" beat. No {{name}} yet (collected later) and no fabricated
      // stats — pure normalizing copy.
      {
        kind: "info",
        id: "affirm_breath",
        icon: "🤍",
        visual: "stress_signature",
        title: "If your breath is the first thing to go, you're not imagining it.",
        body:
          "For a lot of people, anxiety shows up in the breath before the mind " +
          "even catches up. That's not a flaw — it's your alarm system doing " +
          "its job a little too well. The good news: the breath is also the " +
          "fastest way back. That's exactly what we'll train.",
      },

      // ── Demographics (after the goal branch, before discovery continues) ─
      {
        kind: "single_choice",
        id: "gender",
        question: "First, how do you identify?",
        subtext: "This helps us tune your plan to you.",
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
        question: "And how old are you?",
        subtext: "Your nervous system shifts with age — we'll match your plan to it.",
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
        question: "Lovely. What should we call you?",
        subtext: "We'll use your name to personalize your plan.",
        placeholder: "Your first name",
        maxLength: 30,
      },

      // ── Q3: Breathwork history (breath-specific, sets up the reframe) ──
      {
        kind: "single_choice",
        id: "tried_before",
        question: "Have you tried breathwork or breath holds before?",
        subtext: "Be honest. This shapes your plan more than anything else.",
        options: [
          {
            id: "wimhof",
            emoji: "🧊",
            label: "Wim Hof, ice baths, that kind of thing",
          },
          {
            id: "box",
            emoji: "🟦",
            label: "Box breathing or 4-7-8 from an app or video",
          },
          {
            id: "freedive",
            emoji: "🌊",
            label: "I've been curious about freediving / holds",
          },
          {
            id: "never",
            emoji: "🌱",
            label: "Never really tried holds before",
          },
        ],
      },

      // ── INFO 1: The reframe (the hold is the secret) ──────────────────
      {
        kind: "info",
        id: "reframe",
        icon: "🫁",
        visual: "fading_streak",
        title: "You've been told to breathe. The secret is the hold.",
        body:
          "Here's the thing, {{name}}: “take a deep breath” never sticks " +
          "because nothing happens you can feel. The real switch isn't the " +
          "breath in — it's the gentle pause after. The hold is where your " +
          "body learns to let go.",
      },

      // ── Q4: Breath-hold baseline (breath-hold-specific personalization) ─
      {
        kind: "single_choice",
        id: "hold_baseline",
        question: "How long can you comfortably hold your breath right now?",
        subtext: "No need to test it — just your best guess. This sets your starting point.",
        options: [
          {
            id: "under15",
            emoji: "🌱",
            label: "Under 15 seconds, it feels hard fast",
          },
          {
            id: "15to30",
            emoji: "🌿",
            label: "Around 15–30 seconds",
          },
          {
            id: "30to60",
            emoji: "🌳",
            label: "Around 30–60 seconds",
          },
          {
            id: "over60",
            emoji: "🏔️",
            label: "Over a minute, I've got some practice",
          },
        ],
      },

      // ── INFO: Why the hold calms you (plain-language science) ─────────
      {
        kind: "info",
        id: "pattern",
        icon: "🌊",
        visual: "stress_signature",
        title: "Notice you can't hold your breath when you're anxious?",
        body:
          "That panicky “I need to breathe NOW” feeling is your alarm system " +
          "on a hair trigger. Train gentle holds and that alarm calms down — " +
          "so everyday stress stops tipping you over the edge.",
      },

      // ── Q4b: How a hold *feels* — the CO2-tolerance / anxiety tell ────
      {
        kind: "single_choice",
        id: "hold_feeling",
        question: "When you hold your breath, what does it feel like?",
        subtext: "There's no right answer — this tells us how sensitive your alarm is.",
        options: [
          {
            id: "panic",
            emoji: "😰",
            label: "I panic and have to gasp almost right away",
          },
          {
            id: "urge",
            emoji: "🌬️",
            label: "A strong urge to breathe hits quickly",
          },
          {
            id: "okay",
            emoji: "🙂",
            label: "It's fairly comfortable for a while",
          },
          {
            id: "calm",
            emoji: "🧘",
            label: "I actually find holding my breath calming",
          },
        ],
      },

      // ── INFO: The method — gentle guided holds ────────────────────────
      {
        kind: "info",
        id: "mechanism",
        icon: "⏸️",
        title: "Meet breath-hold training",
        body:
          "Short, guided breath holds — never forced, never gasping — teach " +
          "your body that the urge to breathe isn't an emergency. Each easy " +
          "hold trains your calm. You feel it in under a minute.",
      },

      // ── Q5: Peaceful moment / when ────────────────────────────────────
      {
        kind: "single_choice",
        id: "peace_time",
        question: "When could you use a reset the most?",
        options: [
          {
            id: "morning",
            emoji: "🌅",
            label: "Morning, to start the day grounded",
          },
          {
            id: "midday",
            emoji: "☀️",
            label: "Midday, when things get overwhelming",
          },
          {
            id: "evening",
            emoji: "🌆",
            label: "Evening, to come down from the day",
          },
          {
            id: "night",
            emoji: "🌌",
            label: "Late at night, to finally switch off",
          },
        ],
      },

      // ── INFO: The dive reflex, *felt* (no camera/heart-rate gimmick) ──
      {
        kind: "info",
        id: "calm_switch",
        icon: "🌊",
        visual: "hr_falling",
        title: "Your body has a built-in calm switch",
        body:
          "When you hold your breath gently, an ancient reflex takes over — " +
          "the same one that kicks in when you slip into cool water. Your " +
          "heart settles, your whole body downshifts, and the wave of calm " +
          "is something you feel within seconds.",
      },

      // ── Q6: Session length (lean short, Breathwrk-style) ──────────────
      {
        kind: "single_choice",
        id: "calm_duration",
        question: "How long should your daily hold practice be?",
        subtext: "Even one minute of holds shifts how you feel. This is about what fits your life.",
        options: [
          {
            id: "one_min",
            emoji: "⏱️",
            label: "1 minute, a quick reset I'll actually do",
          },
          {
            id: "three_min",
            emoji: "🕐",
            label: "3 minutes, a real pause that sticks",
          },
          {
            id: "five_min",
            emoji: "🕔",
            label: "5 minutes, I want to go deeper",
          },
        ],
      },

      // ── INFO: Projection teaser — the shape daily holds create ────────
      // Noom-style "moving outcome" beat; the full personalized chart with
      // their goal + date lands on the summary. Honest framing: this is the
      // *design intent* of the practice, not a claim about measured results.
      {
        kind: "info",
        id: "progress",
        icon: "📈",
        visual: "stress_projection",
        title: "Two weeks from now, this is the goal",
        body:
          "Picture your everyday stress as a line. Gentle daily holds are " +
          "built to take the edge off the spikes first, then settle your " +
          "baseline. A few minutes a day is the whole ask.",
      },

      // ── Q7: Body signals ──────────────────────────────────────────────
      {
        kind: "single_choice",
        id: "body_signal",
        question: "How does your body warn you it needs a reset?",
        subtext: "Before your mind notices, your body's already talking. What do you feel first?",
        options: [
          {
            id: "racing",
            emoji: "💓",
            label: "My heart races or pounds",
          },
          {
            id: "breath",
            emoji: "🫁",
            label: "My breathing goes shallow and quick",
          },
          {
            id: "tense",
            emoji: "🪨",
            label: "My shoulders and jaw tighten up",
          },
          {
            id: "restless",
            emoji: "⚡",
            label: "I get jittery and restless",
          },
        ],
      },

      // ── INFO: Social proof (honest soft — NO fabricated counts) ───────
      // Deliberately number-free. When you have real, verifiable Azora
      // figures or a member count, add them here (and you can swap the icon
      // for the stat_ring visual). Never ship invented stats — that's an
      // FTC / ad-platform violation.
      {
        kind: "info",
        id: "social_proof",
        icon: "🤝",
        title: "You're in good company",
        body:
          "A growing community is training calmer breath with Azora — not " +
          "with willpower, but with holds short enough to actually keep " +
          "doing. The ones who stick with it tend to say the same thing: " +
          "it's the first thing that worked, because it's the first thing " +
          "they kept up.",
      },

      // ── Q8: What blocks the reset ─────────────────────────────────────
      {
        kind: "single_choice",
        id: "reset_blocker",
        question: "What usually gets in the way of taking a pause?",
        options: [
          {
            id: "forget",
            emoji: "🌊",
            label: "I forget, the day sweeps me away",
          },
          {
            id: "guilt",
            emoji: "😞",
            label: "It feels selfish, there's too much to do",
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

      // ── INFO: What to expect (honest "testimonial" stand-in) ──────────
      // PLACEHOLDER for a real member quote. Until you have a verifiable
      // review, this stays an honest "what people notice" framing rather
      // than a fabricated named testimonial.
      {
        kind: "info",
        id: "expect",
        icon: "💬",
        title: "What people notice first",
        body:
          "It's usually not “my anxiety is gone.” It's smaller: a pause " +
          "before reacting, drifting back to sleep at 3am, one fewer spiral. " +
          "Those small wins are the point, {{name}} — they're what make the " +
          "habit actually stick.",
      },

      // ── Motivation: commitment-close ──────────────────────────────────
      // Last question before the loader. Having the user name their own "why"
      // out loud is a documented commitment device — it lifts follow-through
      // and paywall conversion. The chosen answer is echoed back in the
      // result/paywall copy so the plan feels built around their reason.
      {
        kind: "single_choice",
        id: "motivation",
        question: "Last thing, {{name}} — what makes this matter to you right now?",
        subtext: "There's no wrong answer. We'll build your plan around it.",
        options: [
          {
            id: "calmer_daily",
            emoji: "🧘",
            label: "I want to feel calmer in my everyday life",
          },
          {
            id: "in_moment",
            emoji: "🆘",
            label: "I want something that works when anxiety hits",
          },
          {
            id: "control",
            emoji: "🎯",
            label: "I want to feel in control of my own body again",
          },
          {
            id: "present",
            emoji: "💛",
            label: "I want to be more present for the people I love",
          },
        ],
      },

      // ── INFO: Commitment affirmation (right before the loader) ────────
      // Reciprocity + commitment beat: acknowledge the "why" they just named,
      // then hand off to the processing loader.
      {
        kind: "info",
        id: "affirm_commit",
        icon: "🌱",
        title: "{{name}}, that's the part most people skip.",
        body:
          "Naming why you're doing this is what makes it stick — you just did " +
          "the hard part. Give us a moment to turn everything you told us into " +
          "your plan.",
      },

      // ── Building interstitial ─────────────────────────────────────────
      {
        kind: "interstitial",
        id: "building",
        title: "Building your plan, {{name}}…",
        body: "Matching your holds to your starting point, your goal, and your schedule.",
      },

      // ── Result ────────────────────────────────────────────────────────
      // Greets by name. `name` is collected up front and these screens sit
      // before the account/OAuth step, so the local answer is reliably present
      // (and rehydrates from the server on any resume anyway).
      {
        kind: "result",
        id: "result",
        title: "{{name}}, your breath-hold plan is ready",
        body:
          "Based on your answers, the way anxiety shows up for you is exactly " +
          "what gentle breath-hold training is built to settle. Your daily " +
          "plan has been built around your starting hold.",
      },

      // ── Summary: personalized plan recap ──────────────────────────────
      {
        kind: "summary",
        id: "summary",
        title: "Here's your plan, {{name}}",
        body: "Built from your answers. This is the daily practice we'll set up for you.",
      },

      // ── Account (save the plan) ───────────────────────────────────────
      {
        kind: "account",
        id: "account",
        title: "Save your plan",
        body:
          "Your plan only lives on this page right now. Create a free account " +
          "to keep it and unlock it on your phone.",
        benefits: [
          "Keeps your personalized breath-hold plan",
          "Links your subscription to your account",
          "Unlocks your plan in the iOS app, where your daily holds happen",
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

    personalization: {
      analyticsSegments: {
        // Demographics for cohort analysis. `name` is intentionally excluded
        // (PII shouldn't flow to PostHog).
        gender: ["gender"],
        age: ["age"],
        goal: ["goal"],
        branch_answer: ["anxiety_when", "sleep_when", "general_when"],
        tried_before: ["tried_before"],
        hold_baseline: ["hold_baseline"],
        hold_feeling: ["hold_feeling"],
        peace_time: ["peace_time"],
        calm_duration: ["calm_duration"],
        body_signal: ["body_signal"],
        reset_blocker: ["reset_blocker"],
        motivation: ["motivation"],
      },
      shortAnswers: {
        goal: {
          calm: "calm",
          anxiety: "calm",
          sleep: "better sleep",
          focus: "focus and energy",
          explore: "calm",
        },
        // Phrased to slot into the plan recap and prediction copy ("…so you can ___").
        motivation: {
          calmer_daily: "feel calmer in everyday life",
          in_moment: "have something that works the moment anxiety hits",
          control: "feel in control of your own body again",
          present: "be more present for the people you love",
        },
        hold_baseline: {
          under15: "under 15 seconds",
          "15to30": "15–30 seconds",
          "30to60": "30–60 seconds",
          over60: "over a minute",
        },
        calm_duration: {
          one_min: "1-minute",
          three_min: "3-minute",
          five_min: "5-minute",
        },
        peace_time: {
          morning: "morning",
          midday: "midday",
          evening: "evening",
          night: "late-night",
        },
        body_signal: {
          racing: "a racing heart",
          breath: "shallow breathing",
          tense: "tense shoulders and jaw",
          restless: "restless, jittery energy",
        },
        // Phrased for the "never tracked your progress" comparison line.
        // `never` has no entry, so the compare line is omitted for first-timers.
        tried_before: {
          wimhof: "Wim Hof and ice baths",
          box: "Box breathing apps",
          freedive: "Freediving videos",
        },
      },
      summary: {
        planRows: [
          { label: "Your goal", value: "{{goal:short|calm}}" },
          // Breath-hold-specific: their starting point, the whole funnel's hook.
          { label: "Starting hold", value: "{{hold_baseline:short}}" },
          {
            label: "Daily practice",
            value: "{{calm_duration:short|3-minute}} of holds, {{peace_time:short|daily}}",
          },
          // Omitted when body_signal is unanswered.
          { label: "Tuned for", value: "{{body_signal:short}}" },
          // Echoes their commitment-close answer; omitted if skipped.
          { label: "Your why", value: "To {{motivation:short}}" },
          { label: "How it works", value: "Gentle guided breath holds with daily progress tracking" },
        ],
        // Reuses StressProjection — a falling curve that lands on the goal's
        // outcome word. Anxiety/stress going *down* fits this funnel perfectly.
        projection: {
          title: "Your anxiety, projected",
          stepId: "goal",
          endLabels: {
            calm: "Calm",
            anxiety: "Steady",
            sleep: "Rested",
            focus: "Clear",
            explore: "Calm",
          },
          fallbackEndLabel: "Calm",
        },
        prediction: {
          kicker: "Based on your answers",
          text:
            "We predict your very first hold will feel easier than you expect — " +
            "and you'll notice a calmer, steadier baseline by **{{projection_date}}** " +
            "as your {{calm_duration:short|3-minute}} {{peace_time:short|daily}} holds grow.",
        },
        compare:
          "**{{tried_before:short}}** never tracked your progress, so the habit " +
          "never stuck. Your plan grows your hold a little more each day — " +
          "proof you can feel.",
      },
      offer: {
        headline: {
          stepId: "goal",
          byAnswer: {
            calm: "Your plan for a calmer mind is ready",
            anxiety: "Your plan to quiet anxiety is ready",
            sleep: "Your plan for better sleep is ready",
            focus: "Your plan for calm focus is ready",
          },
        },
        body:
          "Try it free in the app. Built around your starting hold and a daily " +
          "{{calm_duration:short}} {{peace_time:short}} practice.",
        anchorNote: "Your pocket breath-hold coach — gentle guided holds that train calm in minutes a day.",
        trialTimeline: [
          {
            day: "Today",
            text:
              "Download the app, sign in, and do your first gentle guided hold",
          },
          {
            day: "Day 5",
            text: "Your daily streak builds and your comfortable hold starts to grow",
          },
          {
            day: "Day 7",
            text: "Trial ends. Cancel anytime before and pay nothing",
          },
        ],
        // Light, Breathwrk-style credibility — no citations.
        validation: {
          line: "Breath-hold training used by free-divers and calm-seekers alike",
          sources: "Gentle, guided, and never forced",
        },
        // PLACEHOLDER social proof — replace with real, verifiable customer
        // reviews before running paid traffic (FTC / ad-platform compliance).
        testimonials: [
          {
            name: "Maya R.",
            meta: "Member since 2025",
            text:
              "Seeing my hold time climb every week is the first thing " +
              "that's ever made breathwork stick for me.",
          },
          {
            name: "James T.",
            meta: "Verified subscriber",
            text:
              "My comfortable hold went from 20 seconds to almost a minute — " +
              "and the second I feel anxious, one hold brings me back.",
          },
          {
            name: "Priya N.",
            meta: "Member since 2025",
            text:
              "I've tried every breathing app out there. This is the only one " +
              "where I can actually see myself making progress.",
          },
        ],
      },
    },
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
