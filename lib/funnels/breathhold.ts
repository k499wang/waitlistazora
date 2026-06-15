import type { FunnelConfig } from "./types";

  // ═══════════════════════════════════════════════════════════════════════
  // Breath-HOLD training funnel, Breathwrk-style voice (benefit/feeling
  // first, NOT clinical). The hero is the *hold* itself: gentle guided breath
  // holds are the method, not generic breathing. Same Azora subscription as
  // calm-reset. The science (CO2 tolerance + dive reflex) is the quiet engine;
  // screens only speak in feelings: calmer, steadier, in control.
  //
  // Two-act structure (diagnose → reveal → solve):
  //   ACT 1 — DIAGNOSE: goal + branch + duration → reassurance → severity /
  //     impact / triggers, breath-hold baseline, and lifestyle questions
  //     (breath awareness, caffeine, movement) → what they've tried →
  //     peace_time / body_signal / reset_blocker → agreement scales →
  //     "analyzing" loader → nervous-system ARCHETYPE reveal (the hinge).
  //   ACT 2 — SOLVE: what breath-hold training is, how a hold works, a live
  //     hold to feel it, the science (dive reflex + studies), then
  //     personalization (gender / age / name), the commitment-close, and the
  //     building interstitial → result → projection → summary → account →
  //     offer.
  //
  // NO phone-camera / PPG heart-rate gimmick here (that's calm-reset's
  // mechanism). The "proof" is what you FEEL during a hold plus your hold
  // time growing day by day, a number/streak you watch climb in the app.
  //
  // Branching: goal → reflect_understood → assess_intro carries the branch to
  // the matching "when" question; all rejoin at `duration`. The "analyzing"
  // loader branches on goal to the matching archetype, which converges into the
  // solve act (mechanism) via nextId.
  //
  // Holds are framed gentle/never-forced on purpose: this audience is anxious,
  // and a forced max-hold is literally a panic trigger, "never forced, never
  // gasping" doubles as a comfort promise. Claims kept soft ("feel calmer",
  // never "treats anxiety") for FTC / app-store safety.
  // ═══════════════════════════════════════════════════════════════════════
export const breathholdFunnel: FunnelConfig = {
    slug: "breathhold",
    name: "The Breath-Hold Method",
    status: "active",
    intro:
      "A few quick questions to build your personalized breath-hold plan, the gentle daily holds that train your body out of anxiety.",
    steps: [
      // ════════════════════════ ACT 1 — DIAGNOSE ════════════════════════

      // ── Q1: Goal FIRST, the engaging hook / aspiration. Flows to the
      // reassurance recap, which then branches to the goal-specific follow-up.
      {
        kind: "single_choice",
        id: "goal",
        question: "What do you want breath-hold training to help with?",
        subtext: "No wrong answer. Just pick what's closest to true right now.",
        options: [
          { id: "calm", emoji: "😌", label: "To feel calm and steady" },
          { id: "anxiety", emoji: "🌊", label: "To stop anxiety in its tracks" },
          { id: "sleep", emoji: "🌙", label: "To fall asleep faster" },
          { id: "focus", emoji: "⚡", label: "To focus and feel energized" },
          { id: "explore", emoji: "✨", label: "Just curious, show me what this is" },
        ],
      },

      // ── RECAP: reassurance + social proof, shown right after the goal so
      // trust is established before the goal-specific questions.
      {
        kind: "info",
        id: "reflect_understood",
        icon: "🤝",
        title: "You're in good hands",
        body: "However long it's been weighing on you, you're far from alone. Here's what members say after a couple of weeks:",
        rating: { score: "5.0", stars: 5, count: "" },
        reviews: [
          {
            quote:
              "The guided holds finally gave my breathing something to **lock onto**. I feel steadier within minutes, and it sticks the rest of the day.",
            name: "Priya S.",
            stars: 5,
          },
          {
            quote:
              "I used to spiral before big meetings. Two weeks of daily holds and my baseline just feels lower. Genuinely surprised.",
            name: "Marcus T.",
            stars: 5,
          },
        ],
      },

      // ── SEGUE 1: diagnostic framing for the opening assessment ────────
      // Carries the goal→branch routing so it sits in front of the "when"
      // question it introduces.
      {
        kind: "info",
        id: "assess_intro",
        icon: "🫁",
        title: "Let's read your nervous system",
        body: "Your breathing pattern is one of the clearest windows into your nervous system. Next, a few quick questions to map where yours is right now, so we can see exactly what's keeping your body on alert.",
        branch: {
          on: "goal",
          to: {
            calm: "anxiety_when",
            anxiety: "anxiety_when",
            sleep: "sleep_when",
            focus: "general_when",
            explore: "general_when",
          },
        },
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
            nextId: "duration",
          },
          {
            id: "cant_full",
            emoji: "😮‍💨",
            label: "I can't seem to get a full breath in",
            nextId: "duration",
          },
          {
            id: "hold",
            emoji: "⏸️",
            label: "I catch myself holding my breath",
            nextId: "duration",
          },
          {
            id: "chest_tight",
            emoji: "🪨",
            label: "My chest tightens and breathing feels like work",
            nextId: "duration",
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
            nextId: "duration",
          },
          {
            id: "wired",
            emoji: "🔌",
            label: "I'm wired but tired, my body won't let go",
            nextId: "duration",
          },
          {
            id: "wake",
            emoji: "⏰",
            label: "I drift off fine but wake up at 3am",
            nextId: "duration",
          },
          {
            id: "forever",
            emoji: "🌙",
            label: "It just takes forever to drop off",
            nextId: "duration",
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
            nextId: "duration",
          },
          {
            id: "wired",
            emoji: "🌪️",
            label: "Wired and scattered, pulled in every direction",
            nextId: "duration",
          },
          {
            id: "flat",
            emoji: "🫥",
            label: "Flat, running low on energy",
            nextId: "duration",
          },
          {
            id: "okay",
            emoji: "🌤️",
            label: "Pretty good, just want to stay sharp",
            nextId: "duration",
          },
        ],
      },

      // ── Q2.5: How long they've been dealing with it ─────────────────
      {
        kind: "single_choice",
        id: "duration",
        question: "How long has this been something you deal with?",
        subtext: "However long it's been, today's a good day to start.",
        options: [
          { id: "weeks", emoji: "🌱", label: "Just recently, the last few weeks" },
          { id: "months", emoji: "🍂", label: "A few months now" },
          { id: "year", emoji: "🗓️", label: "About a year" },
          { id: "years", emoji: "⏳", label: "Years, it feels like forever" },
        ],
      },

      // ── INFO: Reassurance after they share how long it's been ─────────
      {
        kind: "info",
        id: "reassure_fit",
        icon: "🫶",
        title: "We've got you from here",
        body: "However long it's been, you're in good hands. Breath-hold training is a perfect fit for what you're dealing with, and we'll build it around you, one gentle hold at a time.",
      },

      // ── Q: Severity (how intense it gets) ─────────────────────────────
      {
        kind: "single_choice",
        id: "severity",
        question: "When anxiety peaks, how intense does it get?",
        subtext: "There's no wrong answer. This tells us how gentle to start.",
        options: [
          { id: "low", emoji: "🌤️", label: "A low hum I can push through" },
          { id: "strong", emoji: "🌥️", label: "Strong, but I usually manage" },
          { id: "hijack", emoji: "🌧️", label: "It hijacks my whole body" },
          { id: "panic", emoji: "⛈️", label: "Full panic, I can't think straight" },
        ],
      },

      // ── Q: Life impact (what it costs them) ───────────────────────────
      {
        kind: "single_choice",
        id: "life_impact",
        question: "What does it cost you the most?",
        subtext: "Knowing what it touches most helps us aim your plan.",
        options: [
          { id: "sleep", emoji: "😴", label: "My sleep" },
          { id: "focus", emoji: "🎯", label: "Focus and work" },
          { id: "confidence", emoji: "🗣️", label: "Confidence around people" },
          { id: "presence", emoji: "🌅", label: "Just enjoying my day" },
        ],
      },

      // ── Q: Triggers (what sets it off) ────────────────────────────────
      {
        kind: "single_choice",
        id: "triggers",
        question: "What usually triggers it?",
        subtext: "Spotting your trigger helps us time your holds for when you need them.",
        options: [
          { id: "work", emoji: "💼", label: "Work and pressure" },
          { id: "social", emoji: "👥", label: "Social situations" },
          { id: "health", emoji: "🩺", label: "Health worries" },
          { id: "nowhere", emoji: "🌫️", label: "It hits out of nowhere" },
        ],
      },

      // ── Q4: Breath-hold baseline (breath-hold-specific personalization) ─
      {
        kind: "single_choice",
        id: "hold_baseline",
        question: "How long can you comfortably hold your breath right now?",
        subtext: "No need to test it, just your best guess. This sets your starting point.",
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

      // ── INFO: Affirmation, your breath isn't broken ──────────────────
      {
        kind: "info",
        id: "affirm_breath",
        icon: "🤍",
        visual: "breath_wave",
        title: "Your breath is not broken",
        body: "Anxiety often reaches the breath first. That's exactly where we'll train.",
      },

      // ── Q: Breath awareness (symptom frequency) ───────────────────────
      {
        kind: "single_choice",
        id: "breath_awareness",
        question: "How often does your breathing go shallow or tight?",
        subtext: "Your breath is the first place tension shows up, so this tells us a lot.",
        options: [
          { id: "daily", emoji: "🌬️", label: "Many times a day" },
          { id: "weekly", emoji: "📅", label: "A few times a week" },
          { id: "night", emoji: "🌙", label: "Mostly at night or in bed" },
          { id: "noticed", emoji: "❓", label: "Only when I stop to notice" },
        ],
      },

      // ── Q: Caffeine (lifestyle) ───────────────────────────────────────
      {
        kind: "single_choice",
        id: "caffeine",
        question: "How's your caffeine intake?",
        subtext: "Caffeine keeps your system primed, so it's useful for us to know.",
        options: [
          { id: "high", emoji: "☕", label: "High, and often late in the day" },
          { id: "moderate", emoji: "🍵", label: "Moderate" },
          { id: "low", emoji: "🚫", label: "Low to none" },
          { id: "untracked", emoji: "🤷", label: "Don't really track it" },
        ],
      },

      // ── Q: Movement (lifestyle) ───────────────────────────────────────
      {
        kind: "single_choice",
        id: "movement",
        question: "How active are you day to day?",
        subtext: "Movement and breathing are linked, so this helps shape your plan.",
        options: [
          { id: "active", emoji: "🏃", label: "Active most days" },
          { id: "light", emoji: "🚶", label: "Light, here and there" },
          { id: "sedentary", emoji: "🪑", label: "Mostly sedentary" },
          { id: "varies", emoji: "🔄", label: "It's all over the place" },
        ],
      },

      // ── Q3: Breathwork history (sets up the guidance screen) ──────────
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
            id: "scroll",
            emoji: "📱",
            label: "I reach for my phone instead of actually pausing",
          },
          {
            id: "later",
            emoji: "⏳",
            label: "I tell myself \"later\", and later never comes",
          },
          {
            id: "overwhelm",
            emoji: "🌊",
            label: "The second I stop, my to-do list floods back in",
          },
          {
            id: "skeptical",
            emoji: "🤔",
            label: "I'm not sure a quick pause can really change how I feel",
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
        id: "scale_breath",
        emojis: ["👎", "🤔", "🤷", "👍", "🙌"],
        statement: "My breathing changes the moment I get anxious.",
        subtext:
          "There are no right answers, just tell us how much this sounds like you.",
      },
      {
        kind: "scale",
        id: "scale_stuck",
        emojis: ["👎", "🤔", "🤷", "👍", "🙌"],
        statement: "I've tried breathing techniques before, but they didn't stick.",
      },
      {
        kind: "scale",
        id: "scale_control",
        emojis: ["👎", "🤔", "🤷", "👍", "🙌"],
        statement: "When anxiety hits, my body feels out of my control.",
      },

      // ── REVEAL: "analyzing" loader → nervous-system archetype ─────────
      // The hinge between diagnose and solve. The loader auto-advances and
      // branches on `goal` to one of the three archetype screens; each
      // converges into the solve act (mechanism) via nextId.
      {
        kind: "interstitial",
        id: "analyzing",
        title: "Analyzing your responses…",
        body: "Mapping your answers to your nervous system's pattern right now.",
        loadingItems: [
          "Reading your breathing signals",
          "Comparing to common patterns",
          "Matching your training plan",
        ],
        branch: {
          on: "goal",
          to: {
            calm: "arch_flight",
            anxiety: "arch_flight",
            explore: "arch_flight",
            sleep: "arch_night",
            focus: "arch_overdrive",
          },
        },
      },
      {
        kind: "info",
        id: "arch_flight",
        visual: "impact_gauge",
        title: "Your pattern: Flight Mode",
        body: "Your breath shifts the moment stress hits, a sign your nervous system stays primed for threat. Here's the gentle practice that teaches a system stuck in Flight Mode to stand down.",
        citation:
          "This is an informational reflection based on your quiz answers, not a medical assessment.",
        nextId: "mechanism",
      },
      {
        kind: "info",
        id: "arch_night",
        visual: "impact_gauge",
        title: "Your pattern: The Night Loop",
        body: "Your system stays switched on at bedtime, so your breath stays shallow and rest won't come. Here's the gentle practice that walks a system stuck in the Night Loop down into rest.",
        citation:
          "This is an informational reflection based on your quiz answers, not a medical assessment.",
        nextId: "mechanism",
      },
      {
        kind: "info",
        id: "arch_overdrive",
        visual: "impact_gauge",
        title: "Your pattern: Overdrive",
        body: "You run fast and scattered, your breath driving the pace instead of steadying it. Here's the gentle practice that gives a system stuck in Overdrive a reset button.",
        citation:
          "This is an informational reflection based on your quiz answers, not a medical assessment.",
        nextId: "mechanism",
      },

      // ════════════════════════ ACT 2 — SOLVE ════════════════════════

      // ── INFO: What breath-hold training is (the solution, introduced
      // right after the diagnosis reveal) ───────────────────────────────
      {
        kind: "info",
        id: "mechanism",
        icon: "⏸️",
        image: { src: "/clipart4175230.png", alt: "A person taking a calm, guided breath" },
        title: "So what is breath-hold training?",
        body: "The simplest practice there is: breathe in gently, then pause before your next breath. That short, comfortable pause, the hold, is where your nervous system learns to settle.",
      },

      // ── INFO: How one hold works (the actual practice, taught simply) ──
      {
        kind: "info",
        id: "how_holds_work",
        icon: "🫁",
        title: "How a hold actually works",
        body: "It looks like nothing. Inside, a gentle pause sets off a calming chain reaction:",
        checklist: [
          "CO2 **rises slightly**, your body's cue that it's safe to slow down.",
          "That flips you out of **fight-or-flight** into rest-and-digest.",
          "Your heart rate eases and the urge to breathe **loses its grip**.",
        ],
      },

      // ── EXERCISE: try a gentle hold right now (feel it work) ──────────
      {
        kind: "breathing",
        id: "try_hold",
        title: "Let's try one gentle hold",
        subtext: "Follow the orb. Nothing forced, and you can stop any time.",
        // Expand on the inhale, stay full through the hold, contract on the
        // exhale. Each round visibly grows from the previous round's exhale.
        phases: [
          { label: "Breathe in", seconds: 4, scale: 1 },
          { label: "Hold, easy", seconds: 6, scale: 1 },
          { label: "Let it out", seconds: 6, scale: 0.5 },
        ],
        rounds: 2,
      },

      // ── Q: How they felt after the exercise ──────────────────────────
      {
        kind: "single_choice",
        id: "after_hold",
        question: "How do you feel after that?",
        subtext: "Even one round can shift things. There's no wrong answer.",
        options: [
          { id: "calmer", emoji: "😌", label: "A little calmer already" },
          { id: "settled", emoji: "🫁", label: "More settled in my body" },
          { id: "same", emoji: "😐", label: "About the same for now" },
          { id: "practice", emoji: "🌱", label: "I think I need more practice" },
        ],
      },

      // ── INFO: The dive reflex, with real numbers + citation ──────────
      // The "dive response" (bradycardia on breath-hold) is well documented;
      // HR can fall ~10-30% during apnea. We cite the figure conservatively.
      {
        kind: "info",
        id: "calm_switch",
        icon: "🌊",
        visual: "dive_reflex",
        title: "Your body has a built-in calm switch",
        body: "Hold your breath gently and the **dive reflex** kicks in: your heart rate can drop by **up to 25%** within seconds, no bigger breath required. It's the same brake elite freedivers rely on, and it's already wired into you.",
        citation:
          "The human diving response, Foster & Sheel, Scand. J. Med. Sci. Sports (2005).",
      },

      // ── INFO: Research-backed credibility strip (honest sourcing) ─────
      // Findings are presented as a checklist, each grounded in a real,
      // peer-reviewed study named in the citation. No institution logos: the
      // cited work isn't from those brands, so claiming them would mislead.
      {
        kind: "info",
        id: "backed_by_science",
        icon: "🔬",
        title: "What the science says",
        body: "Breath-hold training isn't a trend. It's physiology, and it's well studied:",
        checklist: [
          "A gentle hold can slow your heart rate within seconds.",
          "Slow breathing raises HRV, your body's built-in calm signal.",
          "Better CO2 tolerance is linked to lower anxiety.",
        ],
        citation:
          "Foster & Sheel (2005); Russo et al., Breathe (2017); Grassi et al., J. Psychiatr. Res. (2014).",
      },

      // ── SEGUE 3: diagnostic framing for the personalization block ─────
      {
        kind: "info",
        id: "personalize_intro",
        icon: "🎛️",
        title: "Last step: calibrating your plan",
        body: "A few final details let us tune the pace and timing of your holds to your body. This is what turns a generic routine into a protocol built around you.",
      },

      // ── Profile fields, delayed until the plan has value ──────────────
      {
        kind: "single_choice",
        id: "gender",
        question: "To tune the plan, how do you identify?",
        subtext: "Sex and hormones shape how your nervous system responds, so this helps us pace your holds.",
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
        subtext: "Your age helps us recommend the most effective hold pacing to calm your nervous system.",
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

      // ── INFO: Guidance beats going alone (comparison bars) ────────────
      {
        kind: "info",
        id: "with_azora",
        icon: "📊",
        visual: "comparison_bars",
        title: "Support makes it stick",
        body: "It's tough to build a breath practice alone. Azora guides you with gentle, proven holds and daily progress you can see.",
      },

      // ── Motivation: commitment-close ──────────────────────────────────
      // Last question before the loader. Having the user name their own "why"
      // out loud is a documented commitment device, it lifts follow-through
      // and paywall conversion. The chosen answer is echoed back in the
      // result/paywall copy so the plan feels built around their reason.
      {
        kind: "single_choice",
        id: "motivation",
        question: "Last thing, {{name}}, what makes this matter to you right now?",
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
        duration: ["duration"],
        severity: ["severity"],
        life_impact: ["life_impact"],
        triggers: ["triggers"],
        breath_awareness: ["breath_awareness"],
        caffeine: ["caffeine"],
        movement: ["movement"],
        tried_before: ["tried_before"],
        hold_baseline: ["hold_baseline"],
        peace_time: ["peace_time"],
        calm_duration: ["calm_duration"],
        agree_breath: ["scale_breath"],
        agree_stuck: ["scale_stuck"],
        agree_control: ["scale_control"],
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
          // The chart curve trends DOWNWARD, so every metric here must be a
          // burden that *falls* with Azora (less = better), never a "more is
          // better" label like "Your calm"/"Your focus" — a downward line on
          // those would read as Azora making them worse.
          metricLabels: {
            calm: "Your tension",
            anxiety: "Your anxiety",
            sleep: "Time to fall asleep",
            focus: "Your brain fog",
            explore: "Your tension",
          },
          fallbackMetricLabel: "Your anxiety",
          planLabel: "Azora",
          comparisonLabel: "Generic",
          startLabel: "Today",
          endLabel: "Day 14",
          caption: ["Short daily holds help", "keep progress building."],
        },
        prediction: {
          kicker: "Based on your answers",
          text:
            "We predict your very first hold will feel easier than you expect, " +
            "and you'll notice a calmer, steadier baseline by **{{projection_date}}** " +
            "as your {{calm_duration:short|3-minute}} {{peace_time:short|daily}} holds grow.",
        },
        compare:
          "**{{tried_before:short}}** never tracked your progress, so the habit " +
          "never stuck. Your plan grows your hold a little more each day, " +
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
        anchorNote: "Your pocket breath-hold coach, gentle guided holds that train calm in minutes a day.",
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
        // Light, Breathwrk-style credibility, no citations.
        validation: {
          line: "Breath-hold training used by free-divers and calm-seekers alike",
          sources: "Gentle, guided, and never forced",
        },
        // PLACEHOLDER social proof, replace with real, verifiable customer
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
              "My comfortable hold went from 20 seconds to almost a minute, " +
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
