import { EventsManagement } from "@/features/portal/components/events-management";
import { GovernanceEmptyState, GovernanceSection } from "@/features/portal/components/governance-ui";
import { getPortalEvents } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalAdminEventsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  if (!user.roles.includes("SUPER_ADMIN")) {
    return (
      <GovernanceSection
        title={locale === "ar" ? "الوصول مقيد" : "Access restricted"}
        description={
          locale === "ar"
            ? "يمكن للمشرفين العامين فقط الوصول إلى سجل حوكمة الفعاليات."
            : "Only super administrators can access the event governance register."
        }
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "حوكمة الفعاليات غير متاحة" : "Event governance is unavailable"}
          description={
            locale === "ar"
              ? "هذه الصفحة مخصصة لمراجعة النشر والحجز عبر جميع الفعاليات."
              : "This page is reserved for reviewing publication and booking state across all events."
          }
        />
      </GovernanceSection>
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
