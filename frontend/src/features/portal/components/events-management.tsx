"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Locale } from "@/config/site";
import type { PortalEvent } from "@/features/portal/lib/api";
import { EventRowActions } from "@/features/portal/components/event-row-actions";
import {
  formatEventDate,
  getEventModeLabel,
  getEventPublicationLabel,
  getEventStatusLabel,
  getEventVisibilityLabel,
} from "@/features/events/lib/event-labels";

export function EventsManagement({
  locale,
  title,
  description,
  events,
  detailHrefPrefix,
  primaryActionHref,
  primaryActionLabel,
  showAuditAction = false,
}: {
  locale: Locale;
  title: string;
  description: string;
  events: PortalEvent[];
  detailHrefPrefix: string;
  primaryActionHref?: string;
  primaryActionLabel?: string;
  showAuditAction?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<string>("all");
  const [zoomEnabled, setZoomEnabled] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [publicationStatus, setPublicationStatus] = useState<string>("all");

  const labels = locale === "ar"
    ? {
        search: "ابحث بالعنوان",
        visibility: "الرؤية",
        zoom: "Zoom",
        status: "حالة الحجز",
        publication: "النشر",
        all: "الكل",
        empty: "لا توجد فعاليات",
        total: "الإجمالي",
        public: "العامة",
        private: "الخاصة",
        tentative: "المؤقتة",
        confirmed: "المؤكدة",
      }
    : {
        search: "Search by title",
        visibility: "Visibility",
        zoom: "Zoom enabled",
        status: "Booking state",
        publication: "Publication",
        all: "All",
        empty: "No events found",
        total: "Total",
        public: "Public",
        private: "Private",
        tentative: "Tentative",
        confirmed: "Confirmed",
      };

  const summary = useMemo(() => {
    return events.reduce(
      (accumulator, event) => ({
        total: accumulator.total + 1,
        publicCount: accumulator.publicCount + (event.visibility === "PUBLIC" ? 1 : 0),
        privateCount: accumulator.privateCount + (event.visibility === "PRIVATE" ? 1 : 0),
        zoomEnabledCount: accumulator.zoomEnabledCount + (event.zoomEnabled ? 1 : 0),
        tentativeCount: accumulator.tentativeCount + (event.status === "TENTATIVE" ? 1 : 0),
        confirmedCount: accumulator.confirmedCount + (event.status === "CONFIRMED" ? 1 : 0),
      }),
      {
        total: 0,
        publicCount: 0,
        privateCount: 0,
        zoomEnabledCount: 0,
        tentativeCount: 0,
        confirmedCount: 0,
      },
    );
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const publicationValue =
        typeof event.publicationStatus === "object" && event.publicationStatus
          ? event.publicationStatus.status
          : event.publicationStatus;
      const matchesQuery =
        !query.trim() ||
        `${event.title} ${event.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchesVisibility = visibility === "all" || event.visibility === visibility;
      const matchesZoom = zoomEnabled === "all"
        || (zoomEnabled === "yes" && event.zoomEnabled)
        || (zoomEnabled === "no" && !event.zoomEnabled);
      const matchesStatus = status === "all" || event.status === status;
      const matchesPublication =
        publicationStatus === "all"
        || publicationValue === publicationStatus;
      return matchesQuery && matchesVisibility && matchesZoom && matchesStatus && matchesPublication;
    });
  }, [events, query, visibility, zoomEnabled, status, publicationStatus]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 bg-white/95 shadow-sm">
        <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          {primaryActionHref && primaryActionLabel ? (
            <a
              href={primaryActionHref}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {primaryActionLabel}
            </a>
          ) : null}
        </div>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label={labels.total} value={summary.total.toString()} />
          <Stat label={labels.public} value={summary.publicCount.toString()} />
          <Stat label={labels.private} value={summary.privateCount.toString()} />
          <Stat label={locale === "ar" ? "Zoom" : "Zoom enabled"} value={summary.zoomEnabledCount.toString()} />
          <Stat label={labels.tentative} value={summary.tentativeCount.toString()} />
          <Stat label={labels.confirmed} value={summary.confirmedCount.toString()} />
        </CardContent>
        <div className="border-t border-border/50" />
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {labels.search}
            </label>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {labels.visibility}
            </label>
            <Select value={visibility} onValueChange={(value) => setVisibility(value ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder={labels.visibility} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.all}</SelectItem>
                <SelectItem value="PUBLIC">{locale === "ar" ? "عام" : "Public"}</SelectItem>
                <SelectItem value="PRIVATE">{locale === "ar" ? "خاص" : "Private"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {labels.zoom}
            </label>
            <Select value={zoomEnabled} onValueChange={(value) => setZoomEnabled(value ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder={labels.zoom} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.all}</SelectItem>
                <SelectItem value="yes">{locale === "ar" ? "مفعل" : "Enabled"}</SelectItem>
                <SelectItem value="no">{locale === "ar" ? "غير مفعل" : "Disabled"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {labels.status}
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder={labels.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.all}</SelectItem>
                <SelectItem value="DRAFT">{locale === "ar" ? "مسودة" : "Draft"}</SelectItem>
                <SelectItem value="PENDING_VALIDATION">{locale === "ar" ? "قيد التحقق" : "Pending validation"}</SelectItem>
                <SelectItem value="TENTATIVE">{locale === "ar" ? "مؤقت" : "Tentative"}</SelectItem>
                <SelectItem value="CONFIRMED">{locale === "ar" ? "مؤكد" : "Confirmed"}</SelectItem>
                <SelectItem value="PENDING_PUBLICATION">{locale === "ar" ? "قيد النشر" : "Pending publication"}</SelectItem>
                <SelectItem value="PUBLISHED">{locale === "ar" ? "منشور" : "Published"}</SelectItem>
                <SelectItem value="RESCHEDULED">{locale === "ar" ? "أعيدت الجدولة" : "Rescheduled"}</SelectItem>
                <SelectItem value="CANCELLED">{locale === "ar" ? "ملغي" : "Cancelled"}</SelectItem>
                <SelectItem value="FAILED">{locale === "ar" ? "فشل" : "Failed"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {labels.publication}
            </label>
            <Select value={publicationStatus} onValueChange={(value) => setPublicationStatus(value ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder={labels.publication} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.all}</SelectItem>
                <SelectItem value="NOT_ELIGIBLE">{locale === "ar" ? "غير مؤهل" : "Not eligible"}</SelectItem>
                <SelectItem value="ELIGIBLE">{locale === "ar" ? "مؤهل" : "Eligible"}</SelectItem>
                <SelectItem value="PUBLISHED">{locale === "ar" ? "منشور" : "Published"}</SelectItem>
                <SelectItem value="UNPUBLISHED">{locale === "ar" ? "غير منشور" : "Unpublished"}</SelectItem>
                <SelectItem value="REJECTED">{locale === "ar" ? "مرفوض" : "Rejected"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-white/95 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{locale === "ar" ? "الفعالية" : "Event"}</TableHead>
                <TableHead>{locale === "ar" ? "المنشئ" : "Creator"}</TableHead>
                <TableHead>{locale === "ar" ? "Zoom" : "Zoom"}</TableHead>
                <TableHead>{locale === "ar" ? "الحجز" : "Booking"}</TableHead>
                <TableHead>{locale === "ar" ? "النشر" : "Publication"}</TableHead>
                <TableHead>{locale === "ar" ? "النمط" : "Mode"}</TableHead>
                <TableHead className="text-right">{locale === "ar" ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {labels.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-primary">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatEventDate(locale, event.date)} · {event.startTime}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{getEventVisibilityLabel(locale, event.visibility as never)}</Badge>
                          <Badge variant={event.zoomEnabled ? "secondary" : "outline"}>
                            {event.zoomEnabled ? (locale === "ar" ? "Zoom مفعل" : "Zoom enabled") : (locale === "ar" ? "Zoom غير مفعل" : "Zoom disabled")}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(locale === "ar" ? event.regions?.nameAr : event.regions?.nameEn) ?? event.regionId} · {(locale === "ar" ? event.areas?.nameAr : event.areas?.nameEn) ?? event.areaId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-primary">
                          {event.creator?.displayName ?? event.organizerName ?? event.createdById}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.creator?.email ?? event.organizer?.email ?? (locale === "ar" ? "لا توجد تفاصيل إضافية" : "No extra details")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.zoomEnabled ? "secondary" : "outline"}>
                        {event.zoomEnabled ? (locale === "ar" ? "مفعل" : "Yes") : (locale === "ar" ? "غير مفعل" : "No")}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEventStatusLabel(locale, event.status as never)}</TableCell>
                    <TableCell>
                      {getEventPublicationLabel(
                        locale,
                        typeof event.publicationStatus === "object" && event.publicationStatus
                          ? event.publicationStatus.status
                          : event.publicationStatus,
                      )}
                    </TableCell>
                    <TableCell>{getEventModeLabel(locale, event.mode as never)}</TableCell>
                    <TableCell className="text-right">
                      <EventRowActions
                        eventId={event.id}
                        status={event.status}
                        visibility={event.visibility}
                        detailHref={`${detailHrefPrefix}/${event.id}`}
                        editHref={`${detailHrefPrefix}/${event.id}/edit`}
                        showAuditAction={showAuditAction}
                        locale={locale}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/30 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-primary">{value}</div>
    </div>
  );
}
