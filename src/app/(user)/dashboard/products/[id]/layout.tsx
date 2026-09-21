import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await prisma.accountType.findUnique({
      where: { id },
      include: {
        category: true,
        accounts: {
          where: { status: "AVAILABLE" },
          select: { id: true },
        },
      },
    });

    if (!product) {
      return {
        title: "Product Inventory",
        description: "Explore verified social media accounts on Thimslog.",
      };
    }

    const categoryName = product.category?.name || "Social Accounts";
    const availableCount = product.accounts?.length || 0;
    const priceFormatted = Number(product.price).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const ogImageUrl = `/api/og?type=product&title=${encodeURIComponent(
      product.name
    )}&category=${encodeURIComponent(categoryName)}&price=${product.price}&available=${availableCount}`;

    return {
      title: `${product.name} - Verified Account`,
      description: `Buy verified ${product.name} accounts on Thimslog. ${categoryName} category with instant delivery, 2FA backup codes, starting at ₦${priceFormatted}.`,
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        type: "website",
        locale: "en_NG",
        title: `${product.name} | Verified Account - Thimslog`,
        description: `Instant automated delivery. Category: ${categoryName}. Price: ₦${priceFormatted}. 100% Escrow security on Thimslog.`,
        url: `/products/${product.id}`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${product.name} - Verified Account on Thimslog`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Thimslog`,
        description: `Buy verified ${product.name} accounts starting at ₦${priceFormatted}. Instant delivery & 2FA.`,
        images: [ogImageUrl],
        creator: "@thimslog",
      },
    };
  } catch (error) {
    return {
      title: "Product Inventory | Thimslog",
      description: "Buy verified social media accounts on Thimslog.",
    };
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
