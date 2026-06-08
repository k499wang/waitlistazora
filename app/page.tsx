"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { appStoreUrl, getStoredAttribution } from "@/lib/client-attribution";
import { faqData } from "./faq-data";
import starsBg from "./assets/2066.jpg";
import imgHome from "./assets/IMG_0161.webp";
import imgResults from "./assets/IMG_0140 (1).webp";
import imgBreathing from "./assets/IMG_0158.webp";
import iconApp from "./assets/iconApp.png";

function StoreButtons({ center = false }: { center?: boolean }) {
  return (
    <div className="heroActions" style={center ? { justifyContent: "center" } : undefined}>
      <a
        href={appStoreUrl}
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
      {/* ── NOISE OVERLAY ── */}
      <div className="noise-overlay" aria-hidden="true" />

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

      {/* ── FLOATING GLASS ORBS ── */}
      <div className="glass-orb orb-lg" style={{ top: "10%", left: "-5%" }} />
      <div className="glass-orb orb-brand orb-md" style={{ top: "60%", right: "-8%" }} />
      <div className="glass-orb orb-sm" style={{ top: "30%", right: "15%" }} />

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
            <a href="#science">Science</a>
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
        <div className="rainbowAura" aria-hidden="true" />
        <div className="container">
          <div className="heroInner">
            <div className="heroContent">
              <div className="heroBadge">
                <span className="heroBadgeIcon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </span>
                <span className="heroBadgeStrike">No wearables.</span>
                &nbsp;Just your phone&rsquo;s camera.
              </div>

              <h1 id="hero-title" className="heroTitle display">
                <span>Breathe with intention.</span>
                <span>Recover with clarity.</span>
              </h1>
              <p className="heroSub subhead">
                Azora guides every inhale, tracks every heartbeat, and reveals
                the quiet rhythm of your recovery — one breath at a time.
              </p>
              <StoreButtons />

              <div className="heroPhoneWrapper">
                <div className="heroPhone">
                  <video
                    src="/0530.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="heroVideo"
                  />
                </div>
              </div>

              <div className="fingerCameraVisual">
                <div className="fingerCameraInner">
                  <div className="fingerCameraTooltip">
                    <div className="fingerCameraTooltipTitle">How it works</div>
                    <p className="fingerCameraTooltipBody">
                      <strong>Photoplethysmography (PPG)</strong> detects subtle changes in light absorption through your skin with each heartbeat — the same principle used in hospital pulse oximeters, now in your phone&rsquo;s camera.
                    </p>
                  </div>
                  <svg className="fingerCameraSvg" viewBox="0 0 140 132" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <filter id="softObjectShadow" x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
                        <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#101522" floodOpacity="0.22" />
                      </filter>
                      <filter id="fingerTexture" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="noise" />
                        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.86 0 0 0 0 0.58 0 0 0 0 0.45 0 0 0 0.13 0" result="skinNoise" />
                        <feBlend in="SourceGraphic" in2="skinNoise" mode="multiply" />
                      </filter>
                      <linearGradient id="moduleMetal" x1="40" y1="56" x2="98" y2="118" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fbfcfe" />
                        <stop offset="42%" stopColor="#dfe4eb" />
                        <stop offset="100%" stopColor="#adb4bf" />
                      </linearGradient>
                      <radialGradient id="lensGlass" cx="40%" cy="30%" r="72%">
                        <stop offset="0%" stopColor="#6c82ab" />
                        <stop offset="34%" stopColor="#24365b" />
                        <stop offset="72%" stopColor="#091120" />
                        <stop offset="100%" stopColor="#02040a" />
                      </radialGradient>
                      <radialGradient id="lensReflection" cx="32%" cy="24%" r="58%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
                        <stop offset="42%" stopColor="#cfe2ff" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="flashGlow" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#ffd1a7" stopOpacity="0.95" />
                        <stop offset="42%" stopColor="#ff7b69" stopOpacity="0.42" />
                        <stop offset="100%" stopColor="#ff647b" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="fingerSkin" x1="55" y1="0" x2="85" y2="106" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fff0e6" />
                        <stop offset="32%" stopColor="#f4d5c2" />
                        <stop offset="68%" stopColor="#dfa889" />
                        <stop offset="100%" stopColor="#c98265" />
                      </linearGradient>
                      <radialGradient id="fingerSideShade" cx="84%" cy="48%" r="74%">
                        <stop offset="0%" stopColor="#a85545" stopOpacity="0.5" />
                        <stop offset="58%" stopColor="#ce846c" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="fingerHighlight" x1="55" y1="2" x2="65" y2="104" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                        <stop offset="52%" stopColor="#fff2ea" stopOpacity="0.17" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                      <radialGradient id="fingerTipGlow" cx="50%" cy="78%">
                        <stop offset="0%" stopColor="#ffad72" stopOpacity="0.95" />
                        <stop offset="44%" stopColor="#ff705f" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#f0b092" stopOpacity="0" />
                      </radialGradient>
                      <clipPath id="fingerClip">
                        <path d="M48.6 -12 C47.9 5.2 48.6 25.4 48.2 44.8 C47.8 63.6 45.1 75.8 49.8 90.1 C53.5 101.5 61.1 107.8 70 107.8 C78.9 107.8 86.5 101.5 90.2 90.1 C94.8 75.8 92.2 63.4 91.8 44.8 C91.4 25.4 92.1 5.2 91.4 -12 Z" />
                      </clipPath>
                    </defs>

                    <ellipse cx="70" cy="118" rx="40" ry="8" fill="#172033" opacity="0.12" />
                    <circle cx="70" cy="88" r="45" fill="url(#flashGlow)" className="flashGlow" />

                    <g filter="url(#softObjectShadow)">
                      <rect x="39" y="57" width="62" height="62" rx="19" fill="url(#moduleMetal)" stroke="#c0c7d1" strokeWidth="1.3" />
                      <path d="M48 61 H85 C92.2 61 97 65.8 97 73 V86" stroke="#ffffff" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
                      <path d="M94 96 C91.8 109.4 82.4 115 68.8 115 H55" stroke="#8c95a3" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
                      <circle cx="88" cy="70.5" r="6.4" fill="#fff5dc" stroke="#d6b882" strokeWidth="1" />
                      <circle cx="88" cy="70.5" r="3.2" fill="#ffd98d" opacity="0.75" />

                      <circle cx="70" cy="88" r="21" fill="#080d17" stroke="#3d4658" strokeWidth="2.2" />
                      <circle cx="70" cy="88" r="16.4" fill="#10192d" stroke="#111827" strokeWidth="1.6" />
                      <circle cx="70" cy="88" r="12.2" fill="url(#lensGlass)" />
                      <circle cx="70" cy="88" r="12.2" fill="url(#lensReflection)" />
                      <path d="M62.8 81.1 C66.5 77.5 73.8 77 78.3 80.3" stroke="#c8dcff" strokeWidth="1.1" opacity="0.5" strokeLinecap="round" />
                      <circle cx="64.5" cy="81.8" r="2.5" fill="#ffffff" opacity="0.7" />
                      <circle cx="76.8" cy="95.2" r="1.4" fill="#8cb6ff" opacity="0.45" />
                    </g>

                    <circle cx="70" cy="88" r="22" fill="none" stroke="var(--brand)" strokeWidth="1.6" opacity="0" className="pulseRing" />
                    <circle cx="70" cy="88" r="26" fill="none" stroke="var(--brand)" strokeWidth="1.2" opacity="0" className="pulseRing2" />

                    <g className="fingerTip">
                      <path
                        d="M48.6 -12 C47.9 5.2 48.6 25.4 48.2 44.8 C47.8 63.6 45.1 75.8 49.8 90.1 C53.5 101.5 61.1 107.8 70 107.8 C78.9 107.8 86.5 101.5 90.2 90.1 C94.8 75.8 92.2 63.4 91.8 44.8 C91.4 25.4 92.1 5.2 91.4 -12 Z"
                        fill="url(#fingerSkin)"
                        stroke="#c98d75"
                        strokeWidth="1.2"
                        filter="url(#fingerTexture)"
                      />
                      <g clipPath="url(#fingerClip)">
                        <ellipse cx="82" cy="56" rx="18" ry="66" fill="url(#fingerSideShade)" />
                        <path d="M55 2 C59.4 19.4 58.6 38.9 57.5 56.2 C56.4 74.6 57.8 91.1 64.2 103.4" stroke="url(#fingerHighlight)" strokeWidth="5.2" strokeLinecap="round" />
                        <path d="M88.5 6 C85.1 26.2 86.5 48.5 87.2 65 C87.8 81.2 83.7 96.2 76.4 103.8" stroke="#93493e" strokeWidth="4.6" opacity="0.13" strokeLinecap="round" />
                        <ellipse cx="71.2" cy="89.2" rx="21.5" ry="15.8" fill="url(#fingerTipGlow)" />
                        <ellipse cx="70" cy="92" rx="16" ry="8.6" fill="#b9514c" opacity="0.12" />
                        <path d="M55.7 23.8 C62.4 21.7 77.7 21.8 84.2 24.2" stroke="#b97868" strokeWidth="0.75" opacity="0.18" strokeLinecap="round" />
                        <path d="M55.1 35.8 C62.8 33.4 77.6 33.6 84.8 36.2" stroke="#b97868" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
                        <path d="M54.9 48.8 C62.9 46.2 77.5 46.4 85.1 49.2" stroke="#b97868" strokeWidth="0.85" opacity="0.25" strokeLinecap="round" />
                        <path d="M55.9 62.4 C63 60.1 77.1 60.3 84.3 62.9" stroke="#b97868" strokeWidth="0.9" opacity="0.32" strokeLinecap="round" />
                        <path d="M56.6 73.8 C64.1 71.7 76.4 72.1 83.3 74.3" stroke="#b97868" strokeWidth="0.82" opacity="0.27" strokeLinecap="round" />
                        <path d="M59.7 84.6 C65.4 83.1 75.1 83.4 80.4 85.1" stroke="#b97868" strokeWidth="0.72" opacity="0.2" strokeLinecap="round" />
                      </g>
                    </g>
                  </svg>
                  <p className="fingerCameraLabel">
                    <strong>Place your finger</strong> over the camera lens to measure your heart rate.
                  </p>
                </div>
              </div>

              <div className="credStrip" aria-label="Backed by research from leading institutions">
                <span className="credLabel">Backed by research from</span>
                <div className="credLogos">
                  <span className="credLogo">Harvard</span>
                  <span className="credDot" aria-hidden="true" />
                  <span className="credLogo">Stanford</span>
                  <span className="credDot" aria-hidden="true" />
                  <span className="credLogo">MIT</span>
                  <span className="credDot" aria-hidden="true" />
                  <span className="credLogo">Oxford</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="howSection" id="how" aria-labelledby="how-title">
        <div className="glass-glow-white" style={{ top: "10%", left: "50%", transform: "translateX(-50%)", width: "60vw" }} />
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(0)}>
            <span className="label" style={{ color: "var(--brand)" }}>How it works</span>
            <h2 id="how-title" className="headline" style={{ marginTop: "0.75rem" }}>
              A practice as simple as breathing
            </h2>
            <p className="subhead" style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              No wearables, no devices to charge, no courses to complete. Just your phone&rsquo;s camera, your breath, and a few quiet minutes.
            </p>
          </div>

          <div className="stepsGrid">
            <div className="stepCard reveal" ref={setRef(1)}>
              <div className="stepVisual">
                <div className="phoneBar" />
                <div className="stepScreen">
                  <Image
                    src={imgHome}
                    alt="Azora heart rate results showing BPM, stress index, and recovery metrics."
                    fill
                    sizes="(max-width: 980px) 50vw, 180px"
                  />
                </div>
              </div>
              <h3>See your heart</h3>
            </div>

            <div className="stepCard reveal reveal-delay-1" ref={setRef(2)}>
              <div className="stepVisual">
                <div className="phoneBar" />
                <div className="stepScreen">
                  <Image
                    src={imgBreathing}
                    alt="Box breathing guide showing inhale, hold, exhale phases."
                    fill
                    sizes="(max-width: 980px) 50vw, 180px"
                  />
                </div>
              </div>
              <h3>Follow the rhythm</h3>
            </div>

            <div className="stepCard reveal reveal-delay-2" ref={setRef(3)}>
              <div className="stepVisual">
                <div className="phoneBar" />
                <div className="stepScreen">
                  <Image
                    src={imgResults}
                    alt="Azora home screen with daily breathing exercises and practice programs."
                    fill
                    sizes="(max-width: 980px) 50vw, 180px"
                  />
                </div>
              </div>
              <h3>Choose your exercises</h3>
            </div>
          </div>

          <p className="toolsLink reveal" ref={setRef(9)}>
            New to breathwork?{" "}
            <a href="/box-breathing">Try box breathing free in your browser →</a>
          </p>
        </div>
      </section>

      {/* ── RESEARCH / SCIENCE ── */}
      <section className="researchSection" id="science" aria-labelledby="science-title">
        <div className="glass-orb orb-brand orb-md" style={{ top: "20%", right: "-6%" }} />
        <div className="glass-orb orb-sm" style={{ top: "60%", left: "-3%" }} />
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(4)}>
            <span className="label" style={{ color: "var(--brand)" }}>Science</span>
            <h2 id="science-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Find your heartbeat
            </h2>
            <p className="subhead" style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              Azora is built on decades of peer-reviewed research in camera-based photoplethysmography (PPG) — the same technology validated at the world&rsquo;s leading institutions.
            </p>
          </div>

          <div className="carouselWrapper reveal" ref={setRef(5)}>
            <div className="carouselTrack">
              {/* Paper 1: MIT */}
              <a
                href="https://arxiv.org/abs/1006.0012"
                target="_blank"
                rel="noopener noreferrer"
                className="paperCard"
              >
                <div className="paperCardUniversity">
                  <div className="uniBadge mit">MIT</div>
                  <span>Media Lab</span>
                </div>
                <h3 className="paperCardTitle">
                  Non-contact, Automated Cardiac Pulse Measurements Using Video Imaging and Blind Source Separation
                </h3>
                <p className="paperCardMeta">Poh, McDuff, Picard · 2010</p>
                <span className="paperCardLink">
                  View Paper <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>

              {/* Paper 2: Stanford */}
              <a
                href="https://arxiv.org/abs/2111.11547"
                target="_blank"
                rel="noopener noreferrer"
                className="paperCard"
              >
                <div className="paperCardUniversity">
                  <div className="uniBadge stanford">SU</div>
                  <span>Stanford University</span>
                </div>
                <h3 className="paperCardTitle">
                  Camera Measurement of Physiological Vital Signs
                </h3>
                <p className="paperCardMeta">Daniel McDuff · ACM Computing Surveys, 2023</p>
                <span className="paperCardLink">
                  View Paper <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>

              {/* Paper 3: UCSF */}
              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6423467/"
                target="_blank"
                rel="noopener noreferrer"
                className="paperCard"
              >
                <div className="paperCardUniversity">
                  <div className="uniBadge ucsf">SF</div>
                  <span>UCSF Cardiology</span>
                </div>
                <h3 className="paperCardTitle">
                  Diagnostic Performance of a Smart Device With Photoplethysmography-Based Pulse Sensing for Atrial Fibrillation
                </h3>
                <p className="paperCardMeta">Tison, Marcus et al. · Circulation, 2018</p>
                <span className="paperCardLink">
                  View Paper <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>

              {/* Duplicate set for seamless infinite scroll */}
              <a
                href="https://arxiv.org/abs/1006.0012"
                target="_blank"
                rel="noopener noreferrer"
                className="paperCard"
                aria-hidden="true"
              >
                <div className="paperCardUniversity">
                  <div className="uniBadge mit">MIT</div>
                  <span>Media Lab</span>
                </div>
                <h3 className="paperCardTitle">
                  Non-contact, Automated Cardiac Pulse Measurements Using Video Imaging and Blind Source Separation
                </h3>
                <p className="paperCardMeta">Poh, McDuff, Picard · 2010</p>
                <span className="paperCardLink" tabIndex={-1}>
                  View Paper <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>

              <a
                href="https://arxiv.org/abs/2111.11547"
                target="_blank"
                rel="noopener noreferrer"
                className="paperCard"
                aria-hidden="true"
              >
                <div className="paperCardUniversity">
                  <div className="uniBadge stanford">SU</div>
                  <span>Stanford University</span>
                </div>
                <h3 className="paperCardTitle">
                  Camera Measurement of Physiological Vital Signs
                </h3>
                <p className="paperCardMeta">Daniel McDuff · ACM Computing Surveys, 2023</p>
                <span className="paperCardLink" tabIndex={-1}>
                  View Paper <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>

              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6423467/"
                target="_blank"
                rel="noopener noreferrer"
                className="paperCard"
                aria-hidden="true"
              >
                <div className="paperCardUniversity">
                  <div className="uniBadge ucsf">SF</div>
                  <span>UCSF Cardiology</span>
                </div>
                <h3 className="paperCardTitle">
                  Diagnostic Performance of a Smart Device With Photoplethysmography-Based Pulse Sensing for Atrial Fibrillation
                </h3>
                <p className="paperCardMeta">Tison, Marcus et al. · Circulation, 2018</p>
                <span className="paperCardLink" tabIndex={-1}>
                  View Paper <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faqSection" id="faq" aria-labelledby="faq-title">
        <div className="glass-orb orb-sm" style={{ top: "15%", left: "8%" }} />
        <div className="container">
          <div className="sectionHeader reveal" ref={setRef(6)}>
            <span className="label" style={{ color: "var(--brand)" }}>Questions</span>
            <h2 id="faq-title" className="headline" style={{ marginTop: "0.75rem" }}>
              Thoughtful answers
            </h2>
          </div>

          <div className="faqList reveal" ref={setRef(7)}>
            {faqData.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="finalCta" id="download" aria-labelledby="cta-title">
        <div className="glass-glow" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div className="container">
          <div className="reveal" ref={setRef(8)}>
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
