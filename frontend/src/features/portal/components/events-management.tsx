"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  GovernanceEmptyState,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";

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
      <GovernancePageHeader
        eyebrow={locale === "ar" ? "الفعاليات" : "Events"}
        title={title}
        description={description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", locale === "ar" ? "الفعاليات" : "Events", title]}
        primaryAction={
          primaryActionHref && primaryActionLabel ? (
            <a
              href={primaryActionHref}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {primaryActionLabel}
            </a>
          ) : null
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={labels.total} value={summary.total} hint={locale === "ar" ? "كل الفعاليات ضمن نطاقك." : "All events currently in your scope."} />
        <GovernanceMetricCard label={labels.public} value={summary.publicCount} hint={locale === "ar" ? "فعاليات ظاهرة للعامة." : "Events visible to the public site."} />
        <GovernanceMetricCard label={labels.private} value={summary.privateCount} hint={locale === "ar" ? "فعاليات داخلية أو محدودة." : "Internal or limited-audience events."} />
        <GovernanceMetricCard label={locale === "ar" ? "Zoom" : "Zoom enabled"} value={summary.zoomEnabledCount} hint={locale === "ar" ? "فعاليات لديها اجتماع Zoom." : "Events with Zoom meeting access."} />
        <GovernanceMetricCard label={labels.tentative} value={summary.tentativeCount} hint={locale === "ar" ? "فعاليات لم يتم تثبيتها بعد." : "Events not fully confirmed yet."} />
        <GovernanceMetricCard label={labels.confirmed} value={summary.confirmedCount} hint={locale === "ar" ? "فعاليات مؤكدة وجاهزة." : "Confirmed events ready for use."} />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={locale === "ar" ? "تصفية الفعاليات" : "Filter events"}
        description={
          locale === "ar"
            ? "استخدم البحث والعوامل لمراجعة السجلات المهمة بسرعة."
            : "Use search and filters to quickly review the records that matter."
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
        </div>
      </GovernanceSection>

      <GovernanceSection
        title={locale === "ar" ? "سجل الفعاليات" : "Events register"}
        description={
          locale === "ar"
            ? "كل صف يعرض الحالة التشغيلية وحالة النشر والإجراءات التالية."
            : "Each row shows operational state, publication posture, and next actions."
        }
      >
        <div className="overflow-hidden rounded-lg border border-secondary/10 bg-secondary/5">
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
                    <GovernanceEmptyState
                      title={labels.empty}
                      description={
                        locale === "ar"
                          ? "غيّر عوامل التصفية أو أنشئ فعالية جديدة عندما تكون جاهزًا."
                          : "Adjust the filters or create a new event when you are ready."
                      }
                    />
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
        </div>
      </GovernanceSection>
    </div>
  );
}
