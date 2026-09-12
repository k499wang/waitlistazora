"use client";

import Image from "next/image";
import posthog from "posthog-js";
import { getStoredAttribution } from "@/lib/client-attribution";
import { AppStoreBadge } from "./components/app-store-badge";
import { AuthNav } from "./components/auth-nav";
import { SmileyStars } from "./components/smiley-stars";

// Single-screen home page: one cozy illustration, rounded (Fredoka) type, one
// call to action, and a smiley-star rating. Deliberately short — everything a
// visitor needs fits above the fold with no scrolling.
export default function Home() {
  return (
    <main className="homeScreen">
      <div className="homeBackdrop" aria-hidden="true" />
      <div className="homeArt" aria-hidden="true" />
      <div className="homeScrim" aria-hidden="true" />

      <nav className="homeNav" aria-label="Primary">
        <a className="homeBrand" href="#top">
          <Image
            src="/azora-koala.png"
            alt=""
            width={44}
            height={44}
            className="homeBrandIcon"
            priority
          />
          Azora
        </a>
        <AuthNav next="/" />
      </nav>

      <div className="homeBody" id="top">
        <h1 className="homeTitle">
          Find <span className="homeTitleAccent">Joy</span> in Taking Care of
          Yourself
        </h1>
        <div className="homeLede">
          <p className="homeSub">Your new self-care best friend.</p>
          <p className="homeSubNote">
            Whenever your mind needs a reset, Azora gives you a calm minute to
            breathe.
          </p>
        </div>

        <div className="homeCta">
          <AppStoreBadge
            height={54}
            onClick={() => {
              posthog.capture("app_store_clicked", {
                button_location: "home_hero",
                ...getStoredAttribution(),
              });
            }}
          />
        </div>

        <div className="homeRating">
          <SmileyStars size={26} />
          <span className="homeRatingText">5/5 on the App Store</span>
        </div>
      </div>

      <footer className="homeFooter">
        <span>© {new Date().getFullYear()} Azora · Owned by 300 Labs</span>
        <span className="homeFooterLinks">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </span>
      </footer>
    </main>
  );
}
