import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import QueryProvider from "@/providers/QueryProvider";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0284c7" },
    { media: "(prefers-color-scheme: dark)", color: "#060a14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://thimslog.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Thimslog | Buy Verified Social Accounts & Digital Assets",
    template: "%s | Thimslog",
  },
  description:
    "Nigeria's premier marketplace for verified social media accounts, aged profiles, and digital inventory with instant automated delivery and secure escrow protection.",
  applicationName: "Thimslog",
  keywords: [
    "social media accounts",
    "buy verified accounts",
    "buy aged instagram accounts",
    "buy twitter x accounts",
    "buy tiktok accounts",
    "buy telegram accounts",
    "buy facebook accounts",
    "verified social inventory",
    "thimslog",
    "instant social account delivery",
    "escrow marketplace nigeria",
    "digital assets marketplace",
  ],
  authors: [{ name: "Thimslog Marketplace", url: siteUrl }],
  creator: "Thimslog",
  publisher: "Thimslog",
  category: "technology",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Thimslog",
    title: "Thimslog | Buy Verified Social Accounts & Digital Assets",
    description:
      "Instant automated delivery of verified social media accounts, aged profiles, and digital inventory with 100% escrow protection.",
    images: [
      {
        url: "/api/og?title=Thimslog&desc=Verified+Social+Accounts+%26+Digital+Assets",
        width: 1200,
        height: 630,
        alt: "Thimslog - Verified Social Inventory & Escrow Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thimslog | Buy Verified Social Accounts & Digital Assets",
    description:
      "Instant automated delivery of verified social media accounts, aged profiles, and digital inventory with 100% escrow protection.",
    images: ["/api/og?title=Thimslog&desc=Verified+Social+Accounts+%26+Digital+Assets"],
    creator: "@thimslog",
    site: "@thimslog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Thimslog",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Thimslog" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "Thimslog",
                  url: siteUrl,
                  logo: `${siteUrl}/favicon.png`,
                  description:
                    "Nigeria's verified marketplace for social media accounts, aged profiles, and digital inventory with escrow security.",
                  sameAs: ["https://twitter.com/thimslog"],
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: "Thimslog",
                  description:
                    "Buy verified social media accounts, aged profiles, and digital inventory.",
                  publisher: {
                    "@id": `${siteUrl}/#organization`,
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${siteUrl}/products?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var pathname = window.location.pathname || '';
                var isAdmin = pathname.indexOf('/admin') !== -1;
                var savedTheme = isAdmin
                  ? (localStorage.getItem('thimslog_admin_theme') || localStorage.getItem('thimslog_theme'))
                  : (localStorage.getItem('thimslog_user_theme') || localStorage.getItem('thimslog_theme'));
                
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-body bg-slate-50 text-slate-900 dark:bg-[#060a14] dark:text-slate-200 antialiased">
        <QueryProvider>
          <ToastProvider>
            {children}
            <PwaRegister />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
