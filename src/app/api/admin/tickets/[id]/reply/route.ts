import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { fallbackTickets, FallbackResponse } from "@/lib/ticket-store";

export async function POST(
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
    const { message, status } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Reply message is required" },
        { status: 400 }
      );
    }

    const senderName =
      `${admin.firstName || ""} ${admin.lastName || ""}`.trim() ||
      admin.userName ||
      "Support Admin";

    try {
      if ((prisma as any).ticketResponse && (prisma as any).supportTicket) {
        const ticket = await (prisma as any).supportTicket.findUnique({
          where: { id },
        });

        if (!ticket) {
          return NextResponse.json(
            { success: false, message: "Ticket not found" },
            { status: 404 }
          );
        }

        const reply = await (prisma as any).ticketResponse.create({
          data: {
            ticketId: id,
            senderType: "ADMIN",
            senderName,
            message: message.trim(),
          },
        });

        // Optionally update ticket status
        const updateData: any = { updatedAt: new Date() };
        if (status && ["OPEN", "RESOLVED", "CLOSED"].includes(status)) {
          updateData.status = status;
        }

        await (prisma as any).supportTicket.update({
          where: { id },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          message: "Response sent successfully",
          data: reply,
        });
      }
    } catch (dbErr) {
      console.warn("DB admin reply failed, using fallback:", dbErr);
    }

    const fbTicket = fallbackTickets.find((t) => t.id === id);
    if (!fbTicket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const fallbackReply: FallbackResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ticketId: id,
      senderType: "ADMIN",
      senderName,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!fbTicket.responses) fbTicket.responses = [];
    fbTicket.responses.push(fallbackReply);

    if (status && ["OPEN", "RESOLVED", "CLOSED"].includes(status)) {
      fbTicket.status = status;
    }
    fbTicket.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Response sent successfully",
      data: fallbackReply,
    });
  } catch (error) {
    console.error("Admin ticket reply error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send response" },
      { status: 500 }
    );
  }
}
