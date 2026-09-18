import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { fallbackTickets } from "@/lib/ticket-store";
import { getMerchantBalance, extractPaymonetraBalance } from "@/services/paymonetra";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Transactions & Financial Metrics
    let successRevenue = 0;
    let successCount = 0;
    let pendingCount = 0;
    let pendingVolume = 0;
    let allTransactionsCount = 0;
    let recentTransactions: any[] = [];

    try {
      const [
        successAgg,
        pendingAgg,
        pCount,
        allCount,
        txList,
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: { status: "SUCCESS" },
          _sum: { amountRequested: true, amount: true },
          _count: true,
        }),
        prisma.transaction.aggregate({
          where: { status: "PENDING" },
          _sum: { amountRequested: true },
        }),
        prisma.transaction.count({ where: { status: "PENDING" } }),
        prisma.transaction.count(),
        prisma.transaction.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            wallet: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    userName: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      successRevenue = Number(successAgg._sum.amountRequested || 0);
      successCount = successAgg._count || 0;
      pendingCount = pCount;
      pendingVolume = Number(pendingAgg._sum.amountRequested || 0);
      allTransactionsCount = allCount;
      recentTransactions = txList;
    } catch (txErr) {
      console.warn("Transaction metrics aggregation warning:", txErr);
    }

    // 2. Wallet Liability
    let totalWalletLiability = 0;
    try {
      const walletAgg = await prisma.wallet.aggregate({
        _sum: { balance: true },
      });
      totalWalletLiability = Number(walletAgg._sum.balance || 0);
    } catch (wErr) {
      console.warn("Wallet aggregation warning:", wErr);
    }

    // 3. User Growth
    let totalUsers = 0;
    let newUsersThisWeek = 0;
    try {
      const [uCount, newCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        }),
      ]);
      totalUsers = uCount;
      newUsersThisWeek = newCount;
    } catch (uErr) {
      console.warn("User metrics aggregation warning:", uErr);
    }

    // 4. Inventory Accounts & Stock
    let availableAccountsCount = 0;
    let soldAccountsCount = 0;
    let totalInventoryCount = 0;
    let lowStockProducts: any[] = [];

    try {
      const [availCount, sCount, totInv, accountTypes] = await Promise.all([
        prisma.inventoryAccount.count({ where: { status: "AVAILABLE" } }),
        prisma.inventoryAccount.count({ where: { status: "SOLD" } }),
        prisma.inventoryAccount.count(),
        prisma.accountType.findMany({
          include: {
            category: {
              select: { name: true },
            },
            accounts: {
              where: { status: "AVAILABLE" },
              select: { id: true },
            },
          },
          orderBy: { name: "asc" },
        }),
      ]);

      availableAccountsCount = availCount;
      soldAccountsCount = sCount;
      totalInventoryCount = totInv;

      lowStockProducts = accountTypes
        .map((at) => ({
          id: at.id,
          name: at.name,
          category: at.category?.name || "Inventory",
          price: Number(at.price),
          available: at.accounts ? at.accounts.length : 0,
        }))
        .filter((at) => at.available <= 3)
        .sort((a, b) => a.available - b.available)
        .slice(0, 6);
    } catch (invErr) {
      console.warn("Inventory metrics aggregation warning:", invErr);
    }

    // 5. Orders & Sales
    let totalOrdersCount = 0;
    let totalSalesVolume = 0;
    let recentOrders: any[] = [];

    try {
      const [ordersAgg, oCount, oList] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
        }),
        prisma.order.count(),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            accountType: {
              select: {
                name: true,
                category: { select: { name: true } },
              },
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                userName: true,
              },
            },
          },
        }),
      ]);

      totalSalesVolume = Number(ordersAgg._sum.totalAmount || 0);
      totalOrdersCount = oCount;
      recentOrders = oList;
    } catch (orderErr) {
      console.warn("Order metrics aggregation warning:", orderErr);
    }

    // 6. Support Tickets
    let openTicketsCount = 0;
    let urgentTicketsCount = 0;
    let recentTickets: any[] = [];

    try {
      if ((prisma as any).supportTicket) {
        const [openCount, urgentCount, tickets] = await Promise.all([
          (prisma as any).supportTicket.count({
            where: { status: "OPEN" },
          }),
          (prisma as any).supportTicket.count({
            where: {
              status: "OPEN",
              priority: { in: ["URGENT", "HIGH"] },
            },
          }),
          (prisma as any).supportTicket.findMany({
            take: 4,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  userName: true,
                },
              },
            },
          }),
        ]);

        openTicketsCount = openCount;
        urgentTicketsCount = urgentCount;
        recentTickets = tickets;
      }
    } catch {
      // Fallback in-memory ticket stats
      openTicketsCount = fallbackTickets.filter((t) => t.status === "OPEN").length;
      urgentTicketsCount = fallbackTickets.filter(
        (t) => t.status === "OPEN" && (t.priority === "URGENT" || t.priority === "HIGH")
      ).length;
      recentTickets = fallbackTickets.slice(0, 4);
    }

    // 7. Paymonetra Live Merchant Balance
    let paymonetraBalance = 0;
    let paymonetraCollectedAmount = 0;
    let paymonetraCollectedReady = 0;
    let paymonetraCollectedClearing = 0;
    let paymonetraSettledAmount = 0;
    let paymonetraLedgerBalance: number | undefined = undefined;
    let paymonetraCurrency = "NGN";
    let paymonetraMode = "live";
    let paymonetraStatus: "connected" | "error" = "connected";

    try {
      const pmRes = await getMerchantBalance();
      const extracted = extractPaymonetraBalance(pmRes);
      paymonetraBalance = extracted.balance;
      paymonetraCollectedAmount = extracted.collectedAmount;
      paymonetraCollectedReady = extracted.collectedReady;
      paymonetraCollectedClearing = extracted.collectedClearing;
      paymonetraSettledAmount = extracted.settledAmount;
      paymonetraLedgerBalance = extracted.ledgerBalance;
      paymonetraCurrency = extracted.currency;
      paymonetraMode = extracted.mode || "live";
    } catch (pmErr) {
      console.warn("Could not fetch Paymonetra merchant balance for dashboard:", pmErr);
      paymonetraStatus = "error";
    }

    return NextResponse.json({
      success: true,
      data: {
        paymonetra: {
          balance: paymonetraBalance,
          collectedAmount: paymonetraCollectedAmount,
          collectedReady: paymonetraCollectedReady,
          collectedClearing: paymonetraCollectedClearing,
          settledAmount: paymonetraSettledAmount,
          ledgerBalance: paymonetraLedgerBalance,
          currency: paymonetraCurrency,
          mode: paymonetraMode,
          status: paymonetraStatus,
        },
        financials: {
          totalSettledRevenue: successRevenue,
          totalWalletLiability: totalWalletLiability,
          pendingTransactionsCount: pendingCount,
          pendingTransactionsVolume: pendingVolume,
          successCount: successCount,
          allTransactionsCount,
        },
        sales: {
          totalOrdersCount,
          totalSalesVolume,
          accountsSold: soldAccountsCount,
          accountsAvailable: availableAccountsCount,
          totalInventory: totalInventoryCount,
        },
        users: {
          totalUsers,
          newUsersThisWeek,
        },
        support: {
          openTicketsCount,
          urgentTicketsCount,
        },
        lowStockProducts,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          productName: o.accountType?.name || "Social Account Pack",
          categoryName: o.accountType?.category?.name || "Inventory",
          buyerName: `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() || o.user?.userName || "Customer",
          buyerEmail: o.user?.email || "N/A",
          quantity: o.quantity,
          totalAmount: Number(o.totalAmount),
          status: o.status,
          createdAt: o.createdAt,
        })),
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          customerName: `${t.wallet?.user?.firstName || ""} ${t.wallet?.user?.lastName || ""}`.trim() || t.wallet?.user?.userName || "Customer",
          customerEmail: t.wallet?.user?.email || "N/A",
          type: t.type,
          status: t.status,
          amountRequested: Number(t.amountRequested),
          amount: t.amount ? Number(t.amount) : null,
          merchantReference: t.merchantReference,
          createdAt: t.createdAt,
        })),
        recentTickets: recentTickets.map((t) => ({
          id: t.id,
          subject: t.subject,
          priority: t.priority,
          status: t.status,
          customerName: t.user ? `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim() || t.user.userName || "Customer" : "Customer",
          customerEmail: t.user?.email || "N/A",
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Admin dashboard route error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
