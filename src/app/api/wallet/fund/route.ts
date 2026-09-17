import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createPayment, calculateGrossAmount } from "@/services/paymonetra";
import { getCurrentUser } from "@/lib/get-current-user";

export async function POST(request: NextRequest) {
  try {
    const userData = await getCurrentUser();
    const userId = userData?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized Access" },
        { status: 401 }
      );
    }

    const { amount } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid amount" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, paymonetraCustomer: `wallet_${userId}` },
      });
    }

    const merchantReference = `fund_${userId}_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const customerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.userName ||
      user.email ||
      "Customer";

    const netDepositAmount = Number(amount);
    const { grossAmount, fee } = calculateGrossAmount(netDepositAmount);

    const payment = await createPayment({
      amount: grossAmount,
      reference: merchantReference,
      customerReference: wallet.paymonetraCustomer || `wallet_${userId}`,
      customerName,
      description: `Wallet top-up (₦${netDepositAmount.toLocaleString()})`,
    });

    console.log("Paymonetra response:", JSON.stringify(payment, null, 2));

    const checkoutUrl =
      payment?.checkout_url ||
      payment?.data?.checkout_url ||
      payment?.checkoutUrl ||
      payment?.url ||
      payment?.data?.url;

    const paymonetraRef =
      payment?.reference ||
      payment?.data?.reference ||
      payment?.id ||
      payment?.data?.id ||
      merchantReference;

    if (!checkoutUrl) {
      console.error("Paymonetra response missing checkoutUrl:", payment);
      return NextResponse.json(
        { message: "Could not retrieve checkout URL from payment gateway." },
        { status: 502 }
      );
    }

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "FUNDING",
        status: "PENDING",
        amountRequested: netDepositAmount,
        amount: grossAmount,
        merchantReference,
        paymonetraReference: paymonetraRef,
        metadata: {
          netAmount: netDepositAmount,
          fee,
          grossAmount,
        },
      },
    });

    return NextResponse.json({
      checkoutUrl,
      netAmount: netDepositAmount,
      fee,
      grossAmount,
    });
  } catch (error: any) {
    console.error("Wallet funding route error:", error);
    const message =
      error?.message ||
      "Payment gateway could not initialize payment. Please try again shortly.";
    return NextResponse.json(
      { message },
      { status: error?.status || 502 }
    );
  }
}
