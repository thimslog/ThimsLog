import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/services/paymonetra";
import { getCurrentUser } from "@/lib/get-current-user";

export async function POST(request: NextRequest) {
  //   const userId = await getUserId(request);
  const userData = await getCurrentUser();
  const userId = userData?.id;
  if (!userId)
    return NextResponse.json(
      { message: "Unauthorized Access" },
      { status: 401 },
    );

  const { amount } = await request.json();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, paymonetraCustomer: `wallet_${userId}` },
    });
  }

  const merchantReference = `fund_${userId}_${Date.now()}_${randomUUID().slice(0, 8)}`;

  const payment = await createPayment({
    amount,
    reference: merchantReference,
    customerReference: wallet.paymonetraCustomer!,
    customerName: `${user.firstName} ${user.lastName}`,
    description: "Wallet top-up",
  });

  console.log("Paymonetra response:", JSON.stringify(payment, null, 2));

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "FUNDING",
      status: "PENDING",
      amountRequested: amount,
      merchantReference,
      paymonetraReference: payment.reference,
    },
  });

  return NextResponse.json({ checkoutUrl: payment.checkout_url });
}
