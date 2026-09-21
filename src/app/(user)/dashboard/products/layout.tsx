import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Accounts & Inventory",
  description: "Browse verified social media accounts and digital inventory on Thimslog.",
  alternates: {
    canonical: "/products",
  },
};

export default function DashboardProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
