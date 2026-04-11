import Image from "next/image";
import icon from "./assets/Blue wind symbol on white background.png";
import screenshot from "./assets/screenshot.png";
import { WaitlistForm } from "./waitlist-form";

export default function Home() {
  return (
    <main className="page">
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
            Join the waitlist for early access to guided breath holds, live heart-rate insights,
            and calmer daily resets.
          </p>
          <WaitlistForm />
          <p className="trustLine">Private beta opening soon</p>
        </div>

        <div id="preview" className="mockupWrap" aria-label="Azora preview">
          <div className="floatCard floatCardLeft" aria-hidden="true">
            <span>Train your breath</span>
            <strong>Build calm with guided breath holds</strong>
          </div>

          <div className="floatCard floatCardRight" aria-hidden="true">
            <span>See stress shift</span>
            <strong>Watch your body respond in real time</strong>
          </div>

          <div className="floatCard floatCardMidLeft" aria-hidden="true">
            <span>Feel more in control</span>
            <strong>Use your breath to reset faster</strong>
          </div>

          <div className="floatCard floatCardMidRight" aria-hidden="true">
            <span>Wind down easier</span>
            <strong>Practice breathing for better nights</strong>
          </div>

          <div className="floatCard floatCardBottomLeft" aria-hidden="true">
            <span>Quick daily reset</span>
            <strong>A calmer check-in when the day spikes</strong>
          </div>

          <div className="floatCard floatCardBottomRight" aria-hidden="true">
            <span>Simple habit</span>
            <strong>Less tracking, more useful feedback</strong>
          </div>

          <div className="phone" aria-hidden="true">
            <div className="phoneBar" />
            <Image
              className="screenshot"
              src={screenshot}
              alt=""
              priority
              sizes="(max-width: 760px) 78vw, 320px"
            />
          </div>

          <div className="monitor" aria-hidden="true">
            <div className="monitorHeader">
              <span>Heart rate</span>
              <strong>68 bpm</strong>
            </div>
            <svg viewBox="0 0 360 120" role="img" aria-label="Heart rate waveform">
              <path
                className="monitorGrid"
                d="M0 30H360M0 60H360M0 90H360M60 0V120M120 0V120M180 0V120M240 0V120M300 0V120"
              />
              <path
                className="wave"
                d="M0 72 L34 72 L46 58 L58 86 L72 34 L88 92 L104 72 L146 72 L160 62 L174 80 L190 44 L208 88 L226 72 L270 72 L286 60 L300 78 L316 50 L334 88 L360 70"
              />
            </svg>
            <div className="monitorFooter">
              <span>2 min</span>
              <span>steady</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
