"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { portalLocaleCookieName, type PortalLocale } from "@/features/portal/lib/portal-locale";
import { env } from "@/config/env";
import { getPortalToken } from "@/features/portal/lib/session";

export async function setPortalLocaleAction(locale: PortalLocale) {
  const cookieStore = await cookies();

  cookieStore.set(portalLocaleCookieName, locale, {
    path: "/portal",
    sameSite: "lax",
    httpOnly: false, // needs to be readable by client for switcher state
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // Also persist to user profile if we have a valid token
  const token = await getPortalToken();
  if (token && env.apiBaseUrl) {
    await fetch(`${env.apiBaseUrl}/api/v1/users/me/language`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredLanguage: locale }),
      cache: "no-store",
    }).catch(() => null); // best-effort — cookie already saved
  }

  revalidatePath("/portal", "layout");
}
