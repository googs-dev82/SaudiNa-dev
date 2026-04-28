import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/config/site";
import type { EventAuditLogDto, PublicEventDto } from "@/types/api";
import {
  formatEventDate,
  getEventModeLabel,
  getEventPublicationLabel,
  getEventStatusLabel,
  getEventVisibilityLabel,
} from "../lib/event-labels";

type UserSummary = {
  id: string;
  email: string;
  displayName: string;
  status?: string;
  provider?: string;
  externalSubject?: string | null;
};

type BookingRequestSummary = {
  id: string;
  eventId: string;
  requestedById: string;
  slotId?: string | null;
  requestedStartAt: string;
  requestedEndAt: string;
  timezone: string;
  status: string;
  idempotencyKey: string;
  failureReason?: string | null;
  validatedAt?: string | null;
  confirmedAt?: string | null;
  tentativeHolds?: Array<{
    id: string;
    eventId: string;
    bookingRequestId: string;
    slotId: string;
    holdToken: string;
    expiresAt: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }> | null;
  zoomMeetings?: Array<{
    id: string;
    eventId: string;
    bookingRequestId: string;
    zoomMeetingId: string;
    joinUrl: string;
    hostUrl?: string | null;
    startUrl?: string | null;
    externalStatus: string;
    idempotencyKey: string;
    bookedAt: string;
    cancelledAt?: string | null;
  }> | null;
};

type NotificationLogSummary = {
  id: string;
  eventId: string;
  bookingRequestId?: string | null;
  notificationType: string;
  recipientEmail: string;
  status: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
};

type EventDetailEvent = Omit<PublicEventDto, "publicationStatus"> & {
  createdById?: string;
  organizerName?: string | null;
  organizerUserId?: string | null;
  creator?: UserSummary | null;
  organizer?: UserSummary | null;
  invitationInstructions?: string | null;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  meetingLink?: string | null;
  publicationStatus?:
    | string
    | { status: string }
    | null;
  bookingRequests?: BookingRequestSummary[] | null;
  notificationLogs?: NotificationLogSummary[] | null;
  auditLogs?: EventAuditLogDto[] | null;
};

export function EventDetail({
  locale,
  event,
  auditLogs,
  isAdmin = false,
  actionHref,
  actionLabel,
  backHref,
  backLabel,
  actions,
}: {
  locale: Locale;
  event: EventDetailEvent;
  auditLogs?: EventAuditLogDto[] | null;
  isAdmin?: boolean;
  actionHref?: string;
  actionLabel?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  const publicationStatus =
    typeof event.publicationStatus === "object" && event.publicationStatus
      ? event.publicationStatus.status
      : event.publicationStatus;
  const latestBooking = event.bookingRequests?.[0];
  const latestZoomMeeting = latestBooking?.zoomMeetings?.[0];
  const latestHold = latestBooking?.tentativeHolds?.[0];

  const labels = locale === "ar"
    ? {
        back: "العودة",
        overview: "نظرة عامة",
        booking: "الحجز",
        creator: "المنشئ",
        restrictions: "القيود",
        instructions: "تعليمات الحضور",
        location: "الموقع",
        notifications: "التنبيهات",
        audit: "سجل التدقيق",
        visibility: "الرؤية",
        publication: "النشر",
        zoom: "Zoom",
        bookingRequest: "طلب الحجز",
        hold: "الحجز المؤقت",
      }
    : {
        back: "Back",
        overview: "Overview",
        booking: "Booking",
        creator: "Creator",
        restrictions: "Restrictions",
        instructions: "Instructions",
        location: "Location",
        notifications: "Notifications",
        audit: "Audit log",
        visibility: "Visibility",
        publication: "Publication",
        zoom: "Zoom",
        bookingRequest: "Booking request",
        hold: "Tentative hold",
      };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={backHref ?? (locale === "ar" ? "/ar/events" : "/en/events")}>{backLabel ?? labels.back}</Link>
      </Button>

      <Card className="rounded-lg border-secondary/15 bg-white/95 shadow-sm">
        <div className="border-b border-secondary/10 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{getEventVisibilityLabel(locale, event.visibility)}</Badge>
              <Badge variant="outline">{getEventModeLabel(locale, event.mode)}</Badge>
              <Badge variant="secondary">{getEventStatusLabel(locale, event.status)}</Badge>
              {event.zoomEnabled ? (
                <Badge variant="outline">{locale === "ar" ? "Zoom مفعل" : "Zoom enabled"}</Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {actionHref && actionLabel ? (
                <Button asChild variant="outline">
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              ) : null}
              {actions}
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">{event.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{event.description ?? (locale === "ar" ? "لا يوجد وصف بعد." : "No description provided yet.")}</p>
        </div>

        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <Info title={labels.overview}>
            <Row label={locale === "ar" ? "التاريخ" : "Date"} value={formatEventDate(locale, event.date)} />
            <Row label={locale === "ar" ? "الوقت" : "Time"} value={`${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`} />
            <Row label={locale === "ar" ? "المنطقة" : "Region"} value={event.regions?.nameAr ?? event.regions?.nameEn ?? event.regionId} />
            <Row label={locale === "ar" ? "الحي" : "Area"} value={event.areas?.nameAr ?? event.areas?.nameEn ?? event.areaId} />
            <Row label={labels.zoom} value={event.zoomEnabled ? (locale === "ar" ? "مفعل" : "Enabled") : (locale === "ar" ? "غير مفعل" : "Disabled")} />
            <Row label={locale === "ar" ? "اللغة الزمنية" : "Timezone"} value={event.timezone} />
          </Info>

          <Info title={labels.booking}>
            <Row label={labels.visibility} value={getEventVisibilityLabel(locale, event.visibility)} />
            <Row label={labels.publication} value={getEventPublicationLabel(locale, publicationStatus)} />
            <Row label={labels.bookingRequest} value={latestBooking?.status ? getEventStatusLabel(locale, latestBooking.status) : (locale === "ar" ? "لا يوجد" : "None")} />
            <Row
              label={labels.hold}
              value={latestHold ? new Date(latestHold.expiresAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US") : (locale === "ar" ? "لا يوجد" : "None")}
            />
            <Row
              label={locale === "ar" ? "اجتماع Zoom" : "Zoom meeting"}
              value={latestZoomMeeting?.zoomMeetingId ?? (locale === "ar" ? "لا يوجد" : "None")}
            />
            {latestZoomMeeting ? (
              <>
                <Row label={locale === "ar" ? "حالة Zoom الخارجية" : "External status"} value={latestZoomMeeting.externalStatus} />
                <Row label={locale === "ar" ? "وقت الإنشاء" : "Booked at"} value={new Date(latestZoomMeeting.bookedAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")} />
              </>
            ) : null}
            {latestBooking?.failureReason ? (
              <Row label={locale === "ar" ? "سبب الفشل" : "Failure reason"} value={latestBooking.failureReason} />
            ) : null}
          </Info>

          {isAdmin ? (
            <Info title={labels.creator}>
              <Row label={locale === "ar" ? "المنشئ" : "Created by"} value={event.creator?.displayName ?? event.creator?.email ?? event.createdById} />
              <Row label={locale === "ar" ? "البريد الإلكتروني" : "Email"} value={event.creator?.email ?? (locale === "ar" ? "غير متوفر" : "Not available")} />
              <Row label={locale === "ar" ? "المسؤول" : "Organizer"} value={event.organizer?.displayName ?? event.organizerName ?? (locale === "ar" ? "غير متوفر" : "Not available")} />
              <Row label={locale === "ar" ? "حالة الحساب" : "Account status"} value={event.creator?.status ?? (locale === "ar" ? "غير معروف" : "Unknown")} />
            </Info>
          ) : null}

          {event.invitationInstructions ? (
            <Info title={labels.instructions}>
              <p className="text-sm leading-7 text-muted-foreground">{event.invitationInstructions}</p>
            </Info>
          ) : null}

          {event.locationAddress || event.meetingLink ? (
            <Info title={labels.location}>
              {event.locationAddress ? <Row label={locale === "ar" ? "العنوان" : "Address"} value={event.locationAddress} /> : null}
              {event.meetingLink ? (
                <Row
                  label={locale === "ar" ? "الرابط" : "Link"}
                  value={<a className="text-primary underline" href={event.meetingLink} target="_blank" rel="noreferrer">{event.meetingLink}</a>}
                />
              ) : null}
            </Info>
          ) : null}

          {event.visibility === "PRIVATE" || isAdmin ? (
            <Info title={labels.restrictions}>
              <p className="text-sm leading-7 text-muted-foreground">
                {event.visibility === "PRIVATE"
                  ? (locale === "ar"
                    ? "هذا الحدث خاص ولا يظهر في صفحات الموقع العامة أو نتائج البحث العامة أو إجابات المساعد الآلي العامة."
                    : "This event is private and is hidden from public pages, public search, and public chatbot answers.")
                  : (locale === "ar"
                    ? "الحدث العام مؤهل للنشر فقط بعد التأكيد ولا يجب أن يتضمن أي بيانات سرية."
                    : "Public events are only eligible for publication after confirmation and must not expose secrets.")}
              </p>
            </Info>
          ) : null}

          {isAdmin && event.notificationLogs?.length ? (
            <Info title={labels.notifications}>
              <div className="flex flex-col gap-3">
                {event.notificationLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="rounded-lg border border-secondary/10 bg-secondary/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-primary">{log.notificationType}</div>
                      <Badge variant={log.status === "FAILED" ? "destructive" : "secondary"}>{log.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{log.recipientEmail}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US") : (locale === "ar" ? "لم يرسل بعد" : "Not sent yet")}
                    </div>
                  </div>
                ))}
              </div>
            </Info>
          ) : null}

          {isAdmin && auditLogs?.length ? (
            <Info title={labels.audit}>
              <div className="flex flex-col gap-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-secondary/10 bg-secondary/5 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
                    </div>
                    <div className="mt-2 text-sm font-medium text-primary">{log.action}</div>
                  </div>
                ))}
              </div>
            </Info>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function Info({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-secondary/10 bg-secondary/5 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{title}</h2>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-secondary/10 py-2 last:border-b-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="max-w-[60%] text-right text-sm font-medium text-primary">{value}</div>
    </div>
  );
}
