import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  GovernanceEmptyState,
  GovernanceMetaGrid,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
  GovernanceTable,
  GovernanceRow,
  GovernanceCell,
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
import {
  formatDateLabel,
  getAssignmentScopeLabel,
  getRoleDefinition,
} from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import type { PortalRole } from "@/types/portal";

export default async function PortalAdminRoleDetailPage({
  params,
}: {
  params: Promise<{ roleCode: string }>;
}) {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const { roleCode } = await params;
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيّد",
          restrictedDesc: "يمكن للمشرفين العامين فقط مراجعة كتالوج الأدوار في المنصة.",
          restrictedEmpty: "هذا العرض المرجعي محجوز للمشرفين العامين.",
          loadTitle: "تعذر تحميل تفاصيل الدور",
          loadEmpty: "تعذر جلب بيانات هذا الدور من الخلفية.",
          noAssignmentsTitle: "لا توجد تعيينات بعد",
          noAssignmentsDesc: "الدور معرّف في المنصة لكنه غير مسند لأي مستخدم حاليًا.",
          roleEyebrow: "دور حوكمي",
          activeAssignments: "التعيينات الفعالة",
          assignedUsers: "المستخدمون المسندون",
          posture: "الوضع الحوكمي",
          scopeType: "نوع النطاق",
          scopeHint: "النطاق الذي يجب إقران الدور به ليصبح فعالًا.",
          activeHint: "التعيينات الحية الحالية التي تستخدم هذا الدور.",
          usersHint: "عدد المستخدمين الفريدين الذين يحملون هذا الدور حاليًا.",
          postureHint: "هذا الدور معرف مسبقًا ومفروض من الخلفية، وليس قابلاً للإنشاء من المشغل.",
          activeAssignmentsTitle: "التعيينات الفعالة",
          activeAssignmentsDesc: "كل تعيين حي يستخدم هذا الدور عبر أي نطاق.",
          roleDefinition: "تعريف الدور",
          guidanceTitle: "إرشادات تشغيلية",
          guidanceDesc:
            "استخدم هذا الدور فقط عندما يتطابق النطاق والمسؤوليات التشغيلية مع نموذج الحوكمة في الخلفية.",
          guidanceLine1:
            "لا يمكن إنشاء هذا الدور أو تعطيله أو حذفه من البوابة لأن نظام التفويض يعتمد على كتالوج أدوار ثابت.",
          guidanceLine2: "لتغيير الصلاحيات، عدّل التعيينات وابقِ اقتران الدور بالنطاق واضحًا.",
          roleCode: "رمز الدور",
          governanceNote: "ملاحظة حوكمية",
          lifecycle: "دورة الحياة",
          predefined: "مُعرّف مسبقًا ومفروض من الخلفية",
          backLabel: "العودة إلى الأدوار",
          userUnknown: "مستخدم غير معروف",
          scopeUnknown: "غير معروف",
          immediate: "فوري",
          active: "نشط",
          inactive: "غير نشط",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDesc: "Only super administrators can review the platform role catalog.",
          restrictedEmpty: "This role reference view is reserved for super administrators.",
          loadTitle: "Unable to load role details",
          loadEmpty: "The backend data needed for this role reference page could not be loaded.",
          noAssignmentsTitle: "No assignments yet",
          noAssignmentsDesc: "This role is defined in the platform, but it is not currently assigned to any user.",
          roleEyebrow: "Governance Role",
          activeAssignments: "Active assignments",
          assignedUsers: "Assigned users",
          posture: "Governance posture",
          scopeType: "Scope type",
          scopeHint: "The scope this role must be paired with to become active.",
          activeHint: "Current live assignments using this role.",
          usersHint: "Distinct users who currently hold this role.",
          postureHint: "This role is platform-defined and backend-enforced, not operator-created.",
          activeAssignmentsTitle: "Active assignments",
          activeAssignmentsDesc: "Every live assignment currently using this role across global, regional, area, or committee scope.",
          roleDefinition: "Role definition",
          guidanceTitle: "Operational guidance",
          guidanceDesc:
            "Use this role only where the scope and workflow duties match the backend governance model.",
          guidanceLine1:
            "This role cannot currently be created, deactivated, or deleted from the portal because the authorization system depends on a fixed role catalog.",
          guidanceLine2: "To change access, manage assignments instead and keep the role-to-scope pairing explicit.",
          roleCode: "Role code",
          governanceNote: "Governance note",
          lifecycle: "Lifecycle",
          predefined: "Predefined and backend enforced",
          backLabel: "Back to roles",
          userUnknown: "Unknown user",
          scopeUnknown: "Unknown",
          immediate: "Immediate",
          active: "Active",
          inactive: "Inactive",
        };

  if (!canAccessPortalHref(user, "/portal/admin/roles")) {
    return (
      <GovernanceSection
        title={copy.restrictedTitle}
        description={copy.restrictedDesc}
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "ليس لديك صلاحية" : "You do not have permission"}
          description={copy.restrictedEmpty}
        />
      </GovernanceSection>
    );
  }

  const role = getRoleDefinition(roleCode);

  if (!role) {
    notFound();
  }

  let assignments: PortalAdminAssignment[] = [];
  let users: PortalAdminUser[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    [assignments, users, regions, areas, committees] = await Promise.all([
      getPortalAssignments(),
      getPortalUsers(),
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load role governance details from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection title={copy.loadTitle} description={errorMessage}>
        <GovernanceEmptyState
          title={locale === "ar" ? "تفاصيل الدور غير متاحة" : "Role details are unavailable"}
          description={copy.loadEmpty}
        />
      </GovernanceSection>
    );
  }

  const roleAssignments = assignments.filter((assignment) => assignment.roleCode === role.code);
  const activeAssignments = roleAssignments.filter((assignment) => assignment.active);
  const assignedUsers = Array.from(new Set(activeAssignments.map((assignment) => assignment.userId)));

  return (
    <div className="space-y-8 pb-12">
      <GovernancePageHeader
        eyebrow={copy.roleEyebrow}
        title={role.label}
        description={role.description}
        breadcrumb={["Portal", "Governance", "Roles", role.label]}
        actions={
          <ButtonLink href="/portal/admin/roles" label={copy.backLabel} />
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={copy.scopeType}
          value={role.scopeType}
          hint={copy.scopeHint}
        />
        <GovernanceMetricCard
          label={copy.activeAssignments}
          value={activeAssignments.length}
          hint={copy.activeHint}
        />
        <GovernanceMetricCard
          label={copy.assignedUsers}
          value={assignedUsers.length}
          hint={copy.usersHint}
        />
        <GovernanceMetricCard
          label={copy.posture}
          value={locale === "ar" ? "مُعرّف مسبقًا" : "Predefined"}
          hint={copy.postureHint}
        />
      </GovernanceMetricGrid>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-8">
          <GovernanceSection
            title={copy.activeAssignmentsTitle}
            description={copy.activeAssignmentsDesc}
          >
            <GovernanceTable
              columns={locale === "ar" ? ["المستخدم", "النطاق", "يبدأ من", "الحالة"] : ["User", "Scope", "Active from", "Status"]}
              emptyTitle={copy.noAssignmentsTitle}
              emptyDescription={copy.noAssignmentsDesc}
              rows={roleAssignments.map((assignment) => {
                const assignmentUser = users.find((entry) => entry.id === assignment.userId);
                return (
                  <GovernanceRow key={assignment.id}>
                    <GovernanceCell>
                      <Link href={`/portal/admin/users/${assignment.userId}`} className="font-medium text-primary hover:underline">
                        {assignmentUser?.displayName ?? copy.userUnknown}
                      </Link>
                      <p className="text-xs text-muted-foreground">{assignmentUser?.email ?? assignment.userId}</p>
                    </GovernanceCell>
                    <GovernanceCell>
                      {getAssignmentScopeLabel(assignment, locale, { regions, areas, committees })}
                    </GovernanceCell>
                    <GovernanceCell>
                      {assignment.activeFrom ? formatDateLabel(assignment.activeFrom, locale) : copy.immediate}
                    </GovernanceCell>
                    <GovernanceCell>
                      <Badge variant={assignment.active ? "default" : "secondary"}>
                        {assignment.active ? copy.active : copy.inactive}
                      </Badge>
                    </GovernanceCell>
                  </GovernanceRow>
                );
              })}
            />
          </GovernanceSection>
        </div>

        <div className="space-y-8">
          <GovernanceSection title={copy.roleDefinition}>
            <GovernanceMetaGrid
              columns={1}
              items={[
                { label: copy.roleCode, value: <Badge variant="outline" className="font-mono">{role.code}</Badge> },
                { label: copy.scopeType, value: role.scopeType },
                { label: copy.governanceNote, value: role.governanceNote },
                { label: copy.lifecycle, value: copy.predefined },
              ]}
            />
          </GovernanceSection>

          <GovernanceSection
            title={copy.guidanceTitle}
            description={copy.guidanceDesc}
          >
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                {copy.guidanceLine1}
              </p>
              <p>
                {copy.guidanceLine2}
              </p>
            </div>
          </GovernanceSection>
        </div>
      </div>
    </div>
  );
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20"
    >
      {label}
    </Link>
  );
}
