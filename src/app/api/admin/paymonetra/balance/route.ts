import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { getMerchantBalance, extractPaymonetraBalance } from "@/services/paymonetra";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const res = await getMerchantBalance();
    console.log("[Paymonetra Balance API Raw Response]:", JSON.stringify(res));

    const extracted = extractPaymonetraBalance(res);

    return NextResponse.json({
      success: true,
      balance: extracted.balance,
      collectedAmount: extracted.collectedAmount,
      collectedReady: extracted.collectedReady,
      collectedClearing: extracted.collectedClearing,
      settledAmount: extracted.settledAmount,
      ledgerBalance: extracted.ledgerBalance,
      currency: extracted.currency,
      mode: extracted.mode,
      raw: res,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Paymonetra getMerchantBalance error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch Paymonetra balance",
        balance: 0,
        currency: "NGN",
      },
      { status: 500 }
    );
  }
}
