"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { appStoreUrl, getStoredAttribution } from "@/lib/client-attribution";
import { AuthNav } from "./components/auth-nav";
import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import { LivePrice } from "./pricing/live-price";
import iconApp from "./assets/iconApp.png";
import { faqData } from "./faq-data";

const annual = OFFER_DISPLAY.annual;

function StoreButtons({ center = false }: { center?: boolean }) {
  return (
    <div className="heroActions" style={center ? { justifyContent: "center" } : undefined}>
      <a
        href="/pricing"
        className="getProBtn"
        onClick={() => {
          posthog.capture("get_pro_clicked", {
            button_location: center ? "final_cta" : "hero",
            ...getStoredAttribution()
          });
        }}
      >
        Get Azora Pro
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
      <a
        href={appStoreUrl}
        className="storeBtn storeBtnSecondary"
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
        Download free
      </a>
    </div>
  );
}



const HOW_STEPS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
    ),
    title: "Measure",
    body: "Rest a finger on your camera for a 30-second reading. Azora captures your heart rate and stress in real time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></svg>
    ),
    title: "Breathe",
    body: "Follow a guided rhythm matched to how you feel right now — box breathing, wind-down, or a focused reset.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg>
    ),
    title: "Recover",
    body: "Watch your stress drop after each session and your recovery trends climb week over week.",
  },
];

const TRUST_POINTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
    title: "Real physiology, not guesswork",
    body: "Azora reads your pulse with photoplethysmography (PPG) — the same optical technique behind pulse oximeters and fitness wearables. No extra hardware required.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    ),
    title: "Evidence-based techniques",
    body: "Every session is built on slow-paced breathing protocols studied for their effects on stress and heart-rate variability — not wellness trends.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    ),
    title: "Private by design",
    body: "Your physiological data stays on your device unless you choose to sync. We never sell, share, or monetize your health information.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faqItem">
      <button
        type="button"
        className="faqQuestion"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      <div className={`faqAnswer ${open ? "open" : ""}`}>
        <p>{a}</p>
      </div>
    </div>
  );
}

const REVIEWS = [
  {
    quote: "I was skeptical that a camera could read my heart rate, but seeing my stress number drop after two minutes of breathing made it click. I actually use it now.",
    name: "Maya R.",
  },
  {
    quote: "No watch, no chest strap, no charging. I open the app, breathe, and I'm calmer before my next meeting. It's the only wellness habit that's stuck.",
    name: "Daniel K.",
  },
  {
    quote: "The trends page is what hooked me — watching my recovery improve over a few weeks feels genuinely motivating instead of preachy.",
    name: "Priya S.",
  },
];

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
      { threshold: 0.05, rootMargin: "0px 0px -80px 0px" }
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
      {/* ── HERO ── */}
      <section className="hero" id="top" aria-labelledby="hero-title">
        {/* Nature photo background */}
        <div className="heroBg">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=80&auto=format&fit=crop"
            alt=""
            className="heroBgImg"
            aria-hidden="true"
          />
        </div>
        <div className="heroFade" aria-hidden="true" />

        {/* Navigation */}
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
            <a href="#science">Science</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
            <a href="/pricing">Pricing</a>
            </div>
            <div className="navRight">
              <AuthNav next="/" />
              <a className="navCta" href="/pricing">
                Get Pro
              </a>
            </div>
          </div>
        </nav>

        <div className="heroContent">
          <h1 id="hero-title" className="heroTitle display">
            <span>Breathe with intention.</span>
            <span><em>Recover with clarity.</em></span>
          </h1>
          <p className="heroSub subhead">
            Azora guides every inhale, tracks every heartbeat, and reveals
            the quiet rhythm of your recovery — one breath at a time.
          </p>
          <StoreButtons />
          <ul className="heroTrust" aria-label="Why people trust Azora">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              No wearables needed
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              30-second readings
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Your data stays on your device
            </li>
          </ul>
        </div>
      </section>

      {/* ── HOW AZORA WORKS ── */}
      <section className="howSection" id="how" aria-labelledby="how-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(0)}>
            <span className="label" style={{ color: "var(--brand)" }}><span className="labelMark" aria-hidden="true" />How Azora works</span>
            <h2 id="how-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Calm you can actually measure
            </h2>
          </div>

          <div className="stepsGrid reveal" ref={setRef(1)}>
            {HOW_STEPS.map((step, i) => (
              <div key={step.title} className="stepCard">
                <span className="stepNum" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="howStepIcon" aria-hidden="true">{step.icon}</span>
                <h3 className="stepTitle">{step.title}</h3>
                <p className="stepBody">{step.body}</p>
              </div>
            ))}
          </div>

          <p className="toolsLink reveal" ref={setRef(2)}>
            New to breathwork?{" "}
            <a href="/box-breathing">Try box breathing free in your browser →</a>
          </p>
        </div>
      </section>

      {/* ── WHY YOU CAN TRUST IT ── */}
      <section className="trustSection" id="science" aria-labelledby="trust-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(6)}>
            <span className="label" style={{ color: "var(--brand)" }}><span className="labelMark" aria-hidden="true" />Grounded in science</span>
            <h2 id="trust-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Calm worth trusting
            </h2>
          </div>
          <div className="trustGrid reveal" ref={setRef(7)}>
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="trustCard">
                <span className="trustCardIcon" aria-hidden="true">{point.icon}</span>
                <h3 className="trustCardTitle">{point.title}</h3>
                <p className="trustCardBody">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT PEOPLE SAY ── */}
      <section className="socialSection" id="reviews" aria-labelledby="reviews-title">
        <div className="container">
          <div className="socialHeader reveal" ref={setRef(3)}>
            <div className="socialRating">
              <span className="socialStars" aria-hidden="true">★★★★★</span>
              <span className="socialRatingText">4.8 average · loved by early members</span>
            </div>
            <h2 id="reviews-title" className="headline">
              People feel the difference
            </h2>
          </div>
          <div className="reviewGrid reveal" ref={setRef(4)}>
            {REVIEWS.map((r) => (
              <figure key={r.name} className="reviewCard">
                <span className="reviewStars" aria-hidden="true">★★★★★</span>
                <blockquote className="reviewQuote">{r.quote}</blockquote>
                <figcaption className="reviewName">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faqSection" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(8)} style={{ marginBottom: 0 }}>
            <span className="label" style={{ color: "var(--brand)" }}><span className="labelMark" aria-hidden="true" />Questions</span>
            <h2 id="faq-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Everything you might wonder
            </h2>
          </div>
          <div className="faqList reveal" ref={setRef(9)}>
            {faqData.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="finalCta" id="download" aria-labelledby="cta-title">
        <div className="container">
          <div className="reveal" ref={setRef(5)}>
            <div className="breathRings" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h2 id="cta-title">Begin your practice <em>today</em>.</h2>
            <p>Start free, then just <LivePrice offerKey="annual" fallback={annual.price} />{annual.period} — about ~$3.33/mo. Cancel anytime.</p>
            <StoreButtons center />
            <p className="finalCtaReassure">Secure checkout · Cancel anytime · Works on web &amp; in the app</p>
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
