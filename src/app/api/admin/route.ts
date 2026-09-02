import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/jwt";
import { success, failure, handleError } from "@/lib/apiResponse";

export async function GET(request: Request) {
  try {
    await getCurrentAdmin();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
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
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.admin.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return success(
      "Admins fetched successfully",
      {
        admins,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      200,
    );
  } catch (error) {
    return handleError(error, "Failed to fetch admins");
  }
}