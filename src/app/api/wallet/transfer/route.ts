import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { recipientUsername, amount, note } = body;

    const cleanUsername = String(recipientUsername || "").trim().replace(/^@/, "");
    const transferAmount = Number(amount);

    if (!cleanUsername) {
      return NextResponse.json(
        { message: "Please enter a recipient username" },
        { status: 400 }
      );
    }

    if (!transferAmount || isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid transfer amount greater than ₦0" },
        { status: 400 }
      );
    }

    if (transferAmount < 10) {
      return NextResponse.json(
        { message: "Minimum transfer amount is ₦10.00" },
        { status: 400 }
      );
    }

    // Fetch Sender
    const sender = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!sender) {
      return NextResponse.json(
        { message: "Sender account not found" },
        { status: 404 }
      );
    }

    // Fetch Recipient
    const recipient = await prisma.user.findFirst({
      where: {
        userName: {
          equals: cleanUsername,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { message: `@${cleanUsername} does not exist on Thimslog` },
        { status: 404 }
      );
    }

    if (recipient.id === sender.id) {
      return NextResponse.json(
        { message: "You cannot transfer money to yourself" },
        { status: 400 }
      );
    }

    // Deterministic ordering to prevent database deadlocks under high concurrency
    const orderedUserIds = [sender.id, recipient.id].sort();

    // Execute atomic transfer with PostgreSQL row locks
    const result = await prisma.$transaction(async (tx) => {
      // 1. Acquire row-level locks on both wallets
      for (const uid of orderedUserIds) {
        await tx.$queryRaw`
          SELECT * FROM "Wallet" WHERE "userId" = ${uid} FOR UPDATE
        `;
      }

      // 2. Fetch locked sender wallet
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: sender.id },
      });

      if (!senderWallet) {
        throw new Error("Sender wallet record not found. Please contact support.");
      }

      if (Number(senderWallet.balance) < transferAmount) {
        throw new Error(
          `Insufficient funds. Your available balance is ₦${Number(
            senderWallet.balance
          ).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        );
      }

      // 3. Fetch or initialize recipient wallet
      let recipientWallet = await tx.wallet.findUnique({
        where: { userId: recipient.id },
      });

      if (!recipientWallet) {
        recipientWallet = await tx.wallet.create({
          data: {
            userId: recipient.id,
            balance: 0,
          },
        });
      }

      // 4. Update balances atomically
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: transferAmount } },
      });

      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: transferAmount } },
      });

      const senderTxRef = `tr_out_${randomUUID()}`;
      const recipientTxRef = `tr_in_${randomUUID()}`;
      const recipientFullName = `${recipient.firstName} ${recipient.lastName}`.trim();
      const senderFullName = `${sender.firstName} ${sender.lastName}`.trim();

      // 5. Create double-entry transaction records
      try {
        await tx.transaction.create({
          data: {
            walletId: senderWallet.id,
            type: "TRANSFER_SENT" as any,
            status: "SUCCESS",
            amountRequested: transferAmount,
            amount: transferAmount,
            merchantReference: senderTxRef,
            provider: "thimslog_internal",
            metadata: {
              recipientId: recipient.id,
              recipientUsername: recipient.userName,
              recipientName: recipientFullName,
              note: note ? String(note).trim() : null,
              transferType: "TRANSFER_SENT",
            },
          },
        });
      } catch (txErr) {
        // Fallback if Prisma Client runtime validation rejects TRANSFER_SENT before regeneration
        await tx.transaction.create({
          data: {
            walletId: senderWallet.id,
            type: "PAYMENT" as any,
            status: "SUCCESS",
            amountRequested: transferAmount,
            amount: transferAmount,
            merchantReference: senderTxRef,
            provider: "thimslog_internal",
            metadata: {
              recipientId: recipient.id,
              recipientUsername: recipient.userName,
              recipientName: recipientFullName,
              note: note ? String(note).trim() : null,
              transferType: "TRANSFER_SENT",
            },
          },
        });
      }

      try {
        await tx.transaction.create({
          data: {
            walletId: recipientWallet.id,
            type: "TRANSFER_RECEIVED" as any,
            status: "SUCCESS",
            amountRequested: transferAmount,
            amount: transferAmount,
            merchantReference: recipientTxRef,
            provider: "thimslog_internal",
            metadata: {
              senderId: sender.id,
              senderUsername: sender.userName,
              senderName: senderFullName,
              note: note ? String(note).trim() : null,
              transferType: "TRANSFER_RECEIVED",
            },
          },
        });
      } catch (txErr) {
        // Fallback if Prisma Client runtime validation rejects TRANSFER_RECEIVED before regeneration
        await tx.transaction.create({
          data: {
            walletId: recipientWallet.id,
            type: "FUNDING" as any,
            status: "SUCCESS",
            amountRequested: transferAmount,
            amount: transferAmount,
            merchantReference: recipientTxRef,
            provider: "thimslog_internal",
            metadata: {
              senderId: sender.id,
              senderUsername: sender.userName,
              senderName: senderFullName,
              note: note ? String(note).trim() : null,
              transferType: "TRANSFER_RECEIVED",
            },
          },
        });
      }

      const formattedAmount = `₦${transferAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      // 6. Create in-app notification for Recipient
      try {
        if ((tx as any).notification?.create) {
          await (tx as any).notification.create({
            data: {
              userId: recipient.id,
              title: "Funds Received 💸",
              message: `You received ${formattedAmount} from @${sender.userName} (${senderFullName}).${
                note ? ` Note: "${note}"` : ""
              }`,
              type: "TRANSFER_RECEIVED",
              metadata: {
                amount: transferAmount,
                senderUsername: sender.userName,
                senderName: senderFullName,
                note: note || null,
              },
            },
          });
        } else {
          await tx.$executeRawUnsafe(
            `INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "read", "metadata", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW())`,
            randomUUID(),
            recipient.id,
            "Funds Received 💸",
            `You received ${formattedAmount} from @${sender.userName} (${senderFullName}).${
              note ? ` Note: "${note}"` : ""
            }`,
            "TRANSFER_RECEIVED",
            false,
            JSON.stringify({
              amount: transferAmount,
              senderUsername: sender.userName,
              senderName: senderFullName,
              note: note || null,
            })
          );
        }
      } catch (notifErr) {
        console.warn("Failed to create recipient notification:", notifErr);
      }

      // 7. Create in-app notification for Sender
      try {
        if ((tx as any).notification?.create) {
          await (tx as any).notification.create({
            data: {
              userId: sender.id,
              title: "Transfer Sent 🚀",
              message: `You successfully sent ${formattedAmount} to @${recipient.userName} (${recipientFullName}).`,
              type: "TRANSFER_SENT",
              metadata: {
                amount: transferAmount,
                recipientUsername: recipient.userName,
                recipientName: recipientFullName,
                note: note || null,
              },
            },
          });
        } else {
          await tx.$executeRawUnsafe(
            `INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "read", "metadata", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW())`,
            randomUUID(),
            sender.id,
            "Transfer Sent 🚀",
            `You successfully sent ${formattedAmount} to @${recipient.userName} (${recipientFullName}).`,
            "TRANSFER_SENT",
            false,
            JSON.stringify({
              amount: transferAmount,
              recipientUsername: recipient.userName,
              recipientName: recipientFullName,
              note: note || null,
            })
          );
        }
      } catch (notifErr) {
        console.warn("Failed to create sender notification:", notifErr);
      }

      return {
        newBalance: updatedSenderWallet.balance,
        recipient: {
          userName: recipient.userName,
          fullName: recipientFullName,
        },
        amount: transferAmount,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully sent ₦${transferAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })} to @${result.recipient.userName}`,
      data: result,
    });
  } catch (error: any) {
    console.error("P2P Transfer error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to complete transfer" },
      { status: 400 }
    );
  }
}
