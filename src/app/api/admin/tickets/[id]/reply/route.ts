import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { fallbackTickets, FallbackResponse } from "@/lib/ticket-store";
import { recordAdminAudit, nigeriaTime } from "@/lib/audit";
import { emitTicketReply, emitTicketStatusChanged } from "@/lib/socket-server";

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

    let replyResult: any = null;
    let targetUserId: string | undefined = undefined;

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

        targetUserId = ticket.userId;

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

        replyResult = reply;
      }
    } catch (dbErr) {
      console.warn("DB admin reply failed, using fallback:", dbErr);
    }

    if (!replyResult) {
      const fbTicket = fallbackTickets.find((t) => t.id === id);
      if (!fbTicket) {
        return NextResponse.json(
          { success: false, message: "Ticket not found" },
          { status: 404 }
        );
      }

      targetUserId = fbTicket.userId;

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
      replyResult = fallbackReply;
    }

    // Broadcast reply event via Socket.IO
    emitTicketReply({
      ticketId: id,
      reply: {
        id: replyResult.id,
        ticketId: replyResult.ticketId || id,
        senderType: replyResult.senderType || "ADMIN",
        senderName: replyResult.senderName || senderName,
        message: replyResult.message || message.trim(),
        createdAt: replyResult.createdAt?.toISOString ? replyResult.createdAt.toISOString() : (replyResult.createdAt || new Date().toISOString()),
      },
      userId: targetUserId,
      status: status || undefined,
    });

    // Broadcast status change event if status was changed
    if (status && ["OPEN", "RESOLVED", "CLOSED"].includes(status)) {
      emitTicketStatusChanged({
        ticketId: id,
        status,
        userId: targetUserId,
      });
    }

    // Record Audit Log
    await recordAdminAudit(
      request,
      { id: admin.adminId, email: admin.email },
      {
        action: "TICKET_REPLIED",
        entityId: id,
        entityType: "TICKET",
        entityLabel: `Ticket #${id.slice(-6)}`,
        description: `Admin ${admin.email} sent a reply on ticket #${id.slice(-6)}${
          status ? ` and updated status to ${status}` : ""
        } at ${nigeriaTime()}`,
        metadata: {
          ticketId: id,
          status,
          messagePreview: message.trim().slice(0, 100),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Response sent successfully",
      data: replyResult,
    });
  } catch (error) {
    console.error("Admin ticket reply error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send response" },
      { status: 500 }
    );
  }
}
