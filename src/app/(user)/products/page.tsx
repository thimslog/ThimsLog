import type { Metadata } from "next";
import ProductCatalog from "@/app/(user)/dashboard/products/page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Social Accounts & Digital Inventory Catalog",
  description:
    "Explore our complete inventory of verified Instagram, Twitter/X, TikTok, Telegram, Facebook, and aged accounts with instant automated delivery on Thimslog.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    title: "Verified Social Accounts Catalog | Thimslog",
    description:
      "Browse and buy verified social accounts, aged profiles, and digital inventory with 100% escrow protection and instant delivery.",
    url: "/products",
    images: [
      {
        url: "/api/og?title=Verified+Accounts+Catalog&desc=Browse+Instagram%2C+Twitter%2C+TikTok%2C+Telegram+%26+More",
        width: 1200,
        height: 630,
        alt: "Thimslog Product Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Social Accounts Catalog | Thimslog",
    description:
      "Browse and buy verified social accounts, aged profiles, and digital inventory with instant automated delivery.",
    images: [
      "/api/og?title=Verified+Accounts+Catalog&desc=Browse+Instagram%2C+Twitter%2C+TikTok%2C+Telegram+%26+More",
    ],
    creator: "@thimslog",
  },
};

export default function PublicProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a14] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft size={15} /> Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
      <ProductCatalog />
    </div>
  );
}
