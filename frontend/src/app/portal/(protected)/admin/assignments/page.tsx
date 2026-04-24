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
import { CreateAssignmentDialog } from "@/features/portal/components/create-assignment-dialog";
import { AssignmentsDirectoryTable } from "@/features/portal/components/assignments-directory-table";

export default async function PortalAdminAssignmentsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "يمكن للمشرفين العامين فقط إدارة سجل التعيينات.",
          loadTitle: "تعذّر تحميل التعيينات",
          eyebrow: "الحوكمة",
          title: "التعيينات",
          description: "التعيينات هي قلب صلاحيات SaudNA. تربط المستخدم بالدور والنطاق مع تواريخ سريان واضحة.",
          assignments: "التعيينات",
          active: "نشطة",
          global: "عامة",
          committee: "لجنة",
          registerTitle: "سجل التعيينات",
          registerDesc: "عرض تشغيلي مضغوط يوضح من يملك أي دور وأين ينطبق ومتى يبدأ.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription: "Only super administrators can manage the platform assignment register.",
          loadTitle: "Unable to load assignments",
          eyebrow: "Governance",
          title: "Assignments",
          description: "Assignments are the core of SaudiNA authorization. They connect a user, a predefined role, and a concrete scope with explicit effective dates.",
          assignments: "Assignments",
          active: "Active",
          global: "Global",
          committee: "Committee",
          registerTitle: "Assignment register",
          registerDesc: "A compact operational view of who has which role, where it applies, and when it takes effect.",
        };

  if (!canAccessPortalHref(user, "/portal/admin/assignments")) {
    return (
      <GovernanceSection title={copy.restrictedTitle} description={copy.restrictedDescription} />
    );
  }

  let users: PortalAdminUser[] = [];
  let assignments: PortalAdminAssignment[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    [users, assignments, regions, areas, committees] = await Promise.all([
      getPortalUsers(),
      getPortalAssignments(),
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load assignment governance data from the backend.";
  }

  if (errorMessage) {
    return <GovernanceSection title={copy.loadTitle} description={errorMessage} />;
  }

  const activeAssignments = assignments.filter((assignment) => assignment.active).length;
  const globalAssignments = assignments.filter((assignment) => assignment.scopeType === "GLOBAL").length;
  const committeeAssignments = assignments.filter((assignment) => assignment.scopeType === "COMMITTEE").length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
        primaryAction={
          <CreateAssignmentDialog
            users={users}
            regions={regions}
            areas={areas}
            committees={committees}
          />
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={copy.assignments}
          value={assignments.length}
          hint={locale === "ar" ? "كل منح دور-نطاق مخزن حاليًا في المنصة." : "Every role-to-scope grant currently stored in the platform."}
        />
        <GovernanceMetricCard
          label={copy.active}
          value={activeAssignments}
          hint={locale === "ar" ? "التعيينات التي تشارك حاليًا في قرارات التفويض." : "Assignments that currently participate in authorization decisions."}
        />
        <GovernanceMetricCard
          label={copy.global}
          value={globalAssignments}
          hint={locale === "ar" ? "التعيينات التي تنطبق عمدًا على المنصة بأكملها." : "Assignments that intentionally apply across the entire platform."}
        />
        <GovernanceMetricCard
          label={copy.committee}
          value={committeeAssignments}
          hint={locale === "ar" ? "التعيينات المرتبطة باللجان لملكية سير العمل الخاضع للحوكمة." : "Assignments attached to committees for governed workflow ownership."}
        />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy.registerTitle}
        description={copy.registerDesc}
      >
        <AssignmentsDirectoryTable
          assignments={assignments}
          users={users}
          regions={regions}
          areas={areas}
          committees={committees}
        />
      </GovernanceSection>
    </div>
  );
}
