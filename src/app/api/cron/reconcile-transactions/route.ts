import { NextRequest, NextResponse } from "next/server";
import { reconcilePendingTransactions } from "@/lib/reconcile-transactions";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max execution duration in seconds

export async function GET(request: NextRequest) {
  return handleReconciliation(request);
}

export async function POST(request: NextRequest) {
  return handleReconciliation(request);
}

async function handleReconciliation(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretFromQuery = searchParams.get("secret") || searchParams.get("key");
    const authHeader = request.headers.get("authorization");
    const cronSecretFromEnv = process.env.CRON_SECRET || process.env.JWT_SECRET;

    // Optional secret verification if CRON_SECRET is set
    if (process.env.CRON_SECRET) {
      const token = authHeader?.replace(/^Bearer\s+/i, "") || secretFromQuery;
      if (token !== cronSecretFromEnv) {
        return NextResponse.json(
          { success: false, message: "Unauthorized cron trigger" },
          { status: 401 }
        );
      }
    }

    const limitParam = searchParams.get("limit");
    const maxAgeParam = searchParams.get("maxAgeHours");

    const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
    const maxAgeHours = maxAgeParam ? Number.parseInt(maxAgeParam, 10) : 72;

    const summary = await reconcilePendingTransactions({
      limit,
      maxAgeHours,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error: any) {
    console.error("Cron transaction reconciliation failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to reconcile pending transactions",
      },
      { status: 500 }
    );
  }
}
