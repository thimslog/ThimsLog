import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";
import {
  DEFAULT_COMMISSION_RATE,
  MIN_COMMISSION_PURCHASE_THRESHOLD,
  ensureReferralSchema,
} from "@/services/referral";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureReferralSchema();

    // Auto-detect production vs localhost host and protocol
    const envAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const hostHeader = forwardedHost || request.headers.get("host");

    let origin = "https://thimslog.com";
    if (envAppUrl) {
      origin = envAppUrl.replace(/\/$/, "");
    } else if (hostHeader) {
      const protocol = forwardedProto || (hostHeader.includes("localhost") || hostHeader.includes("127.0.0.1") ? "http" : "https");
      origin = `${protocol}://${hostHeader}`;
    }

    // 1. Referral code is simply the user's username
    const referralCode = user.userName.toLowerCase();
    const referralLink = `${origin}/register?ref=${referralCode}`;

    // 2. Fetch who referred the current user
    let referredBy: { id: string; name: string; username: string } | null = null;
    try {
      const referrerRows = await prisma.$queryRaw<Array<{
        id: string;
        firstName: string;
        lastName: string;
        userName: string;
      }>>`
        SELECT u2.id, u2."firstName", u2."lastName", u2."userName"
        FROM "User" u1
        INNER JOIN "User" u2 ON u1."referredById" = u2.id
        WHERE u1.id = ${user.id}
        LIMIT 1;
      `;
      if (referrerRows && referrerRows.length > 0) {
        const r = referrerRows[0];
        referredBy = {
          id: r.id,
          name: `${r.firstName || ""} ${r.lastName || ""}`.trim() || r.userName,
          username: r.userName,
        };
      }
    } catch {
      referredBy = null;
    }

    // 3. Fetch referred users safely
    let referredUsers: any[] = [];
    try {
      referredUsers = await prisma.$queryRaw<Array<{
        id: string;
        firstName: string;
        lastName: string;
        userName: string;
        email: string;
        createdAt: Date;
      }>>`
        SELECT id, "firstName", "lastName", "userName", email, "createdAt"
        FROM "User"
        WHERE "referredById" = ${user.id}
        ORDER BY "createdAt" DESC
        LIMIT 100;
      `;
    } catch {
      // Fallback if column referredById does not exist in database yet
      referredUsers = [];
    }

    // 4. Fetch referral reward history safely
    let rewards: any[] = [];
    try {
      rewards = await prisma.$queryRaw<Array<{
        id: string;
        amount: number;
        sourceType: string;
        sourceAmount: number;
        createdAt: Date;
        refereeName: string;
        status: string;
      }>>`
        SELECT 
          r.id, 
          r.amount, 
          r."sourceType", 
          r."sourceAmount", 
          r."createdAt",
          r.status,
          COALESCE(u."firstName" || ' ' || u."lastName", u."userName", 'Referred Friend') AS "refereeName"
        FROM "ReferralReward" r
        LEFT JOIN "User" u ON r."refereeId" = u.id
        WHERE r."referrerId" = ${user.id}
        ORDER BY r."createdAt" DESC
        LIMIT 50;
      `;
    } catch {
      // Fallback if ReferralReward table does not exist in database yet
      rewards = [];
    }

    const totalEarnings = rewards.reduce((acc, r) => acc + Number(r.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink,
        referredBy,
        commissionRate: DEFAULT_COMMISSION_RATE,
        commissionRatePercent: `${DEFAULT_COMMISSION_RATE * 100}%`,
        minPurchaseThreshold: MIN_COMMISSION_PURCHASE_THRESHOLD,
        metrics: {
          totalReferred: (referredUsers || []).length,
          totalEarnings,
          totalRewardsCount: (rewards || []).length,
        },
        referredUsers: (referredUsers || []).map((u) => ({
          id: u.id,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.userName,
          username: u.userName,
          emailMasked: u.email
            ? u.email.replace(/(.{2})(.*)(?=@)/, "$1***")
            : "N/A",
          joinedAt: u.createdAt,
        })),
        rewards: (rewards || []).map((r) => ({
          id: r.id,
          amount: Number(r.amount || 0),
          sourceType: r.sourceType || "ORDER_PURCHASE",
          sourceAmount: Number(r.sourceAmount || 0),
          refereeName: r.refereeName || "Referred Friend",
          status: r.status || "CREDITED",
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/user/referrals error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureReferralSchema();

    const body = await request.json();
    const rawRef = (body.referralCode || body.ref || "").trim();

    if (!rawRef) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid referral code or username." },
        { status: 400 }
      );
    }

    // 1. Check if user already has a referrer
    const currentUserRows = await prisma.$queryRaw<Array<{ id: string; referredById: string | null }>>`
      SELECT id, "referredById" FROM "User" WHERE id = ${user.id} LIMIT 1;
    `;

    if (currentUserRows.length > 0 && currentUserRows[0].referredById) {
      return NextResponse.json(
        { success: false, message: "You already have a referrer linked to your account." },
        { status: 400 }
      );
    }

    // 2. Find referring user
    const referrerRows = await prisma.$queryRaw<Array<{
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
    }>>`
      SELECT id, "firstName", "lastName", "userName"
      FROM "User"
      WHERE LOWER("userName") = LOWER(${rawRef})
         OR LOWER(COALESCE("referralCode", '')) = LOWER(${rawRef})
      LIMIT 1;
    `;

    if (!referrerRows || referrerRows.length === 0) {
      return NextResponse.json(
        { success: false, message: `No user found with username or referral code "${rawRef}".` },
        { status: 404 }
      );
    }

    const referrer = referrerRows[0];

    // 3. User cannot refer themselves
    if (referrer.id === user.id) {
      return NextResponse.json(
        { success: false, message: "You cannot claim yourself as a referrer." },
        { status: 400 }
      );
    }

    // 3b. Circular referral check: Prevent mutual/circular referral loops
    // (e.g. if user referred referrer, user cannot now claim referrer)
    const directReferred = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "User"
      WHERE id = ${referrer.id} AND "referredById" = ${user.id}
      LIMIT 1;
    `;

    if (directReferred && directReferred.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `You cannot link @${referrer.userName} as your referrer because you originally referred them. Mutual referral loops are not permitted.`,
        },
        { status: 400 }
      );
    }

    // Check upstream ancestors (cycle protection)
    let checkId: string | null = referrer.id;
    let depth = 0;
    while (checkId && depth < 10) {
      const ancestorRows: Array<{ referredById: string | null }> = await prisma.$queryRaw<
        Array<{ referredById: string | null }>
      >`
        SELECT "referredById" FROM "User" WHERE id = ${checkId} LIMIT 1;
      `;
      if (!ancestorRows || ancestorRows.length === 0 || !ancestorRows[0].referredById) {
        break;
      }
      if (ancestorRows[0].referredById === user.id) {
        return NextResponse.json(
          {
            success: false,
            message: `You cannot link @${referrer.userName} because they are already part of your referral network.`,
          },
          { status: 400 }
        );
      }
      checkId = ancestorRows[0].referredById;
      depth++;
    }

    // 4. Update user's referredById in database
    await prisma.$executeRaw`
      UPDATE "User"
      SET "referredById" = ${referrer.id}
      WHERE id = ${user.id};
    `;

    // 5. Send notification to referrer
    try {
      if ((prisma as any).notification) {
        await (prisma as any).notification.create({
          data: {
            userId: referrer.id,
            title: "🎉 New Referral Linked!",
            message: `${user.firstName || user.userName} linked you as their referrer. You will earn 1% commission on their purchases above ₦20,000!`,
            type: "REFERRAL",
          },
        });
      }
    } catch (notifErr) {
      console.warn("Could not create claim referral notification:", notifErr);
    }

    const referredBy = {
      id: referrer.id,
      name: `${referrer.firstName || ""} ${referrer.lastName || ""}`.trim() || referrer.userName,
      username: referrer.userName,
    };

    return NextResponse.json({
      success: true,
      message: `Successfully linked @${referrer.userName} as your referrer!`,
      data: {
        referredBy,
      },
    });
  } catch (error: any) {
    console.error("POST /api/user/referrals error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to link referral code." },
      { status: 500 }
    );
  }
}
