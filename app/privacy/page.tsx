import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Azora",
};

export default function PrivacyPolicy() {
  return (
    <main className="legalPage">
      <article className="legalArticle">
        <header className="legalHeader">
          <Link href="/" className="legalBack">
            ← Back to Home
          </Link>
          <h1 className="legalTitle">Privacy Policy</h1>
          <p className="legalMeta">Last updated: June 10, 2026</p>
        </header>

        <p className="legalIntro">
          At <strong>Azora</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use the Azora mobile application and website (the &quot;Service&quot;).
        </p>

        <section className="legalSection">
          <h2><span className="legalSectionNum">01</span>Information We Collect</h2>
          <p>We collect only the information necessary to provide you with the best wellness experience:</p>
          <ul>
            <li><strong>Physiological Data:</strong> Heart rate and Heart Rate Variability (HRV) metrics estimated via photoplethysmography (PPG) using your device&rsquo;s camera. <em>Note: We do not store raw camera video data.</em></li>
            <li><strong>Usage Data:</strong> Breath-hold session logs, duration, and app interaction patterns.</li>
            <li><strong>Analytics:</strong> Technical information about how you use the Service to help us improve performance and features (processed via PostHog).</li>
            <li><strong>Account Data:</strong> Information provided during account creation (e.g., email address).</li>
          </ul>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">02</span>How We Use Your Data</h2>
          <p>Your data is used solely to:</p>
          <ul>
            <li>Provide you with accurate, personalized wellness insights.</li>
            <li>Maintain and secure your account.</li>
            <li>Analyze product performance and improve the Service.</li>
            <li>Send you service-related and marketing communications (see below).</li>
          </ul>
          <div className="legalCallout">
            <p><strong>We do not sell your personal health data to third parties.</strong></p>
          </div>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">03</span>Email &amp; Marketing Communications</h2>
          <p>When you create an account or join our waitlist, we may use your email address to send you:</p>
          <ul>
            <li><strong>Transactional emails:</strong> Account confirmations, receipts, security notices, and other messages necessary to operate the Service.</li>
            <li><strong>Marketing emails:</strong> Product updates, wellness tips, new features, and promotional offers from Azora.</li>
          </ul>
          <p>
            By creating an account and accepting this Privacy Policy, you consent to receiving these communications. You can <strong>opt out of marketing emails at any time</strong> by clicking the unsubscribe link in any marketing email or by contacting us at kevin@tryazora.app. Transactional emails are required to operate your account and cannot be opted out of while you maintain an account.
          </p>
          <p>We will never share or sell your email address to third parties for their own marketing purposes.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">04</span>Data Security</h2>
          <p>
            Your data is stored securely using <strong>Supabase</strong>. We employ industry-standard security measures to protect your information from unauthorized access, loss, or misuse.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">05</span>Sensor Permissions</h2>
          <p>
            Azora requires access to your device&rsquo;s <strong>Camera and Flash</strong> to estimate your heart rate and HRV. We only access these sensors during active sessions. By using these features, you consent to this processing.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">06</span>Third-Party Services</h2>
          <p>We work with trusted third-party providers to support our operations:</p>
          <ul>
            <li><strong>Supabase:</strong> For secure database management and authentication.</li>
            <li><strong>PostHog:</strong> For product analytics to help us understand how to improve the Service.</li>
            <li><strong>Apple:</strong> For managing subscriptions and in-app purchases.</li>
            <li><strong>RevenueCat:</strong> To help us manage subscription statuses effectively.</li>
          </ul>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">07</span>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">08</span>Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
          <div className="legalContactCard">
            <p><strong>Email:</strong> kevin@tryazora.app</p>
            <p><strong>Company:</strong> 300 Labs</p>
          </div>
        </section>

        <nav className="legalFooterNav">
          <Link href="/">Home</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
        </nav>
      </article>
    </main>
  );
}
