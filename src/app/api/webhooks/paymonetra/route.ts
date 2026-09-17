// export { POST } from "../paymontera/route";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function getCandidateSecrets(): string[] {
    const keys = [
        process.env.PAYMONETRA_WEBHOOK_SECRET,
        process.env.PAYMONETRA_WEBHOOK_LIVE_KEY,
        process.env.PAYMONETRA_WEBHOOK_KEY,
        process.env.PAYMONETRA_WEBHOOK_LIVE_SECRET,
        process.env.PAYMONETRA_SIGNING_SECRET,
        process.env.PAYMONETRA_WEBHOOK_TEST_KEY,
        process.env.PAYMONETRA_SECRET_LIVE_KEY,
        process.env.PAYMONETRA_SECRET_KEY,
        process.env.PAYMONETRA_SECRET_TEST_KEY,
    ];

    return keys
        .filter((k): k is string => Boolean(k && k.trim()))
        .map((k) => k.trim());
}

function isValidSignature(rawBody: string, signature: string): boolean {
    const cleanSig = signature.trim().toLowerCase();
    const secrets = getCandidateSecrets();

    for (const secret of secrets) {
        try {
            const expected = crypto
                .createHmac("sha512", secret)
                .update(rawBody)
                .digest("hex")
                .toLowerCase();

            if (
                cleanSig.length === expected.length &&
                crypto.timingSafeEqual(Buffer.from(cleanSig), Buffer.from(expected))
            ) {
                return true;
            }
        } catch (e) {
            // Continue testing next secret
        }
    }

    return false;
}

export async function POST(request: NextRequest) {
    const rawBody = await request.text(); // exact bytes, before any JSON parsing
    const signature =
        request.headers.get("x-paymonetra-signature") ||
        request.headers.get("X-Paymonetra-Signature") ||
        request.headers.get("signature");

    const secrets = getCandidateSecrets();
    if (secrets.length === 0) {
        console.error(
            "Paymonetra webhook error: No webhook secret or API key configured in environment variables (PAYMONETRA_WEBHOOK_SECRET / PAYMONETRA_WEBHOOK_LIVE_KEY)."
        );
        return new NextResponse("Webhook secret missing", { status: 500 });
    }

    if (!signature || !isValidSignature(rawBody, signature)) {
        console.warn(
            `Paymonetra webhook signature mismatch. Header present: ${Boolean(
                signature
            )}, Tested secrets count: ${secrets.length}`
        );
        return new NextResponse("Invalid signature", { status: 401 });
    }

    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch (err) {
        console.error("Failed to parse Paymonetra webhook JSON body:", err);
        return new NextResponse("Bad JSON", { status: 400 });
    }

    if (event.event !== "collection.success") {
        // Acknowledge other event types with 200
        return new NextResponse(null, { status: 200 });
    }

    const {
        reference: collectionReference,
        checkout_reference,
        customer_reference,
        account_number,
        amount,
        fee,
        net,
    } = event.data || {};

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Check if this collection event was already processed (Idempotency)
            if (collectionReference) {
                const alreadyDone = await tx.transaction.findFirst({
                    where: {
                        collectionReference,
                        status: "SUCCESS",
                    },
                });
                if (alreadyDone) {
                    console.log(`Webhook already processed for collection ${collectionReference}`);
                    return;
                }
            }

            // 2. Look for an existing transaction (e.g. initiated via Add Funds checkout)
            const matchConditions: any[] = [];
            if (checkout_reference) {
                matchConditions.push(
                    { paymonetraReference: checkout_reference },
                    { merchantReference: checkout_reference }
                );
            }
            if (collectionReference) {
                matchConditions.push(
                    { collectionReference },
                    { paymonetraReference: collectionReference },
                    { merchantReference: collectionReference }
                );
            }

            const existingTxn =
                matchConditions.length > 0
                    ? await tx.transaction.findFirst({
                        where: { OR: matchConditions },
                    })
                    : null;

            if (existingTxn) {
                if (existingTxn.status === "SUCCESS") return; // safe no-op

                const creditAmount = existingTxn.amountRequested || amount;

                await tx.transaction.update({
                    where: { id: existingTxn.id },
                    data: {
                        status: "SUCCESS",
                        amount,
                        collectionReference: collectionReference || existingTxn.collectionReference,
                        metadata: event.data,
                    },
                });

                await tx.wallet.update({
                    where: { id: existingTxn.walletId },
                    data: { balance: { increment: creditAmount } },
                });

                console.log(
                    `Credited ₦${creditAmount} to wallet ${existingTxn.walletId} from checkout transaction ${existingTxn.id}`
                );
            } else {
                // 3. Direct bank transfer into Virtual Account (no prior checkout transaction)
                const walletFilters: any[] = [];
                if (customer_reference) {
                    walletFilters.push({ paymonetraCustomer: customer_reference });
                    walletFilters.push({ virtualAccountReference: customer_reference });
                    if (customer_reference.startsWith("wallet_")) {
                        const uid = customer_reference.replace("wallet_", "");
                        walletFilters.push({ userId: uid });
                    }
                }
                if (account_number) {
                    walletFilters.push({ accountNumber: String(account_number) });
                }

                if (walletFilters.length === 0) {
                    throw new Error("No customer_reference or account_number provided in webhook payload");
                }

                const wallet = await tx.wallet.findFirst({
                    where: { OR: walletFilters },
                });

                if (!wallet) {
                    throw new Error(
                        `No wallet found matching customer: ${customer_reference}, account: ${account_number}`
                    );
                }

                // Determine net deposit amount to credit user wallet
                const depositGross = Number(amount) || 0;
                const depositFee = Number(fee) || 0;
                const depositNet = net !== undefined && net !== null ? Number(net) : depositGross - depositFee;
                const finalCredit = depositNet > 0 ? depositNet : depositGross;

                const txnRef = collectionReference || `va_${Date.now()}`;

                // Create transaction record for the virtual account transfer
                await tx.transaction.create({
                    data: {
                        walletId: wallet.id,
                        type: "FUNDING",
                        status: "SUCCESS",
                        amountRequested: finalCredit,
                        amount: depositGross,
                        merchantReference: `va_${txnRef}`,
                        paymonetraReference: txnRef,
                        collectionReference: collectionReference || txnRef,
                        provider: "paymontera",
                        metadata: {
                            ...event.data,
                            channel: "virtual_account_transfer",
                            grossAmount: depositGross,
                            fee: depositFee,
                            netAmount: depositNet,
                        },
                    },
                });

                // Increment wallet balance
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: finalCredit } },
                });

                console.log(
                    `Credited ₦${finalCredit} to wallet ${wallet.id} from direct virtual account transfer ${txnRef}`
                );
            }
        });

        return new NextResponse(null, { status: 200 });
    } catch (err) {
        console.error("Webhook processing error:", err);
        return new NextResponse(null, { status: 500 }); // Paymonetra retries on non-2xx
    }
}

