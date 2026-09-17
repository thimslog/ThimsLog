import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { fallbackTickets } from "@/lib/ticket-store";

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

    try {
      if ((prisma as any).supportTicket) {
        const ticket = await (prisma as any).supportTicket.findUnique({
          where: { id },
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
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (ticket) {
          return NextResponse.json({ success: true, data: ticket });
        }
      }
    } catch (dbErr) {
      console.warn("DB admin single ticket query failed, checking fallback:", dbErr);
    }

    const fb = fallbackTickets.find((t) => t.id === id);
    if (!fb) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: fb });
  } catch (error) {
    console.error("Admin fetch ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();
    const { status, priority } = body;

    try {
      if ((prisma as any).supportTicket) {
        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;

        const updated = await (prisma as any).supportTicket.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          message: "Ticket updated successfully",
          data: updated,
        });
      }
    } catch (dbErr) {
      console.warn("DB admin ticket patch failed, using fallback:", dbErr);
    }

    const fb = fallbackTickets.find((t) => t.id === id);
    if (!fb) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    if (status) fb.status = status;
    if (priority) fb.priority = priority;
    fb.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      data: fb,
    });
  } catch (error) {
    console.error("Admin patch ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
