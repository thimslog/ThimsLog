import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://thimslog.com");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/products/*", "/signin", "/register"],
        disallow: [
          "/api/*",
          "/admin/*",
          "/dashboard/*",
          "/dashboard",
          "/admin",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
