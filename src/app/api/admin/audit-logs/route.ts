import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isExport = searchParams.get("export") === "true";
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = isExport
      ? 2000
      : Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100);

    const search = searchParams.get("search")?.trim();
    const actionFilter = searchParams.get("action")?.trim();
    const entityTypeFilter = searchParams.get("entityType")?.trim();
    const adminFilter = searchParams.get("admin")?.trim();

    const where: any = {};

    if (actionFilter && actionFilter !== "ALL") {
      where.action = actionFilter;
    }

    if (entityTypeFilter && entityTypeFilter !== "ALL") {
      where.entityType = entityTypeFilter;
    }

    if (adminFilter && adminFilter !== "ALL") {
      where.adminEmail = adminFilter;
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { adminEmail: { contains: search, mode: "insensitive" } },
        { entityLabel: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = isExport ? 0 : (page - 1) * limit;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [logs, total, todayCount, distinctAdmins] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.adminAuditLog.findMany({
        distinct: ["adminEmail"],
        select: {
          adminEmail: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
          metrics: {
            totalLogs: total,
            todayLogs: todayCount,
            activeAdminsCount: distinctAdmins.length,
          },
          filterOptions: {
            admins: distinctAdmins.map((a) => a.adminEmail).filter(Boolean),
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET admin audit logs error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
