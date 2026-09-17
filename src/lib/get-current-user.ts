import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getUsernameCooldownInfo } from "@/lib/username-history-store";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        userName: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            virtualAccountReference: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Check 3-month username cooldown
    const cooldown = await getUsernameCooldownInfo(user.id);

    // Check if the user's email exists in the Admin table
    let isAdmin = false;
    let adminRole: string | null = null;

    try {
      const matchingAdmin = await prisma.admin.findUnique({
        where: { email: user.email.trim().toLowerCase() },
        select: { id: true, role: true, status: true },
      });

      if (matchingAdmin && matchingAdmin.status === "ACTIVE") {
        isAdmin = true;
        adminRole = matchingAdmin.role;
      }
    } catch (err) {
      console.warn("Could not check admin status for user:", err);
    }

    return {
      ...user,
      isAdmin,
      adminRole,
      usernameChangedAt: cooldown.lastChangedAt,
      canChangeUsername: cooldown.canChangeUsername,
      nextAllowedDate: cooldown.nextAllowedDate?.toISOString() || null,
      daysRemaining: cooldown.daysRemaining,
    };
  } catch {
    return null;
  }
}
