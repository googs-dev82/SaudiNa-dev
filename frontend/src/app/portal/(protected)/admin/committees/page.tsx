import {
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import {
  PortalAdminAssignment,
  PortalAdminUser,
  PortalApiError,
  PortalArea,
  PortalCommittee,
  PortalRegion,
  getPortalAreas,
  getPortalAssignments,
  getPortalCommittees,
  getPortalRegions,
  getPortalUsers,
} from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { CreateCommitteeDialog } from "@/features/portal/components/create-committee-dialog";
import { CommitteesDirectoryTable } from "@/features/portal/components/committees-directory-table";

export default async function PortalAdminCommitteesPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "يمكن للمشرفين العامين فقط إدارة اللجان.",
          loadTitle: "تعذّر تحميل اللجان",
          eyebrow: "الحوكمة",
          title: "اللجان",
          description: "تشكل اللجان الحوكمة الداخلية ومسؤولية اعتماد القرارات. افصل بوضوح بين اللجان الإقليمية ولجان المناطق.",
          committees: "اللجان",
          regional: "إقليمية",
          area: "منطقة",
          managed: "تحت الإدارة",
          directoryTitle: "دليل اللجان",
          directoryDesc: "توضح رؤية المدير وعدد الأعضاء من خلال التعيينات المرتبطة باللجنة.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription: "Only super administrators can manage committees.",
          loadTitle: "Unable to load committees",
          eyebrow: "Governance",
          title: "Committees",
          description: "Committees shape internal governance and maker-checker responsibility.",
          committees: "Committees",
          regional: "Regional",
          area: "Area",
          managed: "Managed",
          directoryTitle: "Committee directory",
          directoryDesc: "Manager visibility and member counts are derived from committee-scoped assignments.",
        };

  if (!canAccessPortalHref(user, "/portal/admin/committees")) {
    return (
      <GovernanceSection title={copy.restrictedTitle} description={copy.restrictedDescription} />
    );
  }

  let committees: PortalCommittee[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let assignments: PortalAdminAssignment[] = [];
  let users: PortalAdminUser[] = [];
  let errorMessage: string | null = null;

  try {
    [committees, regions, areas, assignments, users] = await Promise.all([
      getPortalCommittees(),
      getPortalRegions(),
      getPortalAreas(),
      getPortalAssignments(),
      getPortalUsers(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load committee governance data from the backend.";
  }

  if (errorMessage) {
    return <GovernanceSection title={copy.loadTitle} description={errorMessage} />;
  }

  const regionalCommittees = committees.filter((committee) => committee.level === "REGIONAL");
  const areaCommittees = committees.filter((committee) => committee.level === "AREA");

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
        primaryAction={<CreateCommitteeDialog regions={regions} areas={areas} />}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy.committees} value={committees.length} hint={locale === "ar" ? "جميع اللجان الإقليمية ولجان المناطق الحالية في الهيكل." : "All regional and area committees currently in the structure."} />
        <GovernanceMetricCard label={copy.regional} value={regionalCommittees.length} hint={locale === "ar" ? "اللجان المرتكزة فقط على منطقة." : "Committees anchored only to a region."} />
        <GovernanceMetricCard label={copy.area} value={areaCommittees.length} hint={locale === "ar" ? "اللجان المرتبطة بمنطقة محددة." : "Committees attached to a specific area."} />
        <GovernanceMetricCard label={copy.managed} value={assignments.filter((assignment) => assignment.roleCode === "COMMITTEE_MANAGER" && assignment.active).length} hint={locale === "ar" ? "تعيينات مدير لجنة النشطة حاليًا." : "Active committee-manager assignments in effect."} />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy.directoryTitle}
        description={copy.directoryDesc}
      >
        <CommitteesDirectoryTable
          committees={committees}
          regions={regions}
          areas={areas}
          assignments={assignments}
          users={users}
        />
      </GovernanceSection>
    </div>
  );
}
