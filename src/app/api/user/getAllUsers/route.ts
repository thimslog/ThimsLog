import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../../generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100
    );
    const search = searchParams.get("search")?.trim() || "";

    const where: Prisma.UserWhereInput = {};

    if (search) {
      const cleanSearch = search.startsWith("@") ? search.slice(1).trim() : search;
      const terms = search.split(/\s+/).filter(Boolean);

      const searchConditions: Prisma.UserWhereInput[] = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { userName: { contains: cleanSearch, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];

      // If multi-word search (e.g., "John Doe"), check combination of first & last names
      if (terms.length >= 2) {
        searchConditions.push({
          AND: [
            { firstName: { contains: terms[0], mode: "insensitive" } },
            { lastName: { contains: terms[1], mode: "insensitive" } },
          ],
        });
        searchConditions.push({
          AND: [
            { firstName: { contains: terms[1], mode: "insensitive" } },
            { lastName: { contains: terms[0], mode: "insensitive" } },
          ],
        });
      }

      where.OR = searchConditions;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          phoneNumber: true,
          referralCode: true,
          referredById: true,
          referredBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userName: true,
            },
          },
          createdAt: true,
          updatedAt: true,
          wallet: {
            select: {
              balance: true,
              currency: true,
            },
          },
        },
      }),

      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
