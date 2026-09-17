import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/services/paymonetra";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference)
    return NextResponse.json({ message: "Missing reference" }, { status: 400 });

  const payment = await getPayment(reference);
  // Only for showing UI state — the webhook is what actually credits the wallet
  return NextResponse.json({ status: payment.status });
}
