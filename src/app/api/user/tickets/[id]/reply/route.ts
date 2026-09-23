import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { fallbackTickets, FallbackResponse } from "@/lib/ticket-store";
import { emitTicketReply } from "@/lib/socket-server";

export async function POST(
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
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Reply message is required" },
        { status: 400 }
      );
    }

    const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName || "Customer";

    try {
      if ((prisma as any).ticketResponse && (prisma as any).supportTicket) {
        const ticket = await (prisma as any).supportTicket.findUnique({
          where: { id },
        });

        if (!ticket || ticket.userId !== user.id) {
          return NextResponse.json(
            { success: false, message: "Ticket not found or access denied" },
            { status: 404 }
          );
        }

        // Prevent replies if ticket is already RESOLVED or CLOSED
        if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
          return NextResponse.json(
            {
              success: false,
              message: "This ticket has been marked as resolved/closed and cannot receive further replies. Please open a new support ticket.",
            },
            { status: 400 }
          );
        }

        const reply = await (prisma as any).ticketResponse.create({
          data: {
            ticketId: id,
            senderType: "USER",
            senderName,
            message: message.trim(),
          },
        });

        await (prisma as any).supportTicket.update({
          where: { id },
          data: {
            updatedAt: new Date(),
          },
        });

        // Broadcast via Socket.IO
        emitTicketReply({
          ticketId: id,
          reply: {
            id: reply.id,
            ticketId: reply.ticketId,
            senderType: reply.senderType,
            senderName: reply.senderName,
            message: reply.message,
            createdAt: reply.createdAt?.toISOString ? reply.createdAt.toISOString() : new Date().toISOString(),
          },
          userId: user.id,
        });

        return NextResponse.json({
          success: true,
          message: "Reply sent successfully",
          data: reply,
        });
      }
    } catch (dbErr) {
      console.warn("DB reply creation failed, using fallback:", dbErr);
    }

    const fbTicket = fallbackTickets.find((t) => t.id === id && t.userId === user.id);
    if (!fbTicket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Prevent replies on resolved or closed fallback tickets
    if (fbTicket.status === "RESOLVED" || fbTicket.status === "CLOSED") {
      return NextResponse.json(
        {
          success: false,
          message: "This ticket has been marked as resolved/closed and cannot receive further replies. Please open a new support ticket.",
        },
        { status: 400 }
      );
    }

    const fallbackReply: FallbackResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ticketId: id,
      senderType: "USER",
      senderName,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!fbTicket.responses) fbTicket.responses = [];
    fbTicket.responses.push(fallbackReply);
    fbTicket.updatedAt = new Date().toISOString();

    // Broadcast fallback reply via Socket.IO
    emitTicketReply({
      ticketId: id,
      reply: fallbackReply,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      data: fallbackReply,
    });
  } catch (error) {
    console.error("User ticket reply error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send reply" },
      { status: 500 }
    );
  }
}
