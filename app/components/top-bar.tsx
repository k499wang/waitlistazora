import Image from "next/image";
import Link from "next/link";

import iconApp from "../assets/iconApp.png";
import { AuthNav } from "./auth-nav";

// Lightweight static header for non-landing pages (pricing, funnel, etc.).
// The marketing homepage keeps its own floating-pill nav; everything else uses
// this simpler bar so auth state + the home link are always available.
export function TopBar({ next }: { next?: string }) {
  return (
    <header className="topBar">
      <div className="container topBarInner">
        <Link className="brand" href="/">
          <div className="brandIconWrapper">
            <Image src={iconApp} alt="Azora logo" fill className="brandIcon" />
          </div>
          Azora
        </Link>
        <nav className="topBarNav" aria-label="Primary">
          <Link href="/pricing">Pricing</Link>
          <AuthNav next={next} />
        </nav>
      </div>
    </header>
  );
}
