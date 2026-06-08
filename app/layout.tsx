import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { faqData } from "./faq-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://azora.app";
const appStoreUrl =
  "https://apps.apple.com/us/app/azora-breathwork-for-wellness/id6763631574";

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Azora",
  applicationCategory: "HealthApplication",
  operatingSystem: "iOS",
  url: siteUrl,
  downloadUrl: appStoreUrl,
  description:
    "Azora is a breathwork companion that measures your heart rate through your iPhone camera (PPG), guides evidence-based breathing techniques, and reveals patterns in your stress and recovery.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqPageLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Azora - Breathwork & Heart Rate Guidance",
    template: "%s | Azora"
  },
  description:
    "Azora helps you breathe with intention, track your heart rate through your iPhone camera, and build calmer recovery rituals with guided breathwork.",
  applicationName: "Azora",
  keywords: [
    "Azora",
    "breathwork",
    "heart rate tracking",
    "HRV",
    "breathing app",
    "stress recovery",
    "mindfulness app"
  ],
  authors: [{ name: "Azora" }],
  creator: "Azora",
  publisher: "Azora",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }]
  },
  openGraph: {
    type: "website",
    siteName: "Azora",
    title: "Azora - Breathwork & Heart Rate Guidance",
    description:
      "Guided breathwork, live heart-rate feedback, and recovery insights from your iPhone camera.",
    images: [
      {
        url: "/icon.png",
        width: 1254,
        height: 1254,
        alt: "Azora app icon"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Azora - Breathwork & Heart Rate Guidance",
    description:
      "Guided breathwork, live heart-rate feedback, and recovery insights from your iPhone camera.",
    images: ["/icon.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
