import Image from "next/image";
import icon from "./assets/Blue wind symbol on white background.png";
import onboard1 from "./assets/onboard1.png";
import onboard2 from "./assets/onboard2.png";
import onboard3 from "./assets/onboard3.webp";
import onboard4 from "./assets/onboard4.webp";
import { WaitlistForm } from "./waitlist-form";

const screenshots = [
  {
    src: onboard1,
    alt: "Azora dashboard showing BPM, breath hold timer, health score, and heart rate variability chart.",
    label: "Your daily overview",
  },
  {
    src: onboard2,
    alt: "Heart health screen with stress meter, recovery insights, and logged sessions.",
    label: "Understand your recovery",
  },
  {
    src: onboard3,
    alt: "Breath hold results screen with estimated lung age and detailed heart statistics.",
    label: "Track every breath",
  },
  {
    src: onboard4,
    alt: "Live heart-rate tracking during a guided breath hold session.",
    label: "Real-time feedback",
  },
];

export default function Home() {
  return (
    <main className="page">
      {/* HERO */}
      <section className="heroShell" aria-labelledby="waitlist-title">
        <nav className="nav" aria-label="Primary">
          <a className="brand" href="#waitlist-title">
            <Image className="brandIcon" src={icon} alt="" aria-hidden="true" />
            Azora
          </a>
        </nav>

        <div className="waitlist">
          <p className="eyebrow">Early access</p>
          <h1 id="waitlist-title">Breathe better, one moment at a time.</h1>
          <p className="subtext">
            Join the waitlist for guided breath holds, live heart-rate insights,
            and calmer daily resets.
          </p>
          <WaitlistForm />
          <p className="trustLine">Private beta opening soon</p>
        </div>
      </section>

      {/* PREVIEW GALLERY */}
      <section className="previewSection" aria-labelledby="preview-heading">
        <div className="previewHeader">
          <h2 id="preview-heading">See Azora in action</h2>
          <p>
            Four screens that show how breath, heart, and calm come together.
          </p>
        </div>

        <div className="phoneGallery">
          {screenshots.map((shot, i) => (
            <div
              key={i}
              className="phoneCard"
              style={{ animationDelay: `${120 * i}ms` }}
            >
              <div className="phoneFrame">
                <div className="phoneBar" />
                <Image
                  className="phoneScreen"
                  src={shot.src}
                  alt={shot.alt}
                  sizes="(max-width: 640px) 70vw, 260px"
                  priority={i < 2}
                />
              </div>
              <span className="phoneLabel">{shot.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="featuresSection" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="featuresGrid">
          <article className="featureCard">
            <div className="featureIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Guided breath holds</h3>
            <p>
              Follow simple cues to hold, release, and recover. No guesswork,
              just rhythm.
            </p>
          </article>

          <article className="featureCard">
            <div className="featureIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3>Live heart-rate insights</h3>
            <p>
              Watch your body respond in real time. See how a single breath
              changes your pulse.
            </p>
          </article>

          <article className="featureCard">
            <div className="featureIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3>Calmer daily resets</h3>
            <p>
              Two-minute check-ins designed to lower stress and sharpen focus
              before the day spikes.
            </p>
          </article>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footerCta" aria-labelledby="footer-cta-heading">
        <div className="footerCtaInner">
          <h2 id="footer-cta-heading">Ready to find your calm?</h2>
          <p>Be the first to try Azora when the private beta opens.</p>
          <WaitlistForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="siteFooter">
        <span>© {new Date().getFullYear()} Azora</span>
        <span className="footerDot" aria-hidden="true">·</span>
        <span>Built for people who breathe.</span>
      </footer>
    </main>
  );
}
