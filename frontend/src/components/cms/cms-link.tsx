import Link from "next/link";
import type { Locale } from "@/config/site";
import type { CmsLink } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

const unlocalizedAppPrefixes = ["/portal", "/studio", "/api"];

export function getLocalizedHref(href: string, locale: Locale) {
  if (href === "/") {
    return `/${locale}`;
  }

  if (unlocalizedAppPrefixes.some((prefix) => href === prefix || href.startsWith(`${prefix}/`))) {
    return href;
  }

  return `/${locale}${href}`;
}

export function getCmsHref(link: CmsLink, locale: Locale) {
  if (link.kind === "external") {
    return link.href;
  }

  return getLocalizedHref(link.href, locale);
}

export function CmsLinkText({ link, locale, className }: { link: CmsLink; locale: Locale; className?: string }) {
  const label = getLocalizedValue(link.label, locale) ?? link.href;
  const href = getCmsHref(link, locale);

  if (link.kind === "external") {
    return (
      <a className={className} href={href} rel={link.openInNewTab ? "noreferrer" : undefined} target={link.openInNewTab ? "_blank" : undefined}>
        {label}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}
