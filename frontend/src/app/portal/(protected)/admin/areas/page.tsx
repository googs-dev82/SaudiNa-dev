import {
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import {
  PortalApiError,
  PortalArea,
  PortalCommittee,
  PortalRegion,
  getPortalAreas,
  getPortalCommittees,
  getPortalRegions,
} from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { CreateAreaDialog } from "@/features/portal/components/create-area-dialog";
import { AreasDirectoryTable } from "@/features/portal/components/areas-directory-table";

export default async function PortalAdminAreasPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "يمكن للمشرفين العامين فقط إدارة المناطق الفرعية.",
          loadTitle: "تعذّر تحميل المناطق الفرعية",
          eyebrow: "الحوكمة",
          title: "المناطق الفرعية",
          description: "المناطق الفرعية هي نطاق التشغيل الأساسي لإدارة الاجتماعات وحوكمة المستوى المحلي.",
          areas: "المناطق الفرعية",
          regions: "المناطق",
          committees: "اللجان",
          scopeType: "نوع النطاق",
          dirTitle: "دليل المناطق الفرعية",
          dirDesc: "كل منطقة فرعية تحمل منطقة أم ويمكن أن تستضيف عدة لجان وتعيينات خاضعة للحوكمة.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription: "Only super administrators can manage areas.",
          loadTitle: "Unable to load areas",
          eyebrow: "Governance",
          title: "Areas",
          description: "Areas are the core operational scope for meeting management and area-level governance.",
          areas: "Areas",
          regions: "Regions",
          committees: "Committees",
          scopeType: "Scope type",
          dirTitle: "Area directory",
          dirDesc: "Each area carries a parent region and may host multiple committees and governed assignments.",
        };

  if (!canAccessPortalHref(user, "/portal/admin/areas")) {
    return (
      <GovernanceSection title={copy.restrictedTitle} description={copy.restrictedDescription} />
    );
  }

  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    [regions, areas, committees] = await Promise.all([
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load area governance data from the backend.";
  }

  if (errorMessage) {
    return <GovernanceSection title={copy.loadTitle} description={errorMessage} />;
  }

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
        primaryAction={<CreateAreaDialog regions={regions} />}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy.areas} value={areas.length} hint={locale === "ar" ? "سجلات المناطق الفرعية النشطة وغير النشطة في المنصة." : "Active and inactive area records in the platform."} />
        <GovernanceMetricCard label={copy.regions} value={regions.length} hint={locale === "ar" ? "المناطق الأم المتاحة حاليًا للربط." : "Parent regions currently available for mapping."} />
        <GovernanceMetricCard label={copy.committees} value={committees.filter((committee) => committee.areaId).length} hint={locale === "ar" ? "اللجان المرتبطة بالمناطق الفرعية والمثبتة حاليًا." : "Area-linked committees currently attached to areas."} />
        <GovernanceMetricCard label={copy.scopeType} value={locale === "ar" ? "تشغيلي" : "Operational"} hint={locale === "ar" ? "نطاق المنطقة الفرعية أساسي لصلاحيات اجتماعات التعافي." : "Area scope is central to recovery meeting authorization."} />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy.dirTitle}
        description={copy.dirDesc}
      >
        <AreasDirectoryTable areas={areas} regions={regions} committees={committees} />
      </GovernanceSection>
    </div>
  );
}
