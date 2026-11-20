
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  createAdminSession,
  COOKIE_NAME
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const expected = Buffer.from(
      process.env.ADMIN_PASSWORD || ""
    );

    const actual = Buffer.from(
      typeof password === "string" ? password : ""
    );

    if (
      expected.length === 0 ||
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true
    });

    response.cookies.set(
      COOKIE_NAME,
      createAdminSession(),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 400 }
    );
  }
}
