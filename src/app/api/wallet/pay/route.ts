import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function POST(request: NextRequest) {
  const userData = await getCurrentUser();
  const userId = userData?.id;
  if (!userId)
    return NextResponse.json({ message: "Unauthorized Access" }, { status: 401 });

  const { amount, productId } = await request.json();

  try {
    await prisma.$transaction(async (tx) => {
      const [wallet] = await tx.$queryRaw<{ id: string; balance: string }[]>`
        SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
      `;

      if (!wallet || Number(wallet.balance) < amount) {
        throw new Error("Insufficient balance");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "PAYMENT",
          status: "SUCCESS",
          amountRequested: amount,
          amount,
          merchantReference: `pay_${randomUUID()}`,
          metadata: { productId },
        },
      });
    });

    return NextResponse.json({ message: "Payment successful" });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 400 },
    );
  }
}
