"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, type Locale } from "@/config/site";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentTail = segments.slice(1).join("/");

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      {locales.map((targetLocale) => {
        const href = `/${targetLocale}${currentTail ? `/${currentTail}` : ""}`;
        return (
          <Link
            key={targetLocale}
            href={href}
            className={targetLocale === locale ? "rounded-full bg-muted px-2 py-1 text-primary" : "rounded-full px-2 py-1 hover:bg-muted/60"}
          >
            {targetLocale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
