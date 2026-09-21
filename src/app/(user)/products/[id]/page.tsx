import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductPurchasePage from "@/app/(user)/dashboard/products/[id]/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
        title: "Product Not Found",
        description: "The requested social account product is no longer available on Thimslog.",
      };
    }

    const categoryName = product.category?.name || "Social Accounts";
    const availableCount = product.accounts?.length || 0;
    const priceFormatted = Number(product.price).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const title = `${product.name} - Buy Verified Account | Thimslog`;
    const description = product.description
      ? product.description.slice(0, 160)
      : `Buy verified ${product.name} accounts on Thimslog. ${categoryName} category with instant delivery, 2FA setup, and escrow security starting at ₦${priceFormatted}.`;

    const ogImageUrl = `/api/og?type=product&title=${encodeURIComponent(
      product.name
    )}&category=${encodeURIComponent(categoryName)}&price=${product.price}&available=${availableCount}`;

    return {
      title,
      description,
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        type: "website",
        locale: "en_NG",
        title: `${product.name} | Verified Account - Thimslog`,
        description: `Instant automated delivery. Category: ${categoryName}. Price: ₦${priceFormatted}. Escrow protected on Thimslog.`,
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
      other: {
        "product:price:amount": String(product.price),
        "product:price:currency": "NGN",
        "product:availability": availableCount > 0 ? "in stock" : "out of stock",
        "product:category": categoryName,
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Product | Thimslog",
      description: "Buy verified social media accounts and digital assets on Thimslog.",
    };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // Query product for JSON-LD Structured Data
  let product = null;
  try {
    product = await prisma.accountType.findUnique({
      where: { id },
      include: {
        category: true,
        accounts: {
          where: { status: "AVAILABLE" },
          select: { id: true },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching product for JSON-LD:", err);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://thimslog.com");

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
          product.description ||
          `Verified ${product.name} social accounts with instant delivery on Thimslog.`,
        category: product.category?.name || "Social Accounts",
        url: `${siteUrl}/products/${product.id}`,
        offers: {
          "@type": "Offer",
          price: Number(product.price),
          priceCurrency: "NGN",
          availability:
            product.accounts.length > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Thimslog",
          },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPurchasePage />
    </>
  );
}
