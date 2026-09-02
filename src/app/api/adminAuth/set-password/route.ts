import { prisma } from "@/lib/prisma";
import { success, failure, handleError } from "@/lib/apiResponse";
// import { passwordMeetsRequirements } from "@/lib/password";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, token, password } = body;

    if (!email || !token || !password) {
      return failure(
        "Email, invitation token and password are required",
        400,
      );
    }

    // Validate password
    // if (!passwordMeetsRequirements(password)) {
    //   return failure(
    //     "Password does not meet the required requirements",
    //     400,
    //   );
    // }

    const normalizedEmail = email.trim().toLowerCase();

    // Hash the token received from the URL.
    // This MUST use the same hashing approach used by generateVerificationToken().
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await prisma.admin.findFirst({
      where: {
        email: normalizedEmail,
        verificationToken: hashedToken,
      },
    });

    if (!admin) {
      return failure(
        "Invalid or expired invitation link",
        400,
      );
    }

    // Check expiration
    if (
      !admin.verificationTokenExpirationDate ||
      admin.verificationTokenExpirationDate < new Date()
    ) {
      return failure(
        "This invitation link has expired. Ask a super admin to resend the invitation.",
        400,
      );
    }

    // Don't allow an already verified account to reuse the invitation
    if (admin.isVerified) {
      return failure(
        "This invitation has already been used. You can sign in instead.",
        400,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedAdmin = await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,

        // Invitation is now consumed
        isVerified: true,
        verificationToken: null,
        verificationTokenExpirationDate: null,

        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userName: true,
        isVerified: true,
        role: true,
      },
    });

    return success(
      "Password set successfully. You can now sign in.",
      updatedAdmin,
      200,
    );
  } catch (error) {
    return handleError(error, "Failed to set admin password");
  }
}