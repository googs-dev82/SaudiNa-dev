import { NextRequest, NextResponse } from "next/server";

const portalSessionCookieName = "saudina_portal_token";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const cmsRoles = new Set(["SUPER_ADMIN", "CONTENT_EDITOR"]);

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(portalSessionCookieName)?.value;

  if (!token || !apiBaseUrl) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  const user = (await response.json().catch(() => null)) as
    | { roles?: string[] }
    | null;

  const hasCmsAccess = (user?.roles ?? []).some((role) => cmsRoles.has(role));

  if (!hasCmsAccess) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*"],
};
