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
          <p className="legalMeta">Last updated: November 6, 2026</p>
        </header>

        <p className="legalIntro">
          <strong>Azora</strong> is operated by <strong>300 Labs</strong> (&quot;we&quot;, &quot;us&quot;). This Privacy Policy explains what we collect, how we use it, who receives it, how long we keep it, and the choices you have when you use the Azora mobile application and website (the &quot;Service&quot;).
        </p>

        <section className="legalSection">
          <h2><span className="legalSectionNum">01</span>Information We Collect</h2>
          <ul>
            <li><strong>Account data:</strong> Your email address, sign-in provider (Apple or Google), and any display name or profile photo you add.</li>
            <li><strong>Profile and questionnaire answers:</strong> Answers you give during app onboarding and in our website questionnaires, such as your goals, age, gender, and how stress or sleep affects you.</li>
            <li><strong>Heart rate data:</strong> Heart rate, heart rate variability (HRV), and beat-to-beat interval measurements estimated with your device&rsquo;s camera and flash. <em>We do not store raw camera video.</em></li>
            <li><strong>Wellness activity:</strong> Breathing and breath-hold sessions, mood check-ins, self-care goals, to-dos, program progress, and in-app rewards.</li>
            <li><strong>Azo content:</strong> Messages you type or say to Azo, Azo&rsquo;s replies, and photos you choose for photo cleaning plans, along with the plans we generate.</li>
            <li><strong>Feedback and coaching:</strong> Feedback you send us and answers you submit in a coaching survey, including your contact details if you provide them.</li>
            <li><strong>Purchase data:</strong> Your plan, price, trial and renewal status, and transaction identifiers. We do not receive or store your full payment card number.</li>
            <li><strong>Usage and device data:</strong> Screens viewed, actions taken, crash and error reports, device and operating system details, IP address, approximate country derived from your IP address, time zone, and session recordings (see Section 04).</li>
            <li><strong>Advertising and attribution data:</strong> Ad click identifiers, campaign parameters, referring pages, cookies, the AppsFlyer ID, and, only if you allow tracking on iOS, your device&rsquo;s advertising identifier.</li>
          </ul>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">02</span>How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide the Service, including wellness insights, personalized plans, and AI features you choose to use.</li>
            <li>Maintain and secure your account, process subscriptions, and provide support.</li>
            <li>Analyze product performance, fix errors, and improve the Service.</li>
            <li>Measure and improve our advertising, including attributing installs, sign-ups, trials, and purchases to the ads and campaigns that led to them.</li>
            <li>Send you service-related and marketing communications (see Section 08).</li>
            <li>Comply with legal obligations and enforce our terms.</li>
          </ul>
          <div className="legalCallout">
            <p><strong>We do not sell your personal health data, and we do not use your heart rate data, mood check-ins, or Azo content for advertising.</strong></p>
          </div>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">03</span>AI Features and Google Gemini</h2>
          <p>
            Ask Azo, Plan with Azo, and photo cleaning plans use <strong>Google Gemini</strong>, a third-party AI service. We ask for your permission before these features share any information, and you can turn them off at any time in Settings. Turning them off stops new sharing. It does not recall information that was already sent.
          </p>
          <ul>
            <li><strong>What we send:</strong> The messages in your current Azo conversation, the titles and schedule details of your to-dos, today&rsquo;s date, and any photo you choose for a cleaning plan. Anything visible in a photo is included.</li>
            <li><strong>What we do not add:</strong> Your name, email address, heart rate measurements, mood check-ins, exercise history, and onboarding answers. They are included only if you type them into a message or they appear in your photo.</li>
            <li><strong>How Google handles it:</strong> Google processes this information to generate the result, under the terms that apply to its Gemini API and Google&rsquo;s Privacy Policy.</li>
            <li><strong>What we keep:</strong> Your Azo messages and replies, your cleaning plan photos in private storage, and the generated plans. Our service logs may also contain generated plans.</li>
          </ul>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">04</span>Analytics and Session Replay</h2>
          <p>
            We use <strong>PostHog</strong> for product analytics, error tracking, and session replay on the app and website. PostHog receives your user ID, the events you trigger, device details, and selected questionnaire answers such as your age range, gender, goal, and stress or sleep responses.
          </p>
          <p>
            Session replay creates a visual recording of how you move through the Service. Replays can show what is on your screen, including text you type and information displayed in the app, as well as app logs and network activity details. We pause session replay during photo cleaning plans. We use replays to find bugs and improve the Service, not for advertising.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">05</span>Advertising and Attribution</h2>
          <p>We advertise Azora and use the providers below to measure whether our ads work and to help ad platforms show them to relevant audiences.</p>
          <ul>
            <li><strong>Meta (Facebook and Instagram):</strong> Our website uses the Meta Pixel and Conversions API. Meta receives your IP address, browser details, Meta cookies and click identifiers, hashed email address, hashed user ID, hashed country, pages visited, questionnaire name, and events such as sign-ups, checkouts, trials, and purchases, including their value.</li>
            <li><strong>AppsFlyer:</strong> Our app uses AppsFlyer to attribute installs and in-app events to ad campaigns. AppsFlyer receives your user ID, hashed email address, device and app details, IP address, your AppsFlyer ID, and events such as completed registration and trial milestones. AppsFlyer may share attribution results with ad networks, including Meta.</li>
          </ul>
          <p>
            We do not send your heart rate data, mood check-ins, questionnaire answers, or Azo content to Meta or AppsFlyer.
          </p>
          <p>
            <strong>Your choices:</strong> On iOS, the app asks for your permission before it can access your advertising identifier, and you can change this at any time in Settings &gt; Privacy &amp; Security &gt; Tracking. If you decline, AppsFlyer can still receive attribution data that does not use the advertising identifier, including your hashed email address. On the web, you can block or clear cookies in your browser and manage ad preferences in your Meta account settings. To ask us to stop sharing your data for advertising, email us at the address in Section 13.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">06</span>Device Permissions</h2>
          <p>We ask for device permissions only for the features below. You can change them at any time in your device settings, but the related feature may stop working.</p>
          <ul>
            <li><strong>Camera and flash:</strong> To estimate heart rate and HRV during active sessions, and to take a photo when you request a cleaning plan.</li>
            <li><strong>Microphone and speech recognition:</strong> To turn your voice into text when you choose to talk to Azo. Your device&rsquo;s speech recognition service, provided by Apple or Google, may process the audio on the device or on its servers. We do not store your audio. We store and send the resulting text as described in Section 03.</li>
            <li><strong>Photo library:</strong> To let you choose a profile photo or a photo for a cleaning plan.</li>
            <li><strong>Motion sensors:</strong> To improve heart rate readings by detecting movement, and to support interactive visual effects.</li>
            <li><strong>Notifications:</strong> To send reminders you enable.</li>
          </ul>
          <p>The app does not collect your GPS location.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">07</span>Third-Party Services</h2>
          <p>In addition to the providers described above, we work with these service providers to operate the Service:</p>
          <ul>
            <li><strong>Supabase:</strong> Database, authentication, file storage, and server functions.</li>
            <li><strong>Apple and Google:</strong> Sign-in, app distribution, in-app purchases, and speech recognition.</li>
            <li><strong>RevenueCat:</strong> Subscription management. RevenueCat receives your user ID, purchase history, device identifiers, your AppsFlyer ID, and your tracking permission status.</li>
            <li><strong>Stripe:</strong> Payment processing for purchases made on our website.</li>
            <li><strong>Vercel:</strong> Website hosting and website analytics.</li>
            <li><strong>Calendly:</strong> Scheduling, if you choose to book a coaching call.</li>
            <li><strong>Email delivery providers:</strong> Sending account and marketing email.</li>
          </ul>
          <p>We may also disclose information if the law requires it, to protect rights and safety, or as part of a merger or sale of our business. Our providers may process data in the United States and other countries.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">08</span>Email &amp; Marketing Communications</h2>
          <p>When you create an account or join our waitlist, we may use your email address to send you:</p>
          <ul>
            <li><strong>Transactional emails:</strong> Account confirmations, receipts, security notices, and other messages necessary to operate the Service.</li>
            <li><strong>Marketing emails:</strong> Product updates, wellness tips, new features, and promotional offers from Azora.</li>
          </ul>
          <p>
            By creating an account and accepting this Privacy Policy, you consent to receiving these communications. You can <strong>opt out of marketing emails at any time</strong> by clicking the unsubscribe link in any marketing email or by contacting us at kevin@tryazora.app. Transactional emails are required to operate your account and cannot be opted out of while you maintain an account.
          </p>
          <p>We will never share or sell your email address to third parties for their own marketing purposes. A hashed version of your email address is shared with Meta and AppsFlyer for ad measurement, as described in Section 05.</p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">09</span>Data Retention</h2>
          <p>We keep your account data, wellness data, Azo messages, and cleaning plan photos until you delete them or delete your account.</p>
          <ul>
            <li><strong>Website questionnaires:</strong> Answers and attribution data from visits that are not linked to an account are kept until we delete them or you ask us to delete them.</li>
            <li><strong>Purchase records:</strong> We may keep subscription event records after you delete your account, with the link to your account removed, for accounting, tax, and fraud prevention.</li>
            <li><strong>Third-party providers:</strong> Data already sent to analytics, advertising, AI, and payment providers is kept under their own retention terms and is not automatically removed when you delete your Azora account. Contact us to request deletion from these providers.</li>
          </ul>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">10</span>Account Deletion and Your Rights</h2>
          <p>
            <strong>To delete your account in the app:</strong> Go to Settings &gt; Account Management &gt; Delete account, and confirm. This permanently deletes your account, the wellness data and Azo messages stored with it, and your cleaning plan photos. Deleting your account does not cancel an Apple subscription. Cancel it in your Apple ID settings.
          </p>
          <p>
            If you cannot access the app, or you want data deleted that is not linked to your account, email us at kevin@tryazora.app.
          </p>
          <p>
            Depending on where you live, you may have the right to access, correct, delete, or receive a copy of your personal data, to object to or restrict certain processing, to withdraw consent, to opt out of the use of your data for targeted advertising, and to complain to your local data protection authority. Some laws may treat sharing identifiers with ad platforms as a &quot;sale&quot; or &quot;sharing&quot; of personal data, even though no money changes hands. To exercise any of these rights, email us at kevin@tryazora.app. We will not discriminate against you for making a request.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">11</span>Data Security and Children</h2>
          <p>
            Your data is stored using <strong>Supabase</strong> and is encrypted in transit and at rest. We use industry-standard measures to protect your information, but no system is completely secure.
          </p>
          <p>
            You must be at least 13 years old to use the Service. We do not knowingly collect personal data from children under 13. If you believe a child has given us personal data, contact us and we will delete it.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">12</span>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. If we change our AI provider or the kind of information we share with it, we will ask for your permission again.
          </p>
        </section>

        <section className="legalSection">
          <h2><span className="legalSectionNum">13</span>Contact Us</h2>
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
