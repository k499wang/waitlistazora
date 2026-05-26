import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#060b18] text-[#e8ecf1] py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-neutral prose-headings:font-extrabold prose-headings:tracking-tight">
        <header className="mb-12">
          <Link href="/" className="text-sm font-bold text-[#64748B] hover:text-[#4a9eff] transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl mt-6 mb-4">Privacy Policy</h1>
          <p className="text-[#64748B]">Last updated: May 9, 2026</p>
        </header>

        <section className="space-y-6">
          <p>
            At <strong>Azora</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use the Azora mobile application (the &quot;App&quot;).
          </p>

          <h2 className="text-2xl font-bold">1. Information We Collect</h2>
          <p>We collect only the information necessary to provide you with the best wellness experience:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#94a3b8]">
            <li><strong>Physiological Data:</strong> Heart rate and Heart Rate Variability (HRV) metrics estimated via photoplethysmography (PPG) using your device’s camera. <em>Note: We do not store raw camera video data.</em></li>
            <li><strong>Usage Data:</strong> Breath-hold session logs, duration, and app interaction patterns.</li>
            <li><strong>Analytics:</strong> Technical information about how you use the App to help us improve performance and features (processed via PostHog).</li>
            <li><strong>Account Data:</strong> Information provided during account creation (e.g., email address).</li>
          </ul>

          <h2 className="text-2xl font-bold">2. How We Use Your Data</h2>
          <p>Your data is used solely to:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#94a3b8]">
            <li>Provide you with accurate, personalized wellness insights.</li>
            <li>Maintain and secure your account.</li>
            <li>Analyze product performance and improve the App experience.</li>
          </ul>
          <p><strong>We do not sell your personal health data to third parties.</strong></p>

          <h2 className="text-2xl font-bold">3. Data Security</h2>
          <p>
            Your data is stored securely using <strong>Supabase</strong>. We employ industry-standard security measures to protect your information from unauthorized access, loss, or misuse.
          </p>

          <h2 className="text-2xl font-bold">4. Sensor Permissions</h2>
          <p>
            Azora requires access to your device’s <strong>Camera and Flash</strong> to estimate your heart rate and HRV. We only access these sensors during active sessions. By using these features, you consent to this processing.
          </p>

          <h2 className="text-2xl font-bold">5. Third-Party Services</h2>
          <p>We work with trusted third-party providers to support our operations:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#94a3b8]">
            <li><strong>Supabase:</strong> For secure database management and authentication.</li>
            <li><strong>PostHog:</strong> For product analytics to help us understand how to improve the App.</li>
            <li><strong>Apple:</strong> For managing subscriptions and in-app purchases.</li>
            <li><strong>RevenueCat:</strong> To help us manage subscription statuses effectively.</li>
          </ul>

          <h2 className="text-2xl font-bold">6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
          </p>

          <h2 className="text-2xl font-bold">7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:<br />
            <strong>Email:</strong> kevin@tryazora.app<br />
            <strong>Company:</strong> 300 Labs
          </p>
        </section>
      </article>
    </main>
  );
}
