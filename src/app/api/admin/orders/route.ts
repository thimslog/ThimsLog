import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";

export const dynamic = "force-dynamic";

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
    const limit = isExport
      ? 10000
      : Math.min(Math.max(Number(searchParams.get("limit")) || 15, 1), 100);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim();

    const skip = isExport ? 0 : (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      const cleanSearch = search.startsWith("@") ? search.slice(1).trim() : search;
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { userName: { contains: search, mode: "insensitive" } },
              { userName: { contains: cleanSearch, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phoneNumber: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          accountType: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              {
                category: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ];
    }

    const [orders, total, orderAgg] = await Promise.all([
      prisma.order.findMany({
        where,
        ...(isExport ? {} : { skip }),
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              email: true,
              phoneNumber: true,
            },
          },
          accountType: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          accounts: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              url: true,
              country: true,
              followers: true,
              notes: true,
              loginInstructions: true,
              status: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: {
          totalAmount: true,
          quantity: true,
        },
        _count: { _all: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      buyerId: o.user?.id,
      buyerName:
        `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() ||
        o.user?.userName ||
        "Customer",
      buyerUsername: o.user?.userName || "customer",
      buyerEmail: o.user?.email || "N/A",
      buyerPhone: o.user?.phoneNumber || "N/A",
      productId: o.accountType?.id,
      productName: o.accountType?.name || "Social Account Pack",
      platform: o.accountType?.name || "Account",
      categoryName: o.accountType?.category?.name || "General Inventory",
      quantity: o.quantity,
      unitPrice: Number(o.unitPrice || 0),
      totalAmount: Number(o.totalAmount || 0),
      status: o.status || "COMPLETED",
      createdAt: o.createdAt,
      accounts: o.accounts || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        metrics: {
          totalOrdersCount: orderAgg._count?._all || 0,
          totalSalesVolume: Number(orderAgg._sum?.totalAmount || 0),
          totalAccountsDelivered: Number(orderAgg._sum?.quantity || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
