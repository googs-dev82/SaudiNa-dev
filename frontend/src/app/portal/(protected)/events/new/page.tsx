import { EventEditor } from "@/features/portal/components/event-editor";
import { createPortalEventFormAction } from "@/features/portal/lib/mutations";
import { getPortalAreas, getPortalRegions } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalNewEventPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const [regions, areas] = await Promise.all([getPortalRegions(), getPortalAreas()]);

  return (
    <EventEditor
      locale={locale}
      action={createPortalEventFormAction}
      regions={regions}
      areas={areas}
      title={locale === "ar" ? "إنشاء فعالية" : "Create event"}
      description={
        locale === "ar"
          ? "أنشئ فعالية عامة أو خاصة، ويمكنك تفعيل Zoom اختياريًا، ثم احفظها كسجل داخلي."
          : "Create a public or private event, optionally enable Zoom, and save it as an internal workflow record."
      }
      submitLabel={locale === "ar" ? "إنشاء فعالية" : "Create event"}
      successMessage={locale === "ar" ? "تم إنشاء الفعالية بنجاح." : "Event created successfully."}
    />
  );
}
