"use client";

import { useCallback } from "react";
import { makeT, type TranslationKey } from "@/features/portal/lib/i18n";
import { portalLocaleCookieName, type PortalLocale } from "@/features/portal/lib/portal-locale";

/**
 * Reads the portal locale from the cookie set by the locale switcher.
 * Falls back to "ar" (the platform default) if no cookie is present.
 */
function readLocaleCookie(): PortalLocale {
  if (typeof document === "undefined") return "ar";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${portalLocaleCookieName}=`));
  const value = match?.split("=")[1];
  return value === "en" ? "en" : "ar";
}

/**
 * Returns a stable t() function bound to the current portal locale.
 * The locale is read from the portal_locale cookie set by PortalLocaleSwitcher.
 *
 * Usage in client components:
 *   const t = usePortalT();
 *   return <Button>{t("action.save")}</Button>
 */
export function usePortalT() {
  const locale = readLocaleCookie();
  // useCallback so the reference stays stable across renders at the same locale
  return useCallback((key: TranslationKey) => makeT(locale)(key), [locale]);
}
