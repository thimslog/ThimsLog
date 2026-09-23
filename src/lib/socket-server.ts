// Helper utilities for emitting real-time socket events from API routes and services

export function getSocketIO() {
  if (typeof globalThis !== "undefined" && (globalThis as any).__io) {
    return (globalThis as any).__io;
  }
  return null;
}

export interface SocketTicketReplyPayload {
  ticketId: string;
  reply: {
    id: string;
    ticketId?: string;
    senderType: "USER" | "ADMIN";
    senderName: string | null;
    message: string;
    createdAt: string;
  };
  userId?: string;
  status?: string;
}

export interface SocketTicketCreatedPayload {
  ticket: {
    id: string;
    userId: string;
    subject: string;
    message: string;
    priority: string;
    status: string;
    createdAt: string;
    user?: any;
  };
}

export interface SocketTicketStatusPayload {
  ticketId: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  userId?: string;
  updatedAt?: string;
}

export interface SocketWalletPayload {
  userId: string;
  balance: number;
  currency?: string;
  delta?: number;
  reason?: string;
  timestamp?: string;
}

/**
 * Emit a new response message on a support ticket
 */
export function emitTicketReply(payload: SocketTicketReplyPayload) {
  try {
    const io = getSocketIO();
    if (!io) return;

    const { ticketId, reply, userId, status } = payload;
    const eventData = { ticketId, reply, status, timestamp: new Date().toISOString() };

    // Emit to specific ticket room (for anyone viewing this conversation)
    io.to(`ticket_${ticketId}`).emit("ticket:reply", eventData);

    // Emit to admin tickets room
    io.to("admin_tickets").emit("ticket:reply", eventData);

    // If userId provided, notify the specific user
    if (userId) {
      io.to(`user_${userId}`).emit("ticket:reply", eventData);
    }
  } catch (err) {
    console.warn("Could not emit ticket:reply via Socket.IO:", err);
  }
}

/**
 * Emit when a user submits a new support ticket
 */
export function emitTicketCreated(payload: SocketTicketCreatedPayload) {
  try {
    const io = getSocketIO();
    if (!io) return;

    const { ticket } = payload;
    io.to("admin_tickets").emit("ticket:created", { ticket });

    if (ticket.userId) {
      io.to(`user_${ticket.userId}`).emit("ticket:created", { ticket });
    }
  } catch (err) {
    console.warn("Could not emit ticket:created via Socket.IO:", err);
  }
}

/**
 * Emit ticket status change (e.g. RESOLVED or CLOSED)
 */
export function emitTicketStatusChanged(payload: SocketTicketStatusPayload) {
  try {
    const io = getSocketIO();
    if (!io) return;

    const { ticketId, status, userId } = payload;
    const data = { ticketId, status, updatedAt: payload.updatedAt || new Date().toISOString() };

    io.to(`ticket_${ticketId}`).emit("ticket:status_changed", data);
    io.to("admin_tickets").emit("ticket:status_changed", data);

    if (userId) {
      io.to(`user_${userId}`).emit("ticket:status_changed", data);
    }
  } catch (err) {
    console.warn("Could not emit ticket:status_changed via Socket.IO:", err);
  }
}

/**
 * Emit real-time wallet balance update to the user
 */
export function emitWalletBalanceUpdated(payload: SocketWalletPayload) {
  try {
    const io = getSocketIO();
    if (!io) return;

    const { userId, balance, currency = "NGN", delta, reason } = payload;
    const data = {
      userId,
      balance: Number(balance),
      currency,
      delta,
      reason,
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    // Emit directly to the user's private socket room
    io.to(`user_${userId}`).emit("wallet:balance_updated", data);

    // Also inform admin portal overview
    io.to("admin_portal").emit("user_wallet:balance_updated", data);
  } catch (err) {
    console.warn("Could not emit wallet:balance_updated via Socket.IO:", err);
  }
}
