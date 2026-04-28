"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/states/empty-state";
import type { Locale } from "@/config/site";
import type { EventMode, PublicEventDto } from "@/types/api";
import {
  formatEventDate,
  getEventModeLabel,
  getEventPublicationLabel,
  getEventVisibilityLabel,
} from "../lib/event-labels";

type EventDirectoryProps = {
  locale: Locale;
  events: PublicEventDto[];
  title: string;
  description: string;
};

const modeOptions: Array<{ value: "all" | EventMode; label: { ar: string; en: string } }> = [
  { value: "all", label: { ar: "كل الأنماط", en: "All modes" } },
  { value: "PHYSICAL", label: { ar: "حضوري", en: "Physical" } },
  { value: "ONLINE", label: { ar: "عبر الإنترنت", en: "Online" } },
  { value: "HYBRID", label: { ar: "هجين", en: "Hybrid" } },
];

export function EventDirectory({ locale, events, title, description }: EventDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [mode, setMode] = useState<EventMode | "all">(
    (searchParams.get("mode") as EventMode | "all" | null) ?? "all",
  );

  const labels = locale === "ar"
    ? {
        heroKicker: "الفعاليات",
        search: "ابحث بعنوان الفعالية",
        mode: "النمط",
        apply: "تطبيق",
        clear: "مسح",
        view: "عرض التفاصيل",
        noResults: "لا توجد فعاليات مطابقة",
        noResultsText: "جرّب تغيير الفلاتر أو العودة لاحقاً.",
      }
    : {
        heroKicker: "Events",
        search: "Search by title",
        mode: "Mode",
        apply: "Apply",
        clear: "Clear",
        view: "View details",
        noResults: "No matching events",
        noResultsText: "Try adjusting the filters or check back later.",
      };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = !query.trim()
        || `${event.title} ${event.description ?? ""} ${event.locationAddress ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      const matchesMode = mode === "all" || event.mode === mode;
      return matchesQuery && matchesMode;
    });
  }, [events, query, mode]);

  const commitFilters = () => {
    const next = new URLSearchParams(searchParams.toString());
    if (query.trim()) next.set("query", query.trim()); else next.delete("query");
    if (mode !== "all") next.set("mode", mode); else next.delete("mode");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const clearFilters = () => {
    setQuery("");
    setMode("all");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  return (
    <main className="bg-background">
      <section className="border-b border-secondary/10 bg-[linear-gradient(180deg,#fdfcf9_0%,#f4f7ef_100%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{labels.heroKicker}</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <Card className="rounded-lg border-secondary/15 bg-card/95 shadow-sm">
          <CardContent className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_220px_auto_auto] md:items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{labels.search}</label>
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{labels.mode}</label>
              <Select value={mode} onValueChange={(value) => setMode(value as EventMode | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder={labels.mode} />
                </SelectTrigger>
                <SelectContent>
                  {modeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="rounded-lg" onClick={commitFilters} disabled={isPending}>{labels.apply}</Button>
            <Button className="rounded-lg border-secondary/20 text-primary hover:bg-secondary/5" variant="outline" onClick={clearFilters} disabled={isPending}>{labels.clear}</Button>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4">
          {filteredEvents.length === 0 ? (
            <EmptyState title={labels.noResults} description={labels.noResultsText} />
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="rounded-lg border-secondary/15 bg-white/95 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/35 hover:shadow-md">
                <div className="flex flex-col gap-3 border-b border-secondary/10 px-6 py-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="outline">{getEventVisibilityLabel(locale, event.visibility)}</Badge>
                    <h2 className="mt-3 text-2xl font-semibold text-primary">{event.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{event.description ?? (locale === "ar" ? "لا يوجد وصف بعد." : "No description provided yet.")}</p>
                  </div>
                  <Button className="rounded-lg border-secondary/20 text-primary hover:bg-secondary/5" asChild variant="outline">
                    <Link href={`/${locale}/events/${event.id}`}>{labels.view}</Link>
                  </Button>
                </div>
                <CardContent className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
                  <Meta label={locale === "ar" ? "التاريخ" : "Date"} value={formatEventDate(locale, event.date)} />
                  <Meta label={locale === "ar" ? "الوقت" : "Time"} value={`${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`} />
                  <Meta label={locale === "ar" ? "النمط" : "Mode"} value={getEventModeLabel(locale, event.mode)} />
                  <Meta label={locale === "ar" ? "الحالة" : "Status"} value={getEventPublicationLabel(locale, event.publicationStatus)} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-secondary/10 bg-secondary/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium text-primary">{value}</div>
    </div>
  );
}
