import { prisma } from "@/lib/prisma";
import { signupAdminSchema } from "@/lib/validations/admin";
import { generateVerificationToken } from "@/lib/token";
import { sendUserAddedEmail } from "@/lib/email";
import { getCurrentAdmin } from "@/lib/jwt";
import { writeAudit, recordAdminAudit, nigeriaTime } from "@/lib/audit";
import { success, failure, handleError } from "@/lib/apiResponse";
import { AdminRole } from "../../../../../generated/prisma/client";

export async function POST(request: Request) {
  try {
    const currentAdmin = await getCurrentAdmin();

    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, role } =
      signupAdminSchema.parse(body);

    // 1. Check duplicate
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return failure("Admin already exists", 409);
    }

    // 2. First admin ever becomes SUPER_ADMIN
    const totalAdmins = await prisma.admin.count();
    const resolvedRole =
      totalAdmins === 0
        ? AdminRole.SUPER_ADMIN
        : role
          ? AdminRole[role as keyof typeof AdminRole]
          : AdminRole.ADMIN;

    // 3. Verification token
    const { rawToken, hashedToken, expiresAt } = generateVerificationToken(60);

    // 4. Create admin
    const admin = await prisma.admin.create({
      data: {
        firstName,
        lastName,
        userName: `User${Date.now().toString().slice(-4)}`,
        email,
        phoneNumber,
        role: resolvedRole,
        verificationToken: hashedToken,
        verificationTokenExpirationDate: expiresAt,
        isVerified: false,
        password: "", // temporary
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Send email
    const setPasswordUrl = `${process.env.ADMIN_URL}/admin/set-password?email=${encodeURIComponent(
      email,
    )}&token=${rawToken}`;

    await sendUserAddedEmail({
      firstName: admin.firstName,
      email: admin.email,
      addedByName: currentAdmin
        ? `${currentAdmin.firstName} ${currentAdmin.lastName}`
        : "System Admin",
      setPasswordUrl,
    });

    // 6. Audit
    await recordAdminAudit(
      request,
      {
        id: currentAdmin?.adminId ?? "SYSTEM",
        email: currentAdmin?.email ?? "system@thimslog.com",
      },
      {
        entityId: admin.id,
        action: "ADMIN_SIGNUP",
        entityType: "ADMIN",
        entityLabel: admin.email,
        description: `Admin ${admin.firstName} ${admin.lastName} (${admin.email}) was invited/created at ${nigeriaTime()} by ${
          currentAdmin
            ? `${currentAdmin.firstName} ${currentAdmin.lastName} (${currentAdmin.email})`
            : "System"
        }`,
        metadata: {
          role: resolvedRole,
          email: admin.email,
          phone: phoneNumber,
        },
      }
    );

    return success("Admin created. Set password email sent.", admin, 201);
  } catch (error) {
    return handleError(error, "Failed to create admin");
  }
}
