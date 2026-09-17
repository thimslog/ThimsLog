import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { fallbackTickets } from "@/lib/ticket-store";

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
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 100);
    const status = searchParams.get("status") || "ALL";
    const priority = searchParams.get("priority") || "ALL";
    const search = searchParams.get("search")?.trim() || "";

    try {
      if ((prisma as any).supportTicket) {
        const where: any = {};
        if (status !== "ALL") where.status = status;
        if (priority !== "ALL") where.priority = priority;

        if (search) {
          where.OR = [
            { subject: { contains: search, mode: "insensitive" } },
            { message: { contains: search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { userName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ];
        }

        const skip = (page - 1) * limit;

        const [tickets, total, allStatusCounts] = await Promise.all([
          (prisma as any).supportTicket.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  userName: true,
                  phoneNumber: true,
                  wallet: {
                    select: {
                      balance: true,
                      currency: true,
                    },
                  },
                },
              },
              responses: {
                select: { id: true },
              },
            },
          }),
          (prisma as any).supportTicket.count({ where }),
          (prisma as any).supportTicket.groupBy({
            by: ["status"],
            _count: { _all: true },
          }),
        ]);

        let openCount = 0;
        let resolvedCount = 0;
        let closedCount = 0;

        if (Array.isArray(allStatusCounts)) {
          for (const s of allStatusCounts) {
            if (s.status === "OPEN") openCount = s._count?._all || 0;
            if (s.status === "RESOLVED") resolvedCount = s._count?._all || 0;
            if (s.status === "CLOSED") closedCount = s._count?._all || 0;
          }
        }

        const totalPages = Math.ceil(total / limit) || 1;

        return NextResponse.json({
          success: true,
          data: {
            tickets: tickets.map((t: any) => ({
              ...t,
              responseCount: Array.isArray(t.responses) ? t.responses.length : 0,
            })),
            metrics: {
              total: openCount + resolvedCount + closedCount,
              open: openCount,
              resolved: resolvedCount,
              closed: closedCount,
            },
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB support tickets query failed, using fallback:", dbErr);
    }

    // Fallback in-memory querying
    let filtered = [...fallbackTickets];

    if (status !== "ALL") {
      filtered = filtered.filter((t: any) => t.status === status);
    }
    if (priority !== "ALL") {
      filtered = filtered.filter((t: any) => t.priority === priority);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((t: any) => {
        const u = t.user || {};
        return Boolean(
          (t.subject && String(t.subject).toLowerCase().includes(s)) ||
          (t.message && String(t.message).toLowerCase().includes(s)) ||
          (u.firstName && String(u.firstName).toLowerCase().includes(s)) ||
          (u.lastName && String(u.lastName).toLowerCase().includes(s)) ||
          (u.email && String(u.email).toLowerCase().includes(s)) ||
          (u.userName && String(u.userName).toLowerCase().includes(s))
        );
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: {
        tickets: paginated.map((t: any) => ({
          ...t,
          responseCount: Array.isArray(t.responses) ? t.responses.length : 0,
        })),
        metrics: {
          total: fallbackTickets.length,
          open: fallbackTickets.filter((t: any) => t.status === "OPEN").length,
          resolved: fallbackTickets.filter((t: any) => t.status === "RESOLVED").length,
          closed: fallbackTickets.filter((t: any) => t.status === "CLOSED").length,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Admin fetch tickets error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
