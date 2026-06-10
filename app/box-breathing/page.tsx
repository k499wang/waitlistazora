import type { Metadata } from "next";
import Link from "next/link";
import { AppStoreBadge } from "@/app/components/app-store-badge";
import BreathPacer from "./BreathPacer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://azora.app";
const appStoreUrl =
  "https://apps.apple.com/us/app/azora-breathwork-for-wellness/id6763631574";

export const metadata: Metadata = {
  title: "Box Breathing: Free Guided 4-4-4-4 Exercise",
  description:
    "Practice box breathing (the 4-4-4-4 technique used by Navy SEALs) with a free animated pacer in your browser. Learn how it calms your nervous system — no signup, no app required.",
  alternates: { canonical: `${siteUrl}/box-breathing` },
  openGraph: {
    type: "article",
    title: "Box Breathing: Free Guided 4-4-4-4 Exercise",
    description:
      "Follow a free animated box-breathing pacer in your browser and calm your nervous system in minutes.",
    url: `${siteUrl}/box-breathing`,
  },
  twitter: {
    card: "summary",
    title: "Box Breathing: Free Guided 4-4-4-4 Exercise",
    description:
      "Follow a free animated box-breathing pacer in your browser and calm your nervous system in minutes.",
  },
};

const boxFaq = [
  {
    q: "What is box breathing?",
    a: "Box breathing is a technique where you inhale, hold, exhale, and hold again — each for an equal count, usually four seconds. The four equal phases form the four sides of a 'box.' It's used by Navy SEALs, athletes, and clinicians to calm the nervous system under pressure.",
  },
  {
    q: "How long should I practice box breathing?",
    a: "Even 1–2 minutes (about 4–8 rounds) can lower your heart rate and ease stress. For a deeper reset, practice for 5 minutes. Many people use it before sleep, before a stressful event, or to break a spiral of anxious thoughts.",
  },
  {
    q: "Does box breathing actually work?",
    a: "Slow, paced breathing at around 6 breaths per minute increases vagal tone and shifts you toward parasympathetic ('rest and digest') activity. Box breathing's extended holds and even rhythm are a simple, repeatable way to get there.",
  },
  {
    q: "How is this different from the Azora app?",
    a: "This browser tool guides the rhythm. The Azora app does that and measures your real heart rate through your iPhone camera, so you can watch your BPM settle in real time and track how your recovery improves over weeks.",
  },
];

const faqPageLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: boxFaq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to do box breathing",
  description:
    "A simple 4-4-4-4 breathing technique to calm your nervous system.",
  step: [
    { "@type": "HowToStep", name: "Breathe in", text: "Inhale slowly through your nose for 4 seconds." },
    { "@type": "HowToStep", name: "Hold", text: "Hold your breath gently for 4 seconds." },
    { "@type": "HowToStep", name: "Breathe out", text: "Exhale through your mouth for 4 seconds." },
    { "@type": "HowToStep", name: "Hold", text: "Hold empty for 4 seconds, then repeat." },
  ],
};

export default function BoxBreathingPage() {
  return (
    <main className="toolPage">
      <div className="noise-overlay" aria-hidden="true" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />

      <div className="container toolContainer">
        <Link href="/" className="toolBack">
          ← Azora
        </Link>

        <header className="toolHeader">
          <span className="label" style={{ color: "var(--brand)" }}>
            Free breathing tool
          </span>
          <h1 className="headline" style={{ marginTop: "0.75rem" }}>
            Box Breathing
          </h1>
          <p className="subhead" style={{ marginTop: "0.75rem", color: "var(--text-secondary)" }}>
            The 4-4-4-4 technique used by Navy SEALs to stay calm under pressure.
            Inhale for 4, hold for 4, exhale for 4, hold for 4. Follow the pacer
            below — no signup, no app needed.
          </p>
        </header>

        <BreathPacer />

        <section className="toolSection">
          <h2 className="headline" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Why box breathing works
          </h2>
          <p className="body" style={{ marginTop: "0.75rem", color: "var(--text-secondary)" }}>
            Slowing your breath to roughly six cycles a minute increases vagal
            tone and nudges your body out of fight-or-flight and into
            &ldquo;rest and digest.&rdquo; The equal holds in box breathing make
            the rhythm easy to keep, so your heart rate and stress response settle
            within a few rounds. It&rsquo;s grounded in the same camera-based
            photoplethysmography (PPG) research that powers Azora.
          </p>
        </section>

        <section className="toolCta">
          <h2 className="headline" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Want to see it working on your heart?
          </h2>
          <p className="body" style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
            Azora guides this exercise and measures your real heart rate through
            your iPhone camera — so you can watch your BPM settle and track your
            recovery over time.
          </p>
          <div className="heroActions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
            <AppStoreBadge height={50} href={appStoreUrl} />
          </div>
        </section>

        <section className="toolSection">
          <h2 className="headline" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Common questions
          </h2>
          <dl className="toolFaq">
            {boxFaq.map((item) => (
              <div className="toolFaqItem" key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
