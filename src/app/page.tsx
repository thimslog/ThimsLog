import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Thimslog | Buy Verified Social Accounts & Digital Assets",
  description:
    "Nigeria's #1 marketplace for verified social media accounts, aged Instagram, Twitter/X, TikTok, Telegram, and digital inventory with instant delivery and escrow protection.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    title: "Thimslog | Buy Verified Social Accounts & Digital Assets",
    description:
      "Instant automated delivery of verified social media accounts, aged profiles, and digital inventory with 100% escrow protection.",
    url: "/",
    images: [
      {
        url: "/api/og?title=Thimslog&desc=Buy+Verified+Social+Accounts+%26+Digital+Assets",
        width: 1200,
        height: 630,
        alt: "Thimslog Social Account Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thimslog | Buy Verified Social Accounts & Digital Assets",
    description:
      "Instant automated delivery of verified social media accounts, aged profiles, and digital inventory with 100% escrow protection.",
    images: ["/api/og?title=Thimslog&desc=Buy+Verified+Social+Accounts+%26+Digital+Assets"],
    creator: "@thimslog",
  },
};

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://thimslog.com");

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: "Thimslog | Buy Verified Social Accounts & Digital Assets",
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    about: {
      "@id": `${siteUrl}/#organization`,
    },
    description:
      "Buy verified social media accounts, aged profiles, and digital inventory with instant automated delivery and escrow protection.",
    potentialAction: [
      {
        "@type": "ReadAction",
        target: [siteUrl],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
