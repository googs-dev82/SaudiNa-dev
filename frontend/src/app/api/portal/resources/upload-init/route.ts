import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { getPortalToken } from "@/features/portal/lib/session";

export async function POST(request: NextRequest) {
  const token = await getPortalToken();

  if (!env.apiBaseUrl || !token) {
    return NextResponse.json({ message: "Missing portal API configuration." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    fileName?: string;
    isPublic?: boolean;
  };

  const response = await fetch(`${env.apiBaseUrl}/api/v1/admin/resources/upload-init`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return NextResponse.json({ message: "Unable to reach the backend API." }, { status: 503 });
  }

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
