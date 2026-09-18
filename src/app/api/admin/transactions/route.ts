import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isExport = searchParams.get("export") === "true";
    const page = isExport ? 1 : Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = isExport ? 10000 : Math.min(Math.max(Number(searchParams.get("limit")) || 15, 1), 100);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search")?.trim();

    const skip = isExport ? 0 : (page - 1) * limit;

    // Build where clause
    const where: Prisma.TransactionWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status as any;
    }

    if (type && type !== "ALL") {
      where.type = type as any;
    }

    if (search) {
      where.OR = [
        { merchantReference: { contains: search, mode: "insensitive" } },
        { paymonetraReference: { contains: search, mode: "insensitive" } },
        { collectionReference: { contains: search, mode: "insensitive" } },
        {
          wallet: {
            user: {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { userName: { contains: search, mode: "insensitive" } },
                { phoneNumber: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }


    const transactions = await prisma.transaction.findMany({
      where,
      ...(isExport ? {} : { skip }),
      take: limit,
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
                phoneNumber: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.transaction.count({ where });

    let stats: Array<{
      status: string;
      type: string;
      _count: { _all: number };
      _sum: { amount: any; amountRequested: any };
    }> = [];
    let orderAgg: { _sum: { totalAmount: any }; _count: { _all: number } } | null = null;
    let fundingRows: Array<{ totalVolume: string | number | null; totalCount: string | number | bigint }> = [];

    try {
      const [txStats, orders, fundingRaw] = await Promise.all([
        prisma.transaction.groupBy({
          by: ["status", "type"],
          _count: { _all: true },
          _sum: { amount: true, amountRequested: true },
        }),
        prisma.order.aggregate({
          where: { status: "COMPLETED" },
          _sum: { totalAmount: true },
          _count: { _all: true },
        }),
        // Exact external gateway deposits using SQL COALESCE
        prisma.$queryRaw<Array<{ totalVolume: string | number | null; totalCount: string | number | bigint }>>`
          SELECT 
            COALESCE(SUM(COALESCE(amount, "amountRequested")), 0) AS "totalVolume",
            COUNT(*) AS "totalCount"
          FROM "Transaction"
          WHERE status = 'SUCCESS' 
            AND type = 'FUNDING'
            AND (provider != 'thimslog_internal' OR provider IS NULL);
        `,
      ]);
      stats = txStats as any;
      orderAgg = orders as any;
      fundingRows = fundingRaw as any;
    } catch (aggErr) {
      console.warn("Could not aggregate metrics summary:", aggErr);
    }

    // Aggregate summary statistics separated by transaction type
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let totalSuccessVolume = 0;

    // Direct gateway deposits (accurate COALESCE across all successful funding records)
    let totalFundingVolume = Number(fundingRows?.[0]?.totalVolume || 0);
    let totalFundingCount = Number(fundingRows?.[0]?.totalCount || 0);

    // Direct completed order purchases
    let totalPaymentVolume = Number(orderAgg?._sum?.totalAmount || 0);
    let totalPaymentCount = orderAgg?._count?._all || 0;
    let totalTransferVolume = 0;

    stats.forEach((item) => {
      const count = item._count?._all || 0;
      const sum = Number(item._sum?.amount || item._sum?.amountRequested || 0);

      if (item.status === "SUCCESS") {
        successCount += count;
        totalSuccessVolume += sum;

        if (item.type === "TRANSFER_SENT" || item.type === "TRANSFER_RECEIVED") {
          totalTransferVolume += sum;
        }
      } else if (item.status === "PENDING") {
        pendingCount += count;
      } else if (item.status === "FAILED") {
        failedCount += count;
      }
    });

    // Fallback if gatewayFundingAgg was not available
    if (totalFundingVolume === 0 && totalFundingCount === 0) {
      stats.forEach((item) => {
        if (item.status === "SUCCESS" && item.type === "FUNDING") {
          totalFundingVolume += Number(item._sum?.amount || item._sum?.amountRequested || 0);
          totalFundingCount += item._count?._all || 0;
        }
      });
    }

    // Fallback if Order table had 0 records but transactions had PAYMENT
    if (totalPaymentVolume === 0 && totalPaymentCount === 0) {
      stats.forEach((item) => {
        if (item.status === "SUCCESS" && item.type === "PAYMENT") {
          totalPaymentVolume += Number(item._sum?.amount || item._sum?.amountRequested || 0);
          totalPaymentCount += item._count?._all || 0;
        }
      });
    }

    const totalCountAll = stats.reduce(
      (acc, curr) => acc + (curr._count?._all || 0),
      0
    );
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        metrics: {
          totalCountAll,
          totalSuccessVolume,
          totalFundingVolume,
          totalFundingCount,
          totalPaymentVolume,
          totalPaymentCount,
          totalTransferVolume,
          successCount,
          pendingCount,
          failedCount,
        },
      },
    });
  } catch (error) {
    console.error("Admin fetch transactions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
