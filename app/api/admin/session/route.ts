
import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminSession,
  COOKIE_NAME
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const valid = verifyAdminSession(
    request.cookies.get(COOKIE_NAME)?.value
  );

  return NextResponse.json({
    authenticated: valid
  });
}
