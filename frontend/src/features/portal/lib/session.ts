import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PortalRole, PortalUser } from "@/types/portal";
import { portalLocaleCookieName, type PortalLocale } from "./portal-locale";

export const portalSessionCookieName = "saudina_portal_token";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const providerAuthUrls = {
  google: apiBaseUrl ? `${apiBaseUrl}/api/v1/auth/google/start?returnTo=/portal` : "",
  zoho: apiBaseUrl ? `${apiBaseUrl}/api/v1/auth/zoho/start?returnTo=/portal` : "",
} as const;

export async function getPortalToken() {
  const cookieStore = await cookies();
  return cookieStore.get(portalSessionCookieName)?.value ?? null;
}

export async function getPortalUser(): Promise<PortalUser | null> {
  const token = await getPortalToken();

  if (!token || !apiBaseUrl) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  return (await response.json()) as PortalUser;
}

export async function requirePortalUser() {
  const user = await getPortalUser();

  if (!user) {
    redirect("/portal/login");
  }

  return user;
}

export function hasAnyRole(user: PortalUser, roles: PortalRole[]) {
  return roles.some((role) => user.roles.includes(role));
}

export function hasPrCommitteeAccess(user: PortalUser) {
  return (
    user.roles.includes("SUPER_ADMIN") ||
    user.assignments.some(
      (assignment) => assignment.scopeCode === "PR_COMMITTEE",
    )
  );
}

export function hasCmsStudioAccess(user: PortalUser) {
  return hasAnyRole(user, ["SUPER_ADMIN", "CONTENT_EDITOR"]);
}

/**
 * Resolves the active portal locale in priority order:
 *  1. Session user's stored preferredLanguage
 *  2. explicit portal_locale cookie (set by the language switcher)
 *  3. default: "ar"
 */
export async function getPortalLocale(
  user?: PortalUser | null,
): Promise<PortalLocale> {
  if (user?.preferredLanguage) {
    return user.preferredLanguage;
  }
  const cookieStore = await cookies();
  const cookie = cookieStore.get(portalLocaleCookieName)?.value;
  return cookie === "en" ? "en" : "ar";
}
