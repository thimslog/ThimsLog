// In-memory fallback store for Support Tickets if DB tables are pending migration
export interface FallbackResponse {
  id: string;
  ticketId: string;
  senderType: "USER" | "ADMIN";
  senderName: string | null;
  message: string;
  createdAt: string;
}

export interface FallbackTicket {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    phoneNumber?: string;
    wallet?: {
      balance: number | string;
      currency: string;
    };
  };
  subject: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "RESOLVED" | "CLOSED";
  responses: FallbackResponse[];
  createdAt: string;
  updatedAt: string;
}

// Global in-memory array to persist tickets across development reloads
declare global {
  var globalFallbackTickets: FallbackTicket[] | undefined;
}

if (!globalThis.globalFallbackTickets) {
  globalThis.globalFallbackTickets = [];
}

export const fallbackTickets: FallbackTicket[] = globalThis.globalFallbackTickets;
