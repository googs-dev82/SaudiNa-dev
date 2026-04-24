import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { portalSessionCookieName } from "@/features/portal/lib/session";
import type { AuthExchangeResponse } from "@/types/portal";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function POST(request: NextRequest) {
  if (!apiBaseUrl) {
    return NextResponse.json({ ok: false, message: "Missing NEXT_PUBLIC_API_BASE_URL" }, { status: 500 });
  }

  const payload = (await request.json()) as {
    provider: "GOOGLE" | "ZOHO";
    accessToken?: string;
    email?: string;
    displayName?: string;
  };

  const providerPath = payload.provider === "GOOGLE" ? "google/token" : "zoho/token";
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/${providerPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      accessToken: payload.accessToken,
      email: payload.email,
      displayName: payload.displayName,
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json({ ok: false, message: "Unable to authenticate user." }, { status: 401 });
  }

  const result = (await response.json()) as AuthExchangeResponse;
  const cookieStore = await cookies();
  cookieStore.set(portalSessionCookieName, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return NextResponse.json({ ok: true, user: result.user });
}
