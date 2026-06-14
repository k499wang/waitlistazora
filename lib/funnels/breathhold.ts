import type { FunnelConfig } from "./types";

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
  // Structure mirrors high-converting web2app quiz funnels: outcome first,
  // then symptom discovery, mechanism, routine fit, and only then profile
  // fields. Every meaningful answer is followed by a short non-question beat
  // when it helps the user understand why the next question matters. The flow
  // avoids front-loading demographics so it feels like a personal plan is being
  // built, not a form being completed.
  //
  // Holds are framed gentle/never-forced on purpose: this audience is anxious,
  // and a forced max-hold is literally a panic trigger — "never forced, never
  // gasping" doubles as a comfort promise. Claims kept soft ("feel calmer",
  // never "treats anxiety") for FTC / app-store safety.
  // ═══════════════════════════════════════════════════════════════════════
export const breathholdFunnel: FunnelConfig = {
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
      // moves straight into the breath-hold baseline. This keeps the quiz in
      // the user's problem/mechanism loop before asking for profile fields.
      {
        kind: "info",
        id: "affirm_breath",
        icon: "🤍",
        visual: "breath_wave",
        title: "Your breath is not broken",
        body: "Anxiety often reaches the breath first. That's exactly where we'll train.",
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
      // Full-bleed photo screen: backgroundImage forces text-only (no icon/
      // visual), so the copy carries it over the image.
      {
        kind: "info",
        id: "pattern",
        icon: "🌊",
        backgroundImage: "/rocks.jpg",
        title: "That urge to breathe is a signal",
        body: "Gentle holds train the alarm to calm down instead of taking over.",
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
        image: { src: "/q1.png", alt: "A person taking a calm, guided breath" },
        title: "Meet breath-hold training",
        body: "Short guided holds. Never forced, never gasping.",
      },

      // ── Q3: Breathwork history (breath-specific, sets up the reframe) ──
      {
        kind: "single_choice",
        id: "tried_before",
        question: "What have you tried before?",
        subtext: "This helps us make the plan feel different from anything that didn't stick.",
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
            label: "Nothing yet, this is my first real try",
          },
        ],
      },

      // ── INFO 1: The reframe (the hold is the secret) ──────────────────
      {
        kind: "info",
        id: "reframe",
        icon: "🫁",
        visual: "fading_streak",
        title: "The secret is the hold",
        body: "The gentle pause is where your body learns to let go.",
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
        backgroundImage: "/sea.jpg",
        title: "Your body has a built-in calm switch",
        body: "A gentle hold helps your body downshift without forcing a bigger breath.",
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
        body: "Daily holds are built to soften the spikes first, then settle your baseline.",
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

      // ── INFO: Backed by leading institutions (dedicated logo screen) ──
      // Reusable "backed by" social-proof screen — the `logos` strip is the
      // hero. Deliberately number-free (no fabricated counts); the claim is
      // only that the *method* is grounded in published research. Drop this
      // shape into any future funnel unchanged.
      {
        kind: "info",
        id: "backed_by",
        icon: "🎓",
        title: "Built on science from leading institutions",
        body: "Breath-hold training draws on respiratory and nervous-system research studied at places like these.",
        logos: [
          { src: "/standford.png", alt: "Stanford" },
          { src: "/harvard.png", alt: "Harvard" },
        ],
      },

      // ── INFO: Social proof (honest soft — NO fabricated counts) ───────
      // Deliberately number-free. When you have real, verifiable Azora
      // figures or a member count, add them here. Never ship invented stats —
      // that's an FTC / ad-platform violation.
      {
        kind: "info",
        id: "social_proof",
        icon: "🤝",
        title: "You're in good company",
        body: "People stick with this because the holds are short enough to keep doing.",
      },

      // ── INFO: What to expect (honest "testimonial" stand-in) ──────────
      // PLACEHOLDER for a real member quote. Until you have a verifiable
      // review, this stays an honest "what people notice" framing rather
      // than a fabricated named testimonial.
      {
        kind: "info",
        id: "expect",
        icon: "💬",
        image: { src: "/q2.png", alt: "A person feeling calmer after a breath-hold session" },
        title: "What people notice first",
        body: "Small wins come first: one calmer pause, one fewer spiral.",
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
        subtext: "Your nervous system shifts with age, so we'll match the ramp to you.",
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
        image: { src: "/q3.png", alt: "A person feeling grounded and committed" },
        title: "{{name}}, that's the part most people skip",
        body: "You named your why. Now we'll turn your answers into a plan.",
      },

      // ── Building interstitial ─────────────────────────────────────────
      {
        kind: "interstitial",
        id: "building",
        title: "Building your plan, {{name}}…",
        body: "Matching your holds to your starting point, your goal, and your schedule.",
        loadingItems: [
          "Calibrating your starting hold",
          "Tuning the daily ramp",
          "Matching your reset timing",
          "Preparing your in-app trial plan",
        ],
      },

      // ── Result ────────────────────────────────────────────────────────
      // Greets by name. `name` is collected before these screens, and they sit
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

      // ── Projection: the 2-week trend on its own screen ────────────────
      // Pulled out of the summary so the chart reads as its own beat. Chart
      // data comes from personalization.summary.projection + answers.
      {
        kind: "projection",
        id: "projection",
        title: "Here's where you're headed, {{name}}",
        body: "Your daily holds are built to soften the spikes first, then settle your baseline.",
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
          "to keep it and start your trial in the app.",
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
        projection: {
          title: "Your anxiety response",
          stepId: "goal",
          endLabels: {
            calm: "Calm",
            anxiety: "Steady",
            sleep: "Rested",
            focus: "Clear",
            explore: "Calm",
          },
          fallbackEndLabel: "Calm",
          planLabel: "Azora",
          comparisonLabel: "Generic",
          startLabel: "Today",
          endLabel: "Day 14",
          caption: ["Short daily holds help", "keep progress building."],
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
          "Start your free trial in the app. Built around your starting hold and a daily " +
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
  };
