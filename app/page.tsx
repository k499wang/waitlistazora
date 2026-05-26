"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { attributionFromRecord } from "@/lib/attribution";
import starsBg from "../public/stars.jpg";
import imgHome from "./assets/IMG_0140 (1).webp";
import imgResults from "./assets/IMG_0143.webp";
import imgBreathing from "./assets/IMG_0144.webp";
import iconApp from "./assets/iconApp.png";

const attributionStorageKey = "azora_attribution";

function getStoredAttribution() {
  try {
    return attributionFromRecord(
      JSON.parse(window.localStorage.getItem(attributionStorageKey) || "{}")
    );
  } catch {
    return {};
  }
}

function StoreButtons({ center = false }: { center?: boolean }) {
  return (
    <div className="heroActions" style={center ? { justifyContent: "center" } : undefined}>
      <a
        href="https://apps.apple.com/us/app/azora-breathwork-for-wellness/id6763631574"
        className="storeBtn"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          posthog.capture("app_store_clicked", {
            button_location: center ? "final_cta" : "hero",
            ...getStoredAttribution()
          });
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        App Store
      </a>
    </div>
  );
}

const faqData = [
  {
    q: "What is Azora?",
    a: "Azora is a breathwork companion that uses your phone's camera to measure heart rate in real time, guides you through evidence-based breathing techniques, and reveals patterns in your stress and recovery.",
  },
  {
    q: "How does heart-rate tracking work?",
    a: "Through photoplethysmography (PPG), Azora reads your pulse via the camera and flash during a session. No wearables, no straps — just place your finger over the lens and watch your live BPM, stress index, and recovery metrics unfold.",
  },
  {
    q: "Is Azora free to use?",
    a: "Azora is free to download, with core breathing exercises and basic tracking available at no cost. Advanced analytics, personalized programs, and unlimited history are part of Azora Premium.",
  },
  {
    q: "What devices support Azora?",
    a: "Azora is available on iPhone. For the richest experience, we recommend devices with a rear camera and flash. Azora also integrates with Apple Health.",
  },
  {
    q: "Is my health data private?",
    a: "Your physiological data never leaves your device unless you choose to enable cloud sync. We do not sell, share, or monetize your health information in any form.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faqItem">
      <button
        className="faqQuestion"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {question}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`faqAnswer ${open ? "open" : ""}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    revealRefs.current[index] = el;
  };

  return (
    <main className="page">
      {/* ── BACKGROUND ── */}
      <div className="heroBg">
        <Image
          src={starsBg}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          aria-hidden="true"
        />
      </div>
      <div className="heroFade" aria-hidden="true" />

      {/* ── NAV ── */}
      <nav className={`nav ${navScrolled ? "navScrolled" : ""}`} aria-label="Primary">
        <div className="container navInner">
          <a className="brand" href="#top">
            <div className="brandIconWrapper">
              <Image
                src={iconApp}
                alt="Azora Logo"
                fill
                className="brandIcon"
              />
            </div>
            Azora
          </a>
          <div className="navLinks">
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
            <a href="#download">Download</a>
          </div>
          <a className="navCta" href="#download">
            Get the app
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="container">
          <div className="heroInner">
            <div className="heroContent">
              <h1 id="hero-title" className="heroTitle display">
                <span>Breathe with intention.</span>
                <span>Recover with clarity.</span>
              </h1>
              <p className="heroSub subhead">
                Azora guides every inhale, tracks every heartbeat, and reveals
                the quiet rhythm of your recovery — one breath at a time.
              </p>
              <StoreButtons />
            </div>
          </div>
        </div>

      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="howSection" id="how" aria-labelledby="how-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(3)}>
            <span className="label" style={{ color: "var(--brand)" }}>How it works</span>
            <h2 id="how-title" className="headline" style={{ marginTop: "0.75rem" }}>
              A practice as simple as breathing
            </h2>
            <p className="subhead" style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              No devices to charge, no courses to complete. Just open, breathe, and discover what your body has been trying to tell you.
            </p>
          </div>

          <div className="stepsGrid">
            <div className="stepCard reveal" ref={setRef(4)}>
              <div className="stepVisual stepVisualLeft">
                <div className="phoneBar" />
                <Image
                  src={imgHome}
                  alt="Azora home screen with daily exercise and breathing programs."
                  fill
                  sizes="(max-width: 980px) 50vw, 180px"
                  className="phoneScreen"
                />
              </div>
              <h3>Choose your practice</h3>
            </div>

            <div className="stepCard reveal reveal-delay-1" ref={setRef(5)}>
              <div className="stepVisual stepVisualCenter">
                <div className="phoneBar" />
                <Image
                  src={imgBreathing}
                  alt="Box breathing guide showing inhale, hold, exhale phases."
                  fill
                  sizes="(max-width: 980px) 50vw, 180px"
                  className="phoneScreen"
                />
              </div>
              <h3>Follow the rhythm</h3>
            </div>

            <div className="stepCard reveal reveal-delay-2" ref={setRef(6)}>
              <div className="stepVisual stepVisualRight">
                <div className="phoneBar" />
                <Image
                  src={imgResults}
                  alt="Results screen showing BPM, stress index, and recovery stats."
                  fill
                  sizes="(max-width: 980px) 50vw, 180px"
                  className="phoneScreen"
                />
              </div>
              <h3>Discover your patterns</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGNALS ── */}
      <section className="signalsSection" aria-labelledby="signals-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(0)}>
            <span className="label" style={{ color: "var(--brand)" }}>Mindful Measurement</span>
            <h2 id="signals-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Find your calm in every heartbeat
            </h2>
            <p className="subhead" style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              Azora listens to your body's subtle rhythms through your camera. By tracking heart rate 
              variability during your practice, we help you visualize your journey toward deep relaxation and inner balance.
            </p>
          </div>

          <div className="signalsLayout">
            <div className="signalsMonitor reveal" ref={setRef(1)} aria-hidden="true">
              <div className="monitorRing">
                <span>72</span>
                <small>BPM</small>
              </div>
              <div className="monitorWave">
                <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
                <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
              </div>
              <div className="monitorStats">
                <div>
                  <span>RMSSD</span>
                  <strong>46 ms</strong>
                </div>
                <div>
                  <span>AVG HRV</span>
                  <strong>58 ms</strong>
                </div>
              </div>
            </div>

            <div className="signalsGrid reveal reveal-delay-1" ref={setRef(2)}>
              <div className="signalMetric">
                <span>GENTLE SENSING</span>
                <strong>Camera-Led Awareness</strong>
                <p>Your lens becomes a window into your physiology, capturing your pulse with a gentle, non-invasive touch.</p>
              </div>
              <div className="signalMetric">
                <span>INNER BALANCE</span>
                <strong>Breath Coherence</strong>
                <p>See how your breathing patterns directly influence your nervous system, guiding you into a state of recovery.</p>
              </div>
              <div className="signalMetric">
                <span>CLARITY OVER TIME</span>
                <strong>Mindfulness Progress</strong>
                <p>Observe how regular practice shifts your baseline, building a more resilient and centered version of yourself.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonialSection" aria-labelledby="testimonials-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(9)}>
            <span className="label" style={{ color: "var(--brand)" }}>Kind words</span>
            <h2 id="testimonials-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Loved by people who breathe
            </h2>
          </div>

          <div className="testimonialGrid">
            <div className="testimonialCard reveal" ref={setRef(10)}>
              <p className="testimonialQuote">
                &ldquo;I have tried every meditation app out there. Azora is the first one
                that actually shows me what is happening in my body while I breathe.&rdquo;
              </p>
              <div className="testimonialAuthor">Kevin W.</div>
              <div className="testimonialRole">Founder, early adopter</div>
            </div>

            <div className="testimonialCard reveal reveal-delay-1" ref={setRef(11)}>
              <p className="testimonialQuote">
                &ldquo;The box breathing guide carried me through the most demanding week
                of my career. Watching my heart rate settle in real time is nothing
                short of remarkable.&rdquo;
              </p>
              <div className="testimonialAuthor">Sarah M.</div>
              <div className="testimonialRole">Product designer</div>
            </div>

            <div className="testimonialCard reveal reveal-delay-2" ref={setRef(12)}>
              <p className="testimonialQuote">
                &ldquo;Every morning before my run, I open Azora. The breath holds have
                measurably improved my endurance and how quickly I recover.&rdquo;
              </p>
              <div className="testimonialAuthor">James T.</div>
              <div className="testimonialRole">Marathon runner</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faqSection" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(13)}>
            <span className="label" style={{ color: "var(--brand)" }}>Questions</span>
            <h2 id="faq-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Thoughtful answers
            </h2>
          </div>

          <div className="faqList reveal" ref={setRef(14)}>
            {faqData.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="finalCta" id="download" aria-labelledby="cta-title">
        <div className="container">
          <div className="reveal" ref={setRef(15)}>
            <h2 id="cta-title">Begin your practice today.</h2>
            <p>Download Azora and discover what your breath has been waiting to tell you.</p>
            <StoreButtons center />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="siteFooter">
        <div className="container siteFooterInner">
          <span>© {new Date().getFullYear()} Azora · Built for people who breathe.</span>
          <div className="footerLinks">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
