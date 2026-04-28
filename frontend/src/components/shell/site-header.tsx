"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { localeDirection, type Locale } from "@/config/site";
import { getLocalizedHref } from "@/components/cms/cms-link";
import { LocaleSwitcher } from "@/components/shell/locale-switcher";
import type { CmsSiteSettings } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

export function SiteHeader({ locale, settings }: { locale: Locale; settings: CmsSiteSettings }) {
  const isRtl = localeDirection(locale) === "rtl";
  const pathname = usePathname();
  const navigation = settings.navigation;

  const isActive = (href: string) => {
    const localizedHref = getLocalizedHref(href, locale);

    if (localizedHref === `/${locale}`) {
      return pathname === `/${locale}`;
    }

    return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <div className={`flex items-center ${isRtl ? "gap-4" : "gap-4"}`}>
          <BrandMark />
          <span className="text-lg font-semibold tracking-tight text-primary">{getLocalizedValue(settings.siteTitle, locale)}</span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item, index) => (
            <Link
              key={item.href || index}
              href={getLocalizedHref(item.href, locale)}
              className={isActive(item.href) ? "border-b-2 border-primary/40 pb-1 font-medium text-primary" : "text-sm text-muted-foreground hover:text-primary"}
            >
              {getLocalizedValue(item.label, locale)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/70">
            <Search className="h-4 w-4" />
          </span>
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </nav>
  );
}

function BrandMark() {
  return (
    <span aria-label="NA" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-secondary/25 bg-white text-sm font-bold tracking-tight text-primary shadow-sm ring-4 ring-secondary/10">
      NA
    </span>
  );
}
