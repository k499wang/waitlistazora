import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://azora.app";

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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
