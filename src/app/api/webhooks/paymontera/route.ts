import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const PAYMONETRA_WEBHOOK_KEY =
  process.env.NODE_ENV === "development"
    ? process.env.PAYMONETRA_WEBHOOK_TEST_KEY
    : process.env.PAYMONETRA_WEBHOOK_LIVE_KEY;

export async function POST(request: NextRequest) {
  const rawBody = await request.text(); // exact bytes, before any JSON parsing
  const signature = request.headers.get("x-paymonetra-signature");

  const expected = crypto
    .createHmac("sha512", PAYMONETRA_WEBHOOK_KEY!)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return new NextResponse(null, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "collection.success") {
    return new NextResponse(null, { status: 200 });
  }

  const {
    reference: collectionReference,
    checkout_reference,
    amount,
  } = event.data;

  try {
    await prisma.$transaction(async (tx) => {
      const [txn] = await tx.$queryRaw<
        { id: string; walletId: string; status: string }[]
      >`
        SELECT * FROM "Transaction"
        WHERE "paymonetraReference" = ${checkout_reference}
        FOR UPDATE
      `;

      if (!txn)
        throw new Error(`No matching transaction for ${checkout_reference}`);
      if (txn.status === "SUCCESS") return; // already processed — safe no-op on retry

      await tx.transaction.update({
        where: { id: txn.id },
        data: { status: "SUCCESS", amount, collectionReference },
      });

      await tx.wallet.update({
        where: { id: txn.walletId },
        data: { balance: { increment: amount } },
      });
    });

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse(null, { status: 500 }); // Paymonetra retries on non-2xx
  }
}
