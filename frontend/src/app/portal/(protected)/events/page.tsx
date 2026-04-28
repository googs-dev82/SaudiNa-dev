import { EventsManagement } from "@/features/portal/components/events-management";
import { GovernanceEmptyState, GovernanceSection } from "@/features/portal/components/governance-ui";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalMyEvents } from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalEventsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);

  if (!canAccessPortalHref(user, "/portal/events")) {
    return (
      <GovernanceSection
        title={locale === "ar" ? "الوصول مقيد" : "Access restricted"}
        description={
          locale === "ar"
            ? "الأدوار الحالية لا تمنحك صلاحية إدارة الفعاليات."
            : "Your current roles do not allow event management access."
        }
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "إدارة الفعاليات غير متاحة" : "Event management is unavailable"}
          description={
            locale === "ar"
              ? "تحتاج إلى دور أو تعيين يسمح بإنشاء الفعاليات ومراجعتها."
              : "You need a role or assignment that allows event creation and review."
          }
        />
      </GovernanceSection>
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
