import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description:
    "Join thousands of traders buying and selling verified social media accounts with instant delivery and escrow protection on Thimslog.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Create an Account | Thimslog Marketplace",
    description: "Join Thimslog to buy verified social accounts, aged profiles, and digital inventory.",
    url: "/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
