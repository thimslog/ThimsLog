import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { formatInTimeZone } from "date-fns-tz";

export const nigeriaTime = (date: Date = new Date()) =>
  formatInTimeZone(date, "Africa/Lagos", "PPP p");

export interface AuditLogData {
  adminId: string;
  adminEmail: string;
  action: string;
  entityId?: string;
  entityType?: string;
  entityLabel?: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export const writeAudit = async (data: AuditLogData) => {
  try {
    await prisma.adminAuditLog.create({ data });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};

/**
 * Convenient helper to record an admin audit log from an active HTTP Request
 */
export const recordAdminAudit = async (
  req: Request | null | undefined,
  admin: { id: string; email: string },
  details: {
    action: string;
    entityId?: string;
    entityType?: string;
    entityLabel?: string;
    description: string;
    metadata?: Record<string, any> | Prisma.InputJsonValue;
  }
) => {
  try {
    let ipAddress: string | undefined = undefined;
    let userAgent: string | undefined = undefined;

    if (req) {
      const forwarded = req.headers.get("x-forwarded-for");
      ipAddress = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || undefined;
      userAgent = req.headers.get("user-agent") || undefined;
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: details.action,
        entityId: details.entityId,
        entityType: details.entityType,
        entityLabel: details.entityLabel,
        description: details.description,
        metadata: (details.metadata as any) ?? undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Failed to record admin audit log:", err);
  }
};