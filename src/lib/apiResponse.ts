import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const success = (
  message: string,
  data?: unknown,
  status = 200
) => NextResponse.json({ success: true, message, ...(data !== undefined && { data }) }, { status });

export const failure = (message: string, status = 400, extra?: object) =>
  NextResponse.json({ success: false, message, ...extra }, { status });

export const handleError = (error: unknown, fallback = "Something went wrong") => {
  console.error(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation error",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: fallback,
      ...(process.env.NODE_ENV === "development" && {
        error: error instanceof Error ? error.message : String(error),
      }),
    },
    { status: 500 }
  );
};