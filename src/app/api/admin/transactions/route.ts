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
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 15, 1), 100);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search")?.trim();

    const skip = (page - 1) * limit;

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


    const [transactions, total, stats] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
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
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { amount: true, amountRequested: true },
      }),
    ]);

    // Aggregate summary statistics
    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let totalSuccessVolume = 0;

    stats.forEach((item) => {
      const count = item._count._all;
      const sum = Number(item._sum.amount || item._sum.amountRequested || 0);

      if (item.status === "SUCCESS") {
        successCount += count;
        totalSuccessVolume += sum;
      } else if (item.status === "PENDING") {
        pendingCount += count;
      } else if (item.status === "FAILED") {
        failedCount += count;
      }
    });

    const totalCountAll = stats.reduce((acc, curr) => acc + curr._count._all, 0);
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
