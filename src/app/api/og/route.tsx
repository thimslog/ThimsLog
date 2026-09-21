import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Thimslog";
    const desc =
      searchParams.get("desc") ||
      "Verified Social Accounts, Aged Profiles & Digital Inventory";
    const price = searchParams.get("price");
    const category = searchParams.get("category") || "Social Assets";
    const available = searchParams.get("available");
    const isProduct = searchParams.get("type") === "product" || Boolean(price);

    const formattedPrice = price
      ? `₦${Number(price).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#060a14",
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(2, 132, 199, 0.25) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(147, 51, 234, 0.2) 0%, transparent 45%)",
            padding: "50px 65px",
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          {/* Top Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Brand Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  backgroundColor: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  boxShadow: "0 0 25px rgba(2, 132, 199, 0.5)",
                }}
              >
                T
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 900,
                    letterSpacing: "-0.5px",
                    color: "#ffffff",
                  }}
                >
                  Thimslog
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#38bdf8",
                  }}
                >
                  Verified Marketplace
                </span>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#34d399",
                  fontSize: "13px",
                  fontWeight: "bold",
                  letterSpacing: "0.5px",
                }}
              >
                ● INSTANT DELIVERY
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(2, 132, 199, 0.15)",
                  border: "1px solid rgba(2, 132, 199, 0.35)",
                  color: "#38bdf8",
                  fontSize: "13px",
                  fontWeight: "bold",
                  letterSpacing: "0.5px",
                }}
              >
                🔒 ESCROW PROTECTED
              </div>
            </div>
          </div>

          {/* Middle Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            {isProduct && category && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontSize: "13px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#e2e8f0",
                }}
              >
                {category}
              </div>
            )}

            <h1
              style={{
                fontSize: title.length > 35 ? "44px" : "56px",
                fontWeight: 900,
                letterSpacing: "-1px",
                lineHeight: 1.15,
                color: "#ffffff",
                margin: 0,
                maxWidth: "1050px",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </h1>

            {isProduct && formattedPrice ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "16px",
                    backgroundColor: "#0284c7",
                    boxShadow: "0 10px 30px rgba(2, 132, 199, 0.4)",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: "#e0f2fe" }}>
                    PRICE:
                  </span>
                  <span
                    style={{
                      fontSize: "36px",
                      fontWeight: 900,
                      color: "#ffffff",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {formattedPrice}
                  </span>
                </div>

                {available && Number(available) > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 18px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#34d399",
                    }}
                  >
                    ✓ {available} Accounts In Stock
                  </div>
                ) : null}
              </div>
            ) : (
              <p
                style={{
                  fontSize: "22px",
                  lineHeight: 1.4,
                  color: "#94a3b8",
                  margin: 0,
                  maxWidth: "900px",
                }}
              >
                {desc}
              </p>
            )}
          </div>

          {/* Bottom Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: "bold", color: "#38bdf8" }}>
                thimslog.com
              </span>
              <span style={{ fontSize: "14px", color: "#64748b" }}>•</span>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                100% Verified Delivery & 2FA Setup
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#94a3b8",
              }}
            >
              🇳🇬 #1 Social Account Marketplace in Nigeria
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
