import Link from "next/link";
import type { Locale } from "@/config/site";
import type { CmsLink } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

export function getCmsHref(link: CmsLink, locale: Locale) {
  if (link.kind === "external") {
    return link.href;
  }

  if (link.href === "/") {
    return `/${locale}`;
  }

  return `/${locale}${link.href}`;
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
