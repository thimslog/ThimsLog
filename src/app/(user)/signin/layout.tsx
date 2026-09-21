import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your Account",
  description:
    "Sign in to your Thimslog account to buy verified social accounts, manage orders, and fund your wallet.",
  alternates: {
    canonical: "/signin",
  },
  openGraph: {
    title: "Sign In | Thimslog Marketplace",
    description: "Access your dashboard to buy verified social media accounts with escrow protection.",
    url: "/signin",
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
