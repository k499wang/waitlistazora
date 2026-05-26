import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#060b18] text-[#e8ecf1] py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-neutral prose-headings:font-extrabold prose-headings:tracking-tight">
        <header className="mb-12">
          <Link href="/" className="text-sm font-bold text-[#64748B] hover:text-[#4a9eff] transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl mt-6 mb-4">Terms &amp; Conditions</h1>
          <p className="text-[#64748B]">Last updated: April 25, 2026</p>
        </header>

        <section className="space-y-6 text-[#94a3b8]">
          <p>
            Welcome to <strong>Azora</strong>, operated by <strong>300 Labs</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the Azora mobile application (the &quot;App&quot;).
          </p>
          <p>By accessing or using Azora, you agree to these Terms.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">1. Eligibility</h2>
          <p>You must be at least <strong>13 years old</strong> to use Azora. By using the App, you confirm that you meet this requirement.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">2. Description of Service</h2>
          <p>Azora is a <strong>general wellness application</strong> that provides:</p>
          <ul className="list-disc pl-5">
            <li>Breathwork exercises</li>
            <li>Breath-hold tracking</li>
            <li>Heart rate and heart rate variability (HRV) insights</li>
            <li>Personal wellness metrics</li>
          </ul>
          <p>The App uses your device’s <strong>camera and flash</strong> to estimate physiological signals.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">3. Not Medical Advice</h2>
          <p>Azora is <strong>not a medical device</strong> and does not provide medical advice.</p>
          <ul className="list-disc pl-5">
            <li>The App is intended for <strong>general wellness purposes only</strong>.</li>
            <li>It is <strong>not intended to diagnose, treat, cure, or prevent any disease</strong>.</li>
            <li>Measurements (including heart rate and HRV) are <strong>estimates only</strong> and may be inaccurate.</li>
          </ul>
          <p>You should consult a qualified healthcare provider before making decisions based on data from the App.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">4. User Accounts</h2>
          <p>To use certain features, you must create an account. You agree to provide accurate information, keep your credentials secure, and be responsible for all activity under your account. We reserve the right to suspend or terminate accounts for misuse.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">5. Data Collection &amp; Usage</h2>
          <p>We collect heart rate, HRV metrics, breath-hold session data, and app usage analytics. Your data is stored securely using Supabase, used to improve the App, and analyzed using PostHog. We do <strong>not sell your personal health data</strong>. For more details, see our <Link href="/privacy" className="text-[#2c7a67] font-bold">Privacy Policy</Link>.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">6. Camera &amp; Sensor Usage</h2>
          <p>Azora uses your device’s camera and flash to estimate heart rate and HRV via photoplethysmography (PPG). By using these features, you consent to this processing.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">7. Subscriptions &amp; Payments</h2>
          <p>Azora offers optional auto-renewing subscriptions managed through Apple (Weekly/Yearly plans, free trials).</p>
          <ul className="list-disc pl-5">
            <li><strong>Billing:</strong> Payment is charged to your Apple ID at confirmation of purchase. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.</li>
            <li><strong>Managing Subscriptions:</strong> You can manage or cancel subscriptions in your Apple ID settings. All purchases are handled via Apple and may also be processed using RevenueCat.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#e8ecf1]">8. Free Trials</h2>
          <p>If you start a free trial, it will automatically convert to a paid subscription unless canceled before the trial ends. Only one free trial may be available per user.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">9. Acceptable Use</h2>
          <p>You agree not to misuse or interfere with the App, attempt to reverse engineer or exploit the service, or use the App in a way that violates laws or regulations.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">10. Accuracy of Information</h2>
          <p>The App provides <strong>approximate measurements only</strong>. We do not guarantee the accuracy of readings or the reliability of wellness insights. Use the App at your own discretion.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">11. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, 300 Labs is not liable for any health decisions made based on the App, inaccuracies, or any indirect/consequential damages. Your use of the App is at your own risk.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">12. Disclaimer of Warranties</h2>
          <p>The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee the App will be error-free or meet your expectations.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">13. Termination</h2>
          <p>We may suspend or terminate your access at any time if you violate these Terms.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">14. Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use of the App after changes means you accept the updated Terms.</p>

          <h2 className="text-xl font-bold text-[#e8ecf1]">15. Contact Information</h2>
          <p>If you have questions, contact us at:<br />
          <strong>Email:</strong> kevin@tryazora.app<br />
          <strong>Company:</strong> 300 Labs</p>
        </section>
      </article>
    </main>
  );
}
