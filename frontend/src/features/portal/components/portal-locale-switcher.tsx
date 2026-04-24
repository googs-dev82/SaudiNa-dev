"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setPortalLocaleAction } from "@/features/portal/lib/locale-actions";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import { cn } from "@/lib/utils";

export function PortalLocaleSwitcher({ locale }: { locale: PortalLocale }) {
  const [isPending, startTransition] = useTransition();

  function switchTo(next: PortalLocale) {
    if (next === locale) return;
    startTransition(() => {
      void setPortalLocaleAction(next);
    });
  }

  return (
    <div
      className="flex items-center rounded-md border border-border bg-muted/40 p-0.5"
      aria-label={locale === "ar" ? "مبدّل اللغة" : "Language switcher"}
    >
      <Button
        className={cn(
          "h-6 rounded px-2 text-xs font-semibold transition-all",
          locale === "ar"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        disabled={isPending}
        onClick={() => switchTo("ar")}
        size="sm"
        variant="ghost"
      >
        {locale === "ar" ? "العربية" : "Arabic"}
      </Button>
      <Button
        className={cn(
          "h-6 rounded px-2 text-xs font-semibold transition-all",
          locale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        disabled={isPending}
        onClick={() => switchTo("en")}
        size="sm"
        variant="ghost"
      >
        English
      </Button>
    </div>
  );
}
