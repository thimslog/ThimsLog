import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { fallbackTickets, FallbackTicket } from "@/lib/ticket-store";
import { emitTicketCreated } from "@/lib/socket-server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    try {
      if ((prisma as any).supportTicket) {
        const tickets = await (prisma as any).supportTicket.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          include: {
            responses: {
              orderBy: { createdAt: "asc" },
            },
          },
        });
        return NextResponse.json({ success: true, data: tickets });
      }
    } catch (dbErr) {
      console.warn("Prisma supportTicket query failed, using fallback:", dbErr);
    }

    // Fallback in-memory
    const userTickets = fallbackTickets.filter((t) => t.userId === user.id);
    return NextResponse.json({ success: true, data: userTickets });
  } catch (error) {
    console.error("Get user tickets error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, message, priority = "HIGH" } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Subject and message are required" },
        { status: 400 }
      );
    }

    const validPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" =
      ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(String(priority).toUpperCase())
        ? (String(priority).toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
        : "HIGH";

    try {
      if ((prisma as any).supportTicket) {
        const newTicket = await (prisma as any).supportTicket.create({
          data: {
            userId: user.id,
            subject: subject.trim(),
            message: message.trim(),
            priority: validPriority,
            status: "OPEN",
          },
          include: {
            responses: true,
          },
        });

        // Broadcast to admin in real time
        emitTicketCreated({
          ticket: {
            id: newTicket.id,
            userId: user.id,
            subject: newTicket.subject,
            message: newTicket.message,
            priority: newTicket.priority,
            status: newTicket.status,
            createdAt: newTicket.createdAt?.toISOString ? newTicket.createdAt.toISOString() : new Date().toISOString(),
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              userName: user.userName,
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Support ticket created successfully",
          data: newTicket,
        });
      }
    } catch (dbErr) {
      console.warn("Prisma create ticket failed, using fallback:", dbErr);
    }

    // Fallback store
    const fallbackNew: FallbackTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      user: {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        userName: user.userName || "",
        phoneNumber: user.phoneNumber || "",
        wallet: user.wallet
          ? {
              balance: Number(user.wallet.balance) || 0,
              currency: user.wallet.currency || "NGN",
            }
          : undefined,
      },
      subject: subject.trim(),
      message: message.trim(),
      priority: validPriority,
      status: "OPEN",
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fallbackTickets.unshift(fallbackNew);

    // Broadcast fallback ticket
    emitTicketCreated({
      ticket: {
        id: fallbackNew.id,
        userId: user.id,
        subject: fallbackNew.subject,
        message: fallbackNew.message,
        priority: fallbackNew.priority,
        status: fallbackNew.status,
        createdAt: fallbackNew.createdAt,
        user: fallbackNew.user,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket created successfully",
      data: fallbackNew,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
