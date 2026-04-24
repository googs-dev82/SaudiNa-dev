"use client";

import Link from "next/link";
import { BellDot, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { PortalNavItem } from "@/features/portal/lib/navigation";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import { PortalLocaleSwitcher } from "./portal-locale-switcher";
import { makeT } from "@/features/portal/lib/i18n";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

function buildBreadcrumb(
  pathname: string,
  items: PortalNavItem[],
  portalLabel: string,
) {
  const exact = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  if (!exact) {
    return [portalLabel];
  }

  return [portalLabel, exact.group, exact.label];
}

export function PortalSiteHeader({
  items,
  locale,
}: {
  items: PortalNavItem[];
  locale: PortalLocale;
}) {
  const isRtl = locale === "ar";
  const pathname = usePathname();
  const t = makeT(locale);
  const breadcrumb = buildBreadcrumb(pathname, items, t("breadcrumb.portal"));

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b border-border/50 bg-background/90 backdrop-blur">
      <div className="flex w-full items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="shrink-0" />
          <Separator
            className="mx-1 data-[orientation=vertical]:h-5"
            orientation="vertical"
          />

          <div className="min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    <BreadcrumbItem>
                      {index === breadcrumb.length - 1 ? (
                        <BreadcrumbPage>{item}</BreadcrumbPage>
                      ) : index === 0 ? (
                        <BreadcrumbLink render={<Link href="/portal" />}>
                          {item}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbLink>{item}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumb.length - 1 ? (
                      <BreadcrumbSeparator />
                    ) : null}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {t("portal.header.subtitle")}
            </p>
          </div>
        </div>

        <div className={cn("flex items-center gap-2 shrink-0")}>
          <div className="relative hidden md:block">
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
                isRtl ? "right-3" : "left-3",
              )}
            />
            <Input
              aria-label={locale === "ar" ? "البحث في البوابة" : "Global portal search"}
              className={cn(
                "w-64",
                isRtl ? "pr-9 text-right" : "pl-9",
                pathname.startsWith("/portal/admin") && "lg:w-80",
              )}
              placeholder={t("portal.header.search")}
            />
          </div>

          <PortalLocaleSwitcher locale={locale} />

          <Button size="icon-sm" variant="ghost">
            <BellDot />
            <span className="sr-only">{t("portal.header.notifications")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
