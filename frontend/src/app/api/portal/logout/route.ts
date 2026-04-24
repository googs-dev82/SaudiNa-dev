import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { portalSessionCookieName } from "@/features/portal/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(portalSessionCookieName);
  return NextResponse.json({ ok: true });
}
