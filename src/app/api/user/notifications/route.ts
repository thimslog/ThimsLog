import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
    const unreadOnly = searchParams.get("unread") === "true";

    const notificationDelegate = (prisma as any).notification;

    if (notificationDelegate?.findMany) {
      const whereClause: any = { userId: user.id };
      if (unreadOnly) {
        whereClause.read = false;
      }

      const [notifications, unreadCount] = await Promise.all([
        notificationDelegate.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        notificationDelegate.count({
          where: {
            userId: user.id,
            read: false,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
      });
    }

    // Fallback: raw query in case prisma generate has not been run yet
    try {
      const notifications = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Notification" WHERE "userId" = $1 ${
          unreadOnly ? `AND "read" = false` : ""
        } ORDER BY "createdAt" DESC LIMIT $2`,
        user.id,
        limit
      );

      const unreadCountResult = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*)::int as count FROM "Notification" WHERE "userId" = $1 AND "read" = false`,
        user.id
      );

      return NextResponse.json({
        success: true,
        notifications: notifications || [],
        unreadCount: unreadCountResult?.[0]?.count || 0,
      });
    } catch {
      return NextResponse.json({
        success: true,
        notifications: [],
        unreadCount: 0,
      });
    }
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, id } = body;

    const notificationDelegate = (prisma as any).notification;

    if (notificationDelegate?.updateMany) {
      if (action === "mark_all_read") {
        await notificationDelegate.updateMany({
          where: {
            userId: user.id,
            read: false,
          },
          data: { read: true },
        });

        return NextResponse.json({
          success: true,
          message: "All notifications marked as read",
        });
      }

      if (action === "mark_read" && id) {
        await notificationDelegate.updateMany({
          where: {
            id: String(id),
            userId: user.id,
          },
          data: { read: true },
        });

        return NextResponse.json({
          success: true,
          message: "Notification marked as read",
        });
      }
    }

    // Fallback: execute raw SQL
    try {
      if (action === "mark_all_read") {
        await prisma.$executeRawUnsafe(
          `UPDATE "Notification" SET "read" = true WHERE "userId" = $1 AND "read" = false`,
          user.id
        );
        return NextResponse.json({
          success: true,
          message: "All notifications marked as read",
        });
      }

      if (action === "mark_read" && id) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Notification" SET "read" = true WHERE "id" = $1 AND "userId" = $2`,
          String(id),
          user.id
        );
        return NextResponse.json({
          success: true,
          message: "Notification marked as read",
        });
      }
    } catch {}

    return NextResponse.json(
      { message: "Invalid action or missing notification ID" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}
