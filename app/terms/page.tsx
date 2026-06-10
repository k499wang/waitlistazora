import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — Azora",
};

export default function TermsAndConditions() {
  return (
    <main className="legalPage">
      <article className="legalArticle">
        <header className="legalHeader">
          <Link href="/" className="legalBack">
            ← Back to Home
          </Link>
          <h1 className="legalTitle">Terms &amp; Conditions</h1>
          <p className="legalMeta">Last updated: June 10, 2026</p>
        </header>

        <p className="legalIntro">
          Welcome to <strong>Azora</strong>, operated by <strong>300 Labs</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the Azora mobile application and website (the &quot;Service&quot;). By accessing or using Azora, you agree to these Terms.
        </p>

        <section className="legalSection">
          <h2><span className="legalSectionNum">01</span>Eligibility</h2>
          <p>You must be at least <strong>13 years old</strong> to use Azora. By using the Service, you confirm that you meet this requirement.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">02</span>Description of Service</h2>
          <p>Azora is a <strong>general wellness application</strong> that provides:</p>
          <ul>
            <li>Breathwork exercises</li>
            <li>Breath-hold tracking</li>
            <li>Heart rate and heart rate variability (HRV) insights</li>
            <li>Personal wellness metrics</li>
          </ul>
          <p>The App uses your device&rsquo;s <strong>camera and flash</strong> to estimate physiological signals.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">03</span>Not Medical Advice</h2>
          <div className="legalCallout">
            <p>Azora is <strong>not a medical device</strong> and does not provide medical advice.</p>
          </div>
          <ul>
            <li>The Service is intended for <strong>general wellness purposes only</strong>.</li>
            <li>It is <strong>not intended to diagnose, treat, cure, or prevent any disease</strong>.</li>
            <li>Measurements (including heart rate and HRV) are <strong>estimates only</strong> and may be inaccurate.</li>
          </ul>
          <p>You should consult a qualified healthcare provider before making decisions based on data from the Service.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">04</span>User Accounts</h2>
          <p>To use certain features, you must create an account. You agree to provide accurate information, keep your credentials secure, and be responsible for all activity under your account. We reserve the right to suspend or terminate accounts for misuse.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">05</span>Data Collection &amp; Usage</h2>
          <p>We collect heart rate, HRV metrics, breath-hold session data, and app usage analytics. Your data is stored securely using Supabase, used to improve the Service, and analyzed using PostHog. We do <strong>not sell your personal health data</strong>. For more details, see our <Link href="/privacy">Privacy Policy</Link>.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">06</span>Email Communications</h2>
          <p>By creating an account, you agree to receive emails from us, including:</p>
          <ul>
            <li><strong>Transactional emails</strong> necessary to operate your account, such as confirmations, receipts, and security notices.</li>
            <li><strong>Marketing emails</strong> with product updates, wellness content, and promotional offers.</li>
          </ul>
          <p>You may unsubscribe from marketing emails at any time via the unsubscribe link included in each email. See our <Link href="/privacy">Privacy Policy</Link> for details on how we handle your email address.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">07</span>Camera &amp; Sensor Usage</h2>
          <p>Azora uses your device&rsquo;s camera and flash to estimate heart rate and HRV via photoplethysmography (PPG). By using these features, you consent to this processing.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">08</span>Subscriptions &amp; Payments</h2>
          <p>Azora offers optional auto-renewing subscriptions managed through Apple (Weekly/Yearly plans, free trials).</p>
          <ul>
            <li><strong>Billing:</strong> Payment is charged to your Apple ID at confirmation of purchase. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.</li>
            <li><strong>Managing Subscriptions:</strong> You can manage or cancel subscriptions in your Apple ID settings. All purchases are handled via Apple and may also be processed using RevenueCat.</li>
          </ul>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">09</span>Free Trials</h2>
          <p>If you start a free trial, it will automatically convert to a paid subscription unless canceled before the trial ends. Only one free trial may be available per user.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">10</span>Acceptable Use</h2>
          <p>You agree not to misuse or interfere with the Service, attempt to reverse engineer or exploit the Service, or use the Service in a way that violates laws or regulations.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">11</span>Accuracy of Information</h2>
          <p>The Service provides <strong>approximate measurements only</strong>. We do not guarantee the accuracy of readings or the reliability of wellness insights. Use the Service at your own discretion.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">12</span>Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, 300 Labs is not liable for any health decisions made based on the Service, inaccuracies, or any indirect/consequential damages. Your use of the Service is at your own risk.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">13</span>Disclaimer of Warranties</h2>
          <p>The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee the Service will be error-free or meet your expectations.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">14</span>Termination</h2>
          <p>We may suspend or terminate your access at any time if you violate these Terms.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">15</span>Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use of the Service after changes means you accept the updated Terms.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">16</span>Contact Information</h2>
          <p>If you have questions, contact us at:</p>
          <div className="legalContactCard">
            <p><strong>Email:</strong> kevin@tryazora.app</p>
            <p><strong>Company:</strong> 300 Labs</p>
          </div>
        </section>

        <nav className="legalFooterNav">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>
      </article>
    </main>
  );
}
