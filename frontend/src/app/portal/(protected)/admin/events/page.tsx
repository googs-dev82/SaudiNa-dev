import { EventsManagement } from "@/features/portal/components/events-management";
import { getPortalEvents } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalAdminEventsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  if (!user.roles.includes("SUPER_ADMIN")) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-8 editorial-shadow">
        <h2 className="text-2xl font-bold text-primary">
          {locale === "ar" ? "الوصول مقيد" : "Access restricted"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {locale === "ar"
            ? "يمكن للمشرفين العامين فقط الوصول إلى سجل حوكمة الفعاليات."
            : "Only super administrators can access the event governance register."}
        </p>
      </div>
    );
  }
  const events = await getPortalEvents();

  return (
    <EventsManagement
      locale={locale}
      title={locale === "ar" ? "حوكمة الفعاليات" : "Events governance"}
      description={
        locale === "ar"
          ? "راجع الفعاليات العامة والخاصة وحالة حجز Zoom وحالة النشر."
          : "Review public and private events, Zoom booking state, and publication posture."
      }
      events={events}
      detailHrefPrefix="/portal/admin/events"
      primaryActionHref="/portal/events/new"
      primaryActionLabel={locale === "ar" ? "إنشاء فعالية" : "Create event"}
      showAuditAction
    />
  );
}
