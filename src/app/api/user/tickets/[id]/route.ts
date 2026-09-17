import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { fallbackTickets } from "@/lib/ticket-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
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
            responses: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (ticket && ticket.userId === user.id) {
          return NextResponse.json({ success: true, data: ticket });
        }
      }
    } catch (dbErr) {
      console.warn("DB ticket fetch error, checking fallback:", dbErr);
    }

    const fbTicket = fallbackTickets.find((t) => t.id === id && t.userId === user.id);
    if (!fbTicket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: fbTicket });
  } catch (error) {
    console.error("Fetch single ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
