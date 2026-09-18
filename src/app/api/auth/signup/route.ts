import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { ensureReferralSchema } from "@/services/referral";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      userName,
      password,
      confirmPassword,
    } = body;

    // Required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !userName ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Normalize values
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = userName.trim().toLowerCase();
    const normalizedPhone = phoneNumber.trim();

    // Password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { userName: normalizedUsername },
          { phoneNumber: normalizedPhone },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email is already registered",
          },
          { status: 409 }
        );
      }

      if (existingUser.userName === normalizedUsername) {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 409 }
        );
      }

      if (existingUser.phoneNumber === normalizedPhone) {
        return NextResponse.json(
          {
            success: false,
            message: "Phone number is already registered",
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Referral lookup (referral code is the user's username)
    let referredById: string | undefined = undefined;
    const rawRef = (body.referralCode || body.ref || "").trim();
    if (rawRef) {
      try {
        await ensureReferralSchema();
        const rows = await prisma.$queryRaw<Array<{ id: string; firstName: string }>>`
          SELECT id, "firstName" FROM "User"
          WHERE LOWER("userName") = LOWER(${rawRef})
             OR LOWER(COALESCE("referralCode", '')) = LOWER(${rawRef})
          LIMIT 1;
        `;
        if (rows && rows.length > 0) {
          referredById = rows[0].id;
        }
      } catch (refErr) {
        console.warn("Referral lookup warning:", refErr);
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        userName: normalizedUsername,
        password: hashedPassword,
      },
    });

    // Ensure referral link and referral code are set in database
    try {
      await ensureReferralSchema();
      await prisma.$executeRaw`
        UPDATE "User"
        SET "referralCode" = ${normalizedUsername},
            "referredById" = ${referredById || null}
        WHERE id = ${user.id};
      `;
    } catch (setRefErr) {
      console.warn("Could not set referralCode/referredById on user:", setRefErr);
    }

    // If referred, create a welcome notification for referrer
    if (referredById) {
      try {
        if ((prisma as any).notification) {
          await (prisma as any).notification.create({
            data: {
              userId: referredById,
              title: "🎉 New Referral Signup!",
              message: `${firstName.trim()} just registered using your referral link. You will earn 1% commission when they make purchases above ₦20,000!`,
              type: "REFERRAL",
            },
          });
        }
      } catch (notifErr) {
        console.warn("Could not create referral notification:", notifErr);
      }
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );

    // Store JWT in HTTP-only cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account",
      },
      { status: 500 }
    );
  }
}