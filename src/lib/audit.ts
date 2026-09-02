import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { formatInTimeZone } from "date-fns-tz";

export const nigeriaTime = (date: Date = new Date()) =>
  formatInTimeZone(date, "Africa/Lagos", "PPP p");

export const writeAudit = async (data: {
  adminId: string;
  adminEmail: string;
  action: string;
  entityId? : string;
  entityType?: string;
  entityLabel?: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
}) => {
  try {
    await prisma.adminAuditLog.create({ data });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};