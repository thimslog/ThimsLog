import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. CREATE INVENTORY ACCOUNT (POST)
export async function POST(req: Request) {
  try {
    const {
      accountTypeId,
      name,
      username,
      email,
      url,
      country,
      followers,
      status = "AVAILABLE",
      notes,
      loginInstructions,
    } = await req.json();

    if (!accountTypeId) {
      return NextResponse.json(
        { success: false, message: "accountTypeId is required" },
        { status: 400 },
      );
    }

    const accountType = await prisma.accountType.findUnique({
      where: {
        id: accountTypeId,
      },
    });

    if (!accountType) {
      return NextResponse.json(
        { success: false, message: "Account type not found" },
        { status: 404 },
      );
    }

    const account = await prisma.inventoryAccount.create({
      data: {
        accountTypeId,
        name: name ? String(name).trim() : null,
        username: username ? String(username).trim() : null,
        email: email ? String(email).trim() : null,
        url: url ? String(url).trim() : null,
        country: country ? String(country).trim() : null,
        followers: followers !== null && followers !== undefined && followers !== "" ? Number(followers) : null,
        status: status || "AVAILABLE",
        notes: notes ? String(notes).trim() : null,
        loginInstructions: loginInstructions ? String(loginInstructions).trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account added successfully",
        data: account,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create inventory account error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create account" },
      { status: 500 },
    );
  }
}

// 2. GET INVENTORY ACCOUNTS (GET)
export async function GET(req: Request) {
  try {
    // Extract multi-variable filters from the URL query parameters
    const { searchParams } = new URL(req.url);
    const accountTypeId = searchParams.get("accountTypeId");
    const status = searchParams.get("status");
    const country = searchParams.get("country");

    const accounts = await prisma.inventoryAccount.findMany({
      where: {
        ...(accountTypeId && {
          accountTypeId: String(accountTypeId),
        }),
        ...(status && {
          status: status as any,
        }),
        ...(country && {
          country: String(country),
        }),
      },
      include: {
        accountType: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Get inventory accounts error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}
