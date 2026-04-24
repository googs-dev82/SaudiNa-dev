import { EventsManagement } from "@/features/portal/components/events-management";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalMyEvents } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalEventsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);

  if (!canAccessPortalHref(user, "/portal/events")) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-8 editorial-shadow">
        <h2 className="text-2xl font-bold text-primary">
          {locale === "ar" ? "الوصول مقيد" : "Access restricted"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {locale === "ar"
            ? "الأدوار الحالية لا تمنحك صلاحية إدارة الفعاليات."
            : "Your current roles do not allow event management access."}
        </p>
      </div>
    );
  }

  const events = await getPortalMyEvents();

  return (
    <EventsManagement
      locale={locale}
      title={locale === "ar" ? "فعالياتي" : "My events"}
      description={
        locale === "ar"
          ? "أنشئ وراجع سجلات الفعاليات الخاصة بك، بما في ذلك الحجوزات المفعلة عبر Zoom وحالة النشر."
          : "Create and review your Events records, including Zoom-enabled bookings and publication state."
      }
      events={events}
      detailHrefPrefix="/portal/events"
      primaryActionHref="/portal/events/new"
      primaryActionLabel={locale === "ar" ? "إنشاء فعالية" : "Create event"}
    />
  );
}
