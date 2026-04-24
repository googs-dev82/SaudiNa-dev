import {
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import {
  PortalApiError,
  PortalArea,
  PortalRegion,
  getPortalAreas,
  getPortalRegions,
} from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { CreateRegionDialog } from "@/features/portal/components/create-region-dialog";
import { RegionsDirectoryTable } from "@/features/portal/components/regions-directory-table";

export default async function PortalAdminRegionsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "يمكن للمشرفين العامين فقط إدارة الهيكل الإقليمي.",
          loadTitle: "تعذّر تحميل المناطق",
          eyebrow: "الحوكمة",
          title: "المناطق",
          description: "تعرف المناطق أعلى جغرافيا تنظيمية في النموذج التشغيلي وتؤسس لنطاق المناطق الفرعية.",
          regions: "المناطق",
          active: "نشطة",
          areas: "المناطق الفرعية",
          hierarchy: "الهيكل",
          dirTitle: "الدليل الإقليمي",
          dirDesc: "قائمة هادئة وقابلة للتدقيق للمناطق وبصمتها من المناطق الفرعية.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription: "Only super administrators can manage regional structure.",
          loadTitle: "Unable to load regions",
          eyebrow: "Governance",
          title: "Regions",
          description: "Regions define the highest structural geography in the operational model and anchor downstream area scope.",
          regions: "Regions",
          active: "Active",
          areas: "Areas",
          hierarchy: "Hierarchy",
          dirTitle: "Regional directory",
          dirDesc: "A quiet, auditable list of regions and their downstream area footprint.",
        };

  if (!canAccessPortalHref(user, "/portal/admin/regions")) {
    return <GovernanceSection title={copy.restrictedTitle} description={copy.restrictedDescription} />;
  }

  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let errorMessage: string | null = null;

  try {
    [regions, areas] = await Promise.all([getPortalRegions(), getPortalAreas()]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load regional data from the backend.";
  }

  if (errorMessage) {
    return <GovernanceSection title={copy.loadTitle} description={errorMessage} />;
  }

  const activeRegions = regions.filter((region) => region.isActive).length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
        primaryAction={<CreateRegionDialog />}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={copy.regions}
          value={regions.length}
          hint="Regional records currently available for operational scope assignment."
        />
        <GovernanceMetricCard
          label={copy.active}
          value={activeRegions}
          hint="Regional records currently enabled for downstream usage."
        />
        <GovernanceMetricCard
          label={copy.areas}
          value={areas.length}
          hint="Child area records already attached to the regional hierarchy."
        />
        <GovernanceMetricCard
          label={copy.hierarchy}
          value="Stable"
          hint="Use consistent codes to preserve reporting and assignment continuity."
        />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy.dirTitle}
        description={copy.dirDesc}
      >
        <RegionsDirectoryTable regions={regions} areas={areas} />
      </GovernanceSection>
    </div>
  );
}
