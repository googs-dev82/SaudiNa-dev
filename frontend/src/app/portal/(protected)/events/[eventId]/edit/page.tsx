import { notFound } from "next/navigation";
import { EventEditor } from "@/features/portal/components/event-editor";
import { updatePortalEventFormAction } from "@/features/portal/lib/mutations";
import { getPortalAreas, getPortalEvent, getPortalRegions } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalEditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const { eventId } = await params;
  const [event, regions, areas] = await Promise.all([
    getPortalEvent(eventId).catch(() => null),
    getPortalRegions(),
    getPortalAreas(),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <EventEditor
      locale={locale}
      action={updatePortalEventFormAction}
      regions={regions}
      areas={areas}
      event={event}
      title={locale === "ar" ? "تعديل الفعالية" : "Edit event"}
      description={
        locale === "ar"
          ? "حدّث تفاصيل الفعالية والرؤية وحقول حجز Zoom. يتم تدقيق جميع التغييرات."
          : "Update the event details, visibility, and Zoom booking fields. Changes are audited."
      }
      submitLabel={locale === "ar" ? "حفظ التغييرات" : "Save changes"}
      successMessage={locale === "ar" ? "تم تحديث الفعالية بنجاح." : "Event updated successfully."}
    />
  );
}
