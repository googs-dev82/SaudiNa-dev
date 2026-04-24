import {
  GovernanceEmptyState,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { RecoveryMeetingsAdmin } from "@/features/portal/components/recovery-meetings-admin";
import {
  PortalArea,
  PortalApiError,
  PortalRecoveryMeeting,
  PortalRegion,
  getPortalAreas,
  getPortalRecoveryMeetings,
  getPortalRegions,
} from "@/features/portal/lib/api";
import { getVisiblePortalNavItems } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalRecoveryMeetingsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const canView = getVisiblePortalNavItems(user, locale).some(
    (item) => item.href === "/portal/meetings/recovery",
  );

  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription:
            "الأدوار والتعيينات النشطة الحالية لا تمنحك صلاحية الوصول إلى إدارة اجتماعات التعافي.",
          emptyTitle: "إدارة اجتماعات التعافي غير متاحة",
          emptyDescription:
            "محررو الاجتماعات والمديرون ضمن النطاق والمشرف العام فقط هم من يمكنهم فتح هذه المساحة التشغيلية.",
          loadTitle: "تعذّر تحميل اجتماعات التعافي",
          loadDescription:
            "تعذر على الواجهة الخلفية إرجاع سجل اجتماعات التعافي المرتبط بالنطاق. حاول مرة أخرى عندما تصبح واجهة البرمجة متاحة.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription:
            "Your active roles and assignments do not currently allow access to recovery meetings administration.",
          emptyTitle: "Recovery meeting governance is unavailable",
          emptyDescription:
            "Meeting Editors, scoped managers, and Super Admins are the only roles that can open this operational surface.",
          loadTitle: "Unable to load recovery meetings",
          loadDescription:
            "We could not load recovery meetings from the backend.",
        };

  if (!canView) {
    return (
      <GovernanceSection
        title={copy.restrictedTitle}
        description={copy.restrictedDescription}
      >
        <GovernanceEmptyState
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      </GovernanceSection>
    );
  }

  let meetings: PortalRecoveryMeeting[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let errorMessage: string | null = null;

  try {
    [meetings, regions, areas] = await Promise.all([
      getPortalRecoveryMeetings(),
      getPortalRegions(),
      getPortalAreas(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load recovery meetings from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection
        title={copy.loadTitle}
        description={errorMessage}
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "خدمة اجتماعات التعافي غير متاحة" : "The recovery meeting service is unavailable"}
          description={copy.loadDescription}
        />
      </GovernanceSection>
    );
  }

  return (
    <RecoveryMeetingsAdmin
      meetings={meetings}
      regions={regions}
      areas={areas}
      canManage={canView}
      locale={locale}
    />
  );
}
