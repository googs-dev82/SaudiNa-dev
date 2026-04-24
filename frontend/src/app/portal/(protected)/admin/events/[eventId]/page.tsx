import { notFound } from "next/navigation";
import { EventDetail } from "@/features/events/components/event-detail";
import { EventManagementActions } from "@/features/portal/components/event-management-actions";
import type { PortalEvent } from "@/features/portal/lib/api";
import { getPortalEvent, getPortalEventAudit } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalAdminEventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const { eventId } = await params;
  const event = await getPortalEvent(eventId).catch(() => null);

  if (!event) {
    notFound();
  }

  const resolvedEvent = event as PortalEvent;

  const auditLogs = await getPortalEventAudit(eventId).catch(() => []);

  return (
    <EventDetail
      locale={locale}
      event={resolvedEvent as never}
      auditLogs={auditLogs as never}
      isAdmin
      backHref="/portal/admin/events"
      backLabel={locale === "ar" ? "العودة إلى سجل الحوكمة" : "Back to governance register"}
      actionHref={`/portal/events/${eventId}/edit`}
      actionLabel={locale === "ar" ? "تعديل الفعالية" : "Edit event"}
      actions={
        <EventManagementActions
          eventId={eventId}
          status={resolvedEvent.status}
          visibility={resolvedEvent.visibility}
          locale={locale}
        />
      }
    />
  );
}
