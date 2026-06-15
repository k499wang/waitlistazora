import type { FunnelConfig } from "./types";

// Calm Reset funnel structure, built on the "unique mechanism" pattern: the
// user's problem stays the goal (stress / sleep / focus), and camera-PPG
// biofeedback breathing ("Heart-Guided Breathing") is the named mechanism
// that solves all of them.
//
// Two-act structure (diagnose → reveal → solve):
//   ACT 1 — DIAGNOSE: goal + branch + duration → reassurance → severity /
//     impact / triggers + lifestyle questions (me_time, evenings, caffeine,
//     sleep) → tried_before + failure reframe → peace_time / calm_duration /
//     body_signal / reset_blocker → agreement scales → "analyzing" loader →
//     nervous-system ARCHETYPE reveal (the hinge).
//   ACT 2 — SOLVE: the mechanism (camera-PPG Heart-Guided Breathing), proof,
//     a live breathing round, the 2-week projection, then personalization
//     (gender / age / name) → building interstitial → result → summary →
//     account → offer.
//
// Branching: goal → assess_intro carries the branch to the matching "feeling"
// question; all feeling answers rejoin at `duration`. The "analyzing" loader
// branches on goal to the matching archetype, which converges into the solve
// act via nextId. Info screens are intentional stops with a visual + Continue;
// interstitials auto-advance.
//
// The accuracy info screen cites real published PPG validation studies
// (citation strings below). Institution names render as text wordmarks, not
// logos, clear trademark/endorsement review before using actual logo marks.

export const calmResetFunnel: FunnelConfig = {
    slug: "calm-reset",
    name: "Calm Reset",
    status: "active",
    intro:
      "A few quick questions to build your plan. Then watch your own heart rate fall, live, using just your phone's camera.",
    steps: [
      // ════════════════════════ ACT 1 — DIAGNOSE ════════════════════════

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
            nextId: "assess_intro",
          },
          {
            id: "sleep",
            emoji: "🌙",
            label: "I want to sleep deeply",
            nextId: "assess_intro",
          },
          {
            id: "wellness",
            emoji: "✨",
            label: "I want to feel better overall",
            nextId: "assess_intro",
          },
          {
            id: "focus",
            emoji: "🎯",
            label: "I want to sharpen my focus",
            nextId: "assess_intro",
          },
          {
            id: "explore",
            emoji: "🔍",
            label: "I'm just exploring, curious what this is",
            nextId: "assess_intro",
          },
        ],
      },

      // ── SEGUE 1: diagnostic framing for the opening assessment ────────
      // Carries the goal→branch routing so it sits in front of the first
      // "feeling" question it introduces.
      {
        kind: "info",
        id: "assess_intro",
        icon: "🧠",
        title: "Your nervous system holds the key",
        body: "How calm and rested you feel comes down to the state of your nervous system. Next, a few quick questions to read where yours is right now, so we can see exactly what's standing between you and deep calm.",
        branch: {
          on: "goal",
          to: {
            stress: "stress_body",
            sleep: "sleep_mind",
            wellness: "general_feel",
            focus: "general_feel",
            explore: "general_feel",
          },
        },
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
            nextId: "duration",
          },
          {
            id: "chest",
            emoji: "🫀",
            label: "Tight chest, shallow quick breathing",
            nextId: "duration",
          },
          {
            id: "shoulders",
            emoji: "💪",
            label: "Tense shoulders and jaw, always braced",
            nextId: "duration",
          },
          {
            id: "stomach",
            emoji: "🦋",
            label: "Knot in my stomach, that uneasy flutter",
            nextId: "duration",
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
            nextId: "duration",
          },
          {
            id: "worries",
            emoji: "😟",
            label: "Worries about tomorrow, the list never stops",
            nextId: "duration",
          },
          {
            id: "wont_quiet",
            emoji: "📣",
            label: "Just won't quiet down, thoughts bounce around",
            nextId: "duration",
          },
          {
            id: "wake_mid",
            emoji: "⏰",
            label: "I fall asleep fine but wake up at 3am",
            nextId: "duration",
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
            nextId: "duration",
          },
          {
            id: "scattered",
            emoji: "🌪️",
            label: "Scattered, my attention is everywhere",
            nextId: "duration",
          },
          {
            id: "flat",
            emoji: "🫥",
            label: "A bit flat, not bad not great, just there",
            nextId: "duration",
          },
          {
            id: "okay",
            emoji: "🌤️",
            label: "Actually okay, just want to stay that way",
            nextId: "duration",
          },
        ],
      },

      // ── Q2.5: How long they've been dealing with it ─────────────────
      {
        kind: "single_choice",
        id: "duration",
        question: "How long has this been weighing on you?",
        subtext: "However long it's been, you're in the right place now.",
        options: [
          { id: "weeks", emoji: "🌱", label: "Just recently, the last few weeks" },
          { id: "months", emoji: "🍂", label: "A few months now" },
          { id: "year", emoji: "🗓️", label: "About a year" },
          { id: "years", emoji: "⏳", label: "Years, it feels like forever" },
        ],
      },

      // ── RECAP: reflect their goal + duration back with reassurance ────
      {
        kind: "info",
        id: "reflect_understood",
        icon: "🤝",
        title: "You're in good hands",
        body: "Whatever's been weighing on you, you're far from alone. Here's what members say after a couple of weeks:",
        rating: { score: "5.0", stars: 5, count: "" },
        reviews: [
          {
            quote:
              "I reach for Azora the moment I feel my chest tighten. Watching my heart rate drop in real time is **weirdly addictive**, and it actually calms me down.",
            name: "Maya R.",
            stars: 5,
          },
          {
            quote:
              "Three minutes before bed and I'm out. First thing that's worked for my racing mind in years.",
            name: "Daniel K.",
            stars: 5,
          },
        ],
      },

      // ── Q: Severity (how much it takes over) ──────────────────────────
      {
        kind: "single_choice",
        id: "severity",
        question: "When your stress peaks, how much does it take over?",
        subtext: "There's no wrong answer. This tells us how much support to build in.",
        options: [
          { id: "mild", emoji: "🌤️", label: "I notice it but can push through" },
          { id: "nagging", emoji: "🌥️", label: "It nags at me in the background all day" },
          { id: "hard", emoji: "🌧️", label: "It's hard to focus on anything else" },
          { id: "takeover", emoji: "⛈️", label: "It completely takes over" },
        ],
      },

      // ── Q: Life impact (what it's costing them) ───────────────────────
      {
        kind: "single_choice",
        id: "life_impact",
        question: "Where is it costing you the most right now?",
        subtext: "Knowing what it touches most helps us aim your plan.",
        options: [
          { id: "sleep", emoji: "😴", label: "My sleep" },
          { id: "focus", emoji: "🎯", label: "Focus and work" },
          { id: "mood", emoji: "❤️", label: "My mood and relationships" },
          { id: "energy", emoji: "🔋", label: "My energy" },
        ],
      },

      // ── Q: Triggers (what sets it off) ────────────────────────────────
      {
        kind: "single_choice",
        id: "triggers",
        question: "What sets it off most?",
        subtext: "Spotting your trigger helps us time your resets for when you need them.",
        options: [
          { id: "work", emoji: "💼", label: "Work and deadlines" },
          { id: "money", emoji: "💸", label: "Money and the future" },
          { id: "people", emoji: "👥", label: "People and relationships" },
          { id: "nothing", emoji: "🌫️", label: "No clear trigger, it's just there" },
        ],
      },

      // ── INFO: warm reassurance after the heavy diagnosis cluster ──────
      // The "we've got you" exhale right after severity / impact / triggers,
      // before the lighter lifestyle questions. Mirrors breathhold's
      // `reassure_fit`.
      {
        kind: "info",
        id: "reassure_fit",
        icon: "🫶",
        title: "We've got you from here",
        body: "However it's showing up, you're in good hands. A daily reset is a perfect fit for what you're dealing with, and we'll build it around you, one calm breath at a time.",
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

      // ── Q: Evenings / wind-down (lifestyle) ───────────────────────────
      {
        kind: "single_choice",
        id: "evenings",
        question: "What do your evenings usually look like?",
        subtext: "How you wind down shapes how your nervous system settles for the night.",
        options: [
          { id: "scroll", emoji: "📱", label: "Scrolling my phone in bed" },
          { id: "work_late", emoji: "💻", label: "Working or answering messages late" },
          { id: "tv", emoji: "📺", label: "TV to try to switch off" },
          { id: "awake", emoji: "🌙", label: "Lying awake, mind still going" },
        ],
      },

      // ── Q: Caffeine (lifestyle) ───────────────────────────────────────
      {
        kind: "single_choice",
        id: "caffeine",
        question: "How's your caffeine through the day?",
        subtext: "Caffeine keeps your system primed, so it's useful for us to know.",
        options: [
          { id: "high", emoji: "☕", label: "A lot, and often late in the day" },
          { id: "moderate", emoji: "🍵", label: "Moderate, mostly mornings" },
          { id: "low", emoji: "🚫", label: "Little to none" },
          { id: "untracked", emoji: "🤷", label: "Honestly, I don't track it" },
        ],
      },

      // ── Q: Sleep quality (lifestyle) ──────────────────────────────────
      {
        kind: "single_choice",
        id: "sleep_quality",
        question: "How's your sleep been lately?",
        subtext: "Sleep and stress feed each other, so this shapes your plan.",
        options: [
          { id: "slow", emoji: "⏳", label: "Takes forever to fall asleep" },
          { id: "wake", emoji: "⏰", label: "I wake up during the night" },
          { id: "unrefreshed", emoji: "😵‍💫", label: "I sleep but wake up unrefreshed" },
          { id: "fine", emoji: "🙂", label: "Sleep's actually okay" },
        ],
      },

      // ── INFO: second reassurance beat, a hopeful affirmation heading
      // into the back half of the diagnosis ─────────────────────────────
      {
        kind: "info",
        id: "affirm_calm",
        icon: "🌱",
        title: "Your calm isn't gone, it's just buried",
        body: "Stress doesn't erase your baseline, it just sits on top of it. With the right daily reset, your nervous system remembers how to settle.",
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
            id: "scroll",
            emoji: "📱",
            label: "I scroll my phone instead of actually stopping",
          },
          {
            id: "later",
            emoji: "⏳",
            label: "I keep telling myself \"I'll do it later\"",
          },
          {
            id: "overwhelm",
            emoji: "🌪️",
            label: "The moment I sit still, everything I have to do takes over",
          },
          {
            id: "skeptical",
            emoji: "🤔",
            label: "I'm not convinced it'll actually work for me",
          },
        ],
      },

      // ── SEGUE 2: diagnostic framing for the agreement scales ──────────
      {
        kind: "info",
        id: "scales_intro",
        icon: "📊",
        title: "Now we'll measure your baseline",
        body: "These are statements, not questions. Rate how true each one feels, so we can pinpoint your starting point and track exactly how far you've come.",
      },

      // ── Agreement section: rate how much each statement sounds like you ─
      // 5-point agree/disagree Likert sliders, one statement per screen, each
      // auto-advancing. Surfaces the user's self-perception before the recap
      // reflects the pattern back to them.
      {
        kind: "scale",
        id: "scale_mind",
        emojis: ["👎", "🤔", "🤷", "👍", "🙌"],
        statement: "My mind races when I'm trying to relax.",
        subtext:
          "There are no right answers, just tell us how much this sounds like you.",
      },
      {
        kind: "scale",
        id: "scale_stuck",
        emojis: ["👎", "🤔", "🤷", "👍", "🙌"],
        statement: "I've tried to build a calming routine before, but it didn't stick.",
      },
      {
        kind: "scale",
        id: "scale_body",
        emojis: ["👎", "🤔", "🤷", "👍", "🙌"],
        statement: "I notice stress in my body before my mind catches up.",
      },

      // ── REVEAL: "analyzing" loader → nervous-system archetype ─────────
      // The hinge between diagnose and solve. The loader auto-advances and
      // branches on `goal` to one of the three archetype screens; each
      // converges into the solve act (phone_hr) via nextId.
      {
        kind: "interstitial",
        id: "analyzing",
        title: "Analyzing your responses…",
        body: "Mapping your answers to your nervous system's pattern right now.",
        loadingItems: [
          "Reading your stress signals",
          "Comparing to common patterns",
          "Matching your reset plan",
        ],
        branch: {
          on: "goal",
          to: {
            stress: "arch_flight",
            focus: "arch_flight",
            explore: "arch_flight",
            sleep: "arch_night",
            wellness: "arch_empty",
          },
        },
      },
      {
        kind: "info",
        id: "arch_flight",
        visual: "impact_gauge",
        title: "Your pattern: Flight Mode",
        body: "Your nervous system tends to stay switched on, your mind keeps moving even when your body wants to rest. That's what makes it hard to truly unwind. Here's what calms a system stuck in Flight Mode.",
        citation:
          "This is an informational reflection based on your quiz answers, not a medical assessment.",
        nextId: "phone_hr",
      },
      {
        kind: "info",
        id: "arch_night",
        visual: "impact_gauge",
        title: "Your pattern: The Night Loop",
        body: "Your system stays alert right when it should be powering down, so your mind loops instead of letting go. Here's what guides a system stuck in the Night Loop back toward rest.",
        citation:
          "This is an informational reflection based on your quiz answers, not a medical assessment.",
        nextId: "phone_hr",
      },
      {
        kind: "info",
        id: "arch_empty",
        visual: "impact_gauge",
        title: "Your pattern: Running on Empty",
        body: "Long stretches in stress mode have left your reserves low, so calm feels just out of reach. Here's what rebuilds a system that's Running on Empty.",
        citation:
          "This is an informational reflection based on your quiz answers, not a medical assessment.",
        nextId: "phone_hr",
      },

      // ════════════════════════ ACT 2 — SOLVE ════════════════════════

      // ── INFO: "Did you know?", your phone can read your heart rate ───
      // Educational reveal using the real in-app camera-PPG image plus a
      // foundational source, so the surprising claim lands as fact, not pitch.
      {
        kind: "info",
        id: "phone_hr",
        icon: "💡",
        image: {
          src: "/camerappg.png",
          alt: "Azora reading a pulse from a fingertip resting over the phone camera",
        },
        imageLarge: true,
        appNudge: {
          title: "Try it yourself first",
          body: "Open Azora and watch your own heart rate fall, live, in under a minute.",
        },
        title: "Did you know? Your phone can read your heart rate",
        body: "Your camera senses your pulse from tiny color changes in your skin each time your heart beats, a clinically studied method called **photoplethysmography (PPG)**.",
        citation:
          "Validated against medical-grade ECG in peer-reviewed research, Poh et al., Optics Express (2010), MIT Media Lab; Coppetti et al., Eur. J. Prev. Cardiol. (2017).",
      },

      // ── INFO: Why live feedback beats guessing (the payoff) ──────────
      {
        kind: "info",
        id: "live_feedback",
        icon: "💓",
        visual: "hr_falling",
        title: "You see it working, you're not guessing",
        body: "Azora paces each breath while reading your heart rate live, that pairing is Heart-Guided Breathing. As you breathe, your heart rate drops on screen, so you're never left hoping it helped.",
      },

      // ── INFO: Verified accuracy (credibility for the reading) ────────
      {
        kind: "info",
        id: "accuracy_proof",
        icon: "🎓",
        visual: "ppg_vs_ecg",
        title: "And the reading is accurate",
        body: "Azora's camera heart-rate method (PPG) is validated against medical ECG.",
        institutions: [
          "MIT Media Lab",
          "Stanford Medicine",
          "University Hospital Zurich",
        ],
        citation:
          "Poh et al., Optics Express (2010) · Shcherbina et al., J. Pers. Med. (2017) · Coppetti et al., Eur. J. Prev. Cardiol. (2017)",
      },

      // ── INFO: Why a lower heart rate matters (benefit checklist) ─────
      {
        kind: "info",
        id: "hr_benefits",
        icon: "💗",
        title: "Why a lower heart rate matters",
        body: "When your heart rate settles, your whole system follows:",
        checklist: [
          "Your mind quiets, racing thoughts ease",
          "You fall asleep faster, and rest more deeply",
          "Stress hormones like cortisol ease off",
          "Your body recovers, so your energy feels steadier",
        ],
        citation:
          "Lower resting heart rate is linked to reduced stress and better sleep in heart-rate-variability research.",
      },

      // ── INFO: invitation bridge into the exercise (explaining → doing) ─
      {
        kind: "info",
        id: "try_breath_intro",
        icon: "🌬️",
        title: "Now, feel it for yourself",
        body: "You've seen how Heart-Guided Breathing works. Let's do one quick round together right now, no camera needed, just follow along.",
      },

      // ── EXERCISE: try paced breathing now (the experiential payoff,
      // placed after the heart-rate feature is fully explained) ──────────
      {
        kind: "breathing",
        id: "try_breath",
        title: "Let's try one round together",
        subtext: "Follow the orb. In through your nose, out through your mouth.",
        // Expand on the inhale, hold full, contract on the exhale.
        phases: [
          { label: "Breathe in", seconds: 4, scale: 1 },
          { label: "Hold", seconds: 2, scale: 1 },
          { label: "Breathe out", seconds: 6, scale: 0.5 },
        ],
        rounds: 3,
      },

      // ── Q: How they felt after the exercise ──────────────────────────
      {
        kind: "single_choice",
        id: "after_breath",
        question: "How do you feel after that?",
        subtext: "Even one round can shift things. There's no wrong answer.",
        options: [
          { id: "calmer", emoji: "😌", label: "A little calmer already" },
          { id: "settled", emoji: "🫁", label: "More settled in my body" },
          { id: "same", emoji: "😐", label: "About the same for now" },
          { id: "practice", emoji: "🌱", label: "I think I need more practice" },
        ],
      },

      // ── Projection: the 2-week trend, shown after they've felt a round
      // so the outcome curve lands as a payoff. Name-free title (the name
      // isn't collected until later). Chart data comes from
      // personalization.summary.projection + answers.
      {
        kind: "projection",
        id: "projection",
        title: "Here's where you're headed",
        body: "Your daily resets are built to soften the spikes first, then settle your baseline.",
      },

      // ── INFO: Guidance beats going alone (comparison bars) ───────────
      {
        kind: "info",
        id: "with_azora",
        icon: "📊",
        visual: "comparison_bars",
        title: "Support makes it stick",
        body: "It's tough to build a calm routine alone. Azora guides you with proven techniques and live feedback you can see.",
      },

      // ── SEGUE 3: diagnostic framing for the personalization block ─────
      {
        kind: "info",
        id: "personalize_intro",
        icon: "🎛️",
        title: "Last step: calibrating your plan",
        body: "A few final details let us tune the pace and timing of your sessions to your body. This is what turns a generic routine into a plan built around you.",
      },

      // ── Profile fields, delayed until the plan has value ──────────────
      {
        kind: "single_choice",
        id: "gender",
        question: "To tune the plan, how do you identify?",
        subtext: "Sex and hormones shape how your nervous system responds, so this helps us tailor your reset.",
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
        subtext: "Your age helps us recommend the most effective ways to lower stress and improve your sleep.",
        options: [
          { id: "18_24", label: "18–24" },
          { id: "25_34", label: "25–34" },
          { id: "35_44", label: "35–44" },
          { id: "45_54", label: "45–54" },
          { id: "55_plus", label: "55+" },
        ],
      },
      // ── INFO: age-cohort reassurance (echoes their age range) ─────────
      {
        kind: "info",
        id: "age_cohort",
        icon: "🫶",
        title: "We've got you",
        body: "You're in good hands. Plenty of people in the {{age}} range come to us with exactly this, and your plan adapts to where your body is now.",
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
      // your product"), the user is approved for something, not sold to.
      {
        kind: "result",
        id: "result",
        title: "{{name}}, you're a match for Heart-Guided Breathing",
        body:
          "Based on your answers, the way stress shows up for you is " +
          "exactly what live heart-rate biofeedback is built to catch. " +
          "Your daily plan has been approved and built.",
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
        duration: ["duration"],
        severity: ["severity"],
        life_impact: ["life_impact"],
        triggers: ["triggers"],
        evenings: ["evenings"],
        caffeine: ["caffeine"],
        sleep_quality: ["sleep_quality"],
        tried_before: ["tried_before"],
        me_time: ["me_time"],
        peace_time: ["peace_time"],
        calm_duration: ["calm_duration"],
        agree_mind: ["scale_mind"],
        agree_stuck: ["scale_stuck"],
        agree_body: ["scale_body"],
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
        duration: {
          weeks: "a few weeks",
          months: "a few months",
          year: "about a year",
          years: "years",
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
          // The chart curve trends DOWNWARD, so every metric here must be a
          // burden that *falls* with Azora (less = better). Don't use "more is
          // better" labels (sleep quality / wellbeing / focus) — a downward
          // line on those reads as Azora making them worse.
          metricLabels: {
            stress: "Your stress",
            sleep: "Time to fall asleep",
            wellness: "Your daily stress",
            focus: "Your brain fog",
            explore: "Your stress",
          },
          fallbackMetricLabel: "Your stress",
          planLabel: "Azora",
          comparisonLabel: "Unguided",
          startLabel: "Today",
          endLabel: "Day 14",
          caption: [],
        },
        // First-session claim is observable in-app; keep the 2-week claim soft
        // ("calmer baseline"), not medical.
        prediction: {
          kicker: "Based on your answers",
          text:
            "We predict you'll watch your heart rate fall in your very first " +
            "session, and feel a calmer baseline by **{{projection_date}}** " +
            "with your {{calm_duration:short|5-minute}} {{peace_time:short|daily}} resets.",
        },
        compare:
          "**{{tried_before:short}}** gave you no feedback, so the habit " +
          "never stuck. Your plan closes the loop, you'll watch it working " +
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
        anchorNote: "Everything a $300 wearable does, with just your phone.",
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
        // PLACEHOLDER social proof, replace with real, verifiable customer
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
