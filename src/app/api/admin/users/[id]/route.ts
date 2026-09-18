import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        referralCode: true,
        referredById: true,
        referredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            email: true,
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
            paymonetraCustomer: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            virtualAccountReference: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const [transactions, orders] = await Promise.all([
      user.wallet?.id
        ? prisma.transaction.findMany({
            where: { walletId: user.wallet.id },
            orderBy: { createdAt: "desc" },
          })
        : [],
      prisma.order.findMany({
        where: { userId: id },
        include: {
          accountType: {
            include: {
              category: true,
            },
          },
          accounts: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Compute stats
    let totalFunded = 0;
    let totalSpent = 0;
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amountRequested || tx.amount || 0);
      if (tx.status === "SUCCESS") {
        successCount++;
        if (tx.type === "FUNDING") {
          totalFunded += amt;
        } else if (tx.type === "PAYMENT") {
          totalSpent += amt;
        }
      } else if (tx.status === "PENDING") {
        pendingCount++;
      } else {
        failedCount++;
      }
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      quantity: o.quantity,
      unitPrice: Number(o.unitPrice),
      totalAmount: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt,
      accountType: o.accountType
        ? {
            id: o.accountType.id,
            name: o.accountType.name,
            category: o.accountType.category?.name,
          }
        : null,
      accounts: o.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        username: a.username,
        email: a.email,
        url: a.url,
        country: a.country,
        followers: a.followers,
        status: a.status,
        notes: a.notes,
        loginInstructions: a.loginInstructions,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        wallet: user.wallet
          ? {
              id: user.wallet.id,
              balance: Number(user.wallet.balance),
              currency: user.wallet.currency,
              paymonetraCustomer: user.wallet.paymonetraCustomer,
              bankName: user.wallet.bankName,
              accountNumber: user.wallet.accountNumber,
              accountName: user.wallet.accountName,
              virtualAccountReference: user.wallet.virtualAccountReference,
              createdAt: user.wallet.createdAt,
              updatedAt: user.wallet.updatedAt,
            }
          : null,
        transactions,
        orders: formattedOrders,
        stats: {
          totalTransactions: transactions.length,
          totalOrders: orders.length,
          totalFunded,
          totalSpent,
          successCount,
          pendingCount,
          failedCount,
        },
      },
    });
  } catch (error: any) {
    console.error("GET single user error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Cascade delete user and associated records inside transaction
    await prisma.$transaction(async (tx) => {
      // 1. Unlink any users referred by this user
      try {
        await tx.$executeRaw`
          UPDATE "User" SET "referredById" = NULL WHERE "referredById" = ${id};
        `;
      } catch {
        // Table/column might not exist
      }

      // 2. Delete ReferralReward records
      try {
        if ((tx as any).referralReward) {
          await (tx as any).referralReward.deleteMany({
            where: {
              OR: [{ referrerId: id }, { refereeId: id }],
            },
          });
        }
      } catch {
        // ReferralReward model might not exist
      }

      // 3. Delete Notifications
      try {
        await tx.notification.deleteMany({
          where: { userId: id },
        });
      } catch {
        // Notification model
      }

      // 4. Delete Support Tickets and responses
      try {
        const userTickets = await tx.supportTicket.findMany({
          where: { userId: id },
          select: { id: true },
        });
        const ticketIds = userTickets.map((t) => t.id);
        if (ticketIds.length > 0) {
          await tx.ticketResponse.deleteMany({
            where: { ticketId: { in: ticketIds } },
          });
          await tx.supportTicket.deleteMany({
            where: { id: { in: ticketIds } },
          });
        }
      } catch {
        // SupportTicket handling
      }

      // 5. Unlink Inventory Accounts from User's Orders, then delete Orders
      try {
        const userOrders = await tx.order.findMany({
          where: { userId: id },
          select: { id: true },
        });
        const orderIds = userOrders.map((o) => o.id);
        if (orderIds.length > 0) {
          await tx.inventoryAccount.updateMany({
            where: { orderId: { in: orderIds } },
            data: { orderId: null },
          });
          await tx.order.deleteMany({
            where: { id: { in: orderIds } },
          });
        }
      } catch {
        // Order handling
      }

      // 6. Delete Wallet and its Transactions
      if (user.wallet?.id) {
        await tx.transaction.deleteMany({
          where: { walletId: user.wallet.id },
        });
        await tx.wallet.delete({
          where: { id: user.wallet.id },
        });
      }

      // 7. Delete User record
      await tx.user.delete({
        where: { id },
      });

      // 8. Log Admin Audit Log
      try {
        if (tx.adminAuditLog) {
          await tx.adminAuditLog.create({
            data: {
              adminId: admin.adminId,
              adminEmail: admin.email,
              action: "DELETE_USER",
              entityType: "USER",
              entityId: id,
              entityLabel: `${user.firstName} ${user.lastName} (${user.userName})`,
              description: `Admin ${admin.email} deleted user account ${user.email} (@${user.userName})`,
              metadata: {
                deletedUser: {
                  id: user.id,
                  email: user.email,
                  userName: user.userName,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                },
              },
            },
          });
        }
      } catch (auditErr) {
        console.warn("Could not log admin audit entry:", auditErr);
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} (@${user.userName}) was deleted successfully.`,
    });
  } catch (error: any) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
