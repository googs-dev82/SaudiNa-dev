import { Badge } from "@/components/ui/badge";
import {
  GovernanceEmptyState,
  GovernanceMetaGrid,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernancePill,
  GovernanceSection,
  GovernanceTable,
  GovernanceRow,
  GovernanceCell,
} from "@/features/portal/components/governance-ui";
import {
  PortalArea,
  PortalApiError,
  PortalCommittee,
  PortalGovernanceUser,
  PortalRegion,
  getPortalAreas,
  getPortalCommittees,
  getPortalRegions,
  getPortalUser,
} from "@/features/portal/lib/api";
import { formatDateLabel, formatDateTimeLabel, formatRoleLabel, getAssignmentScopeLabel } from "@/features/portal/lib/governance";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import type { PortalAssignment } from "@/types/portal";

function statusTone(status: string) {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-800";
  if (status === "INACTIVE") return "bg-secondary/10 text-primary";
  return "bg-amber-100 text-amber-800";
}

function scopeTypeLabel(scopeType: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        GLOBAL: "شامل",
        REGION: "منطقة",
        AREA: "منطقة فرعية",
        COMMITTEE: "لجنة",
      }[scopeType] ?? scopeType
    );
  }

  return scopeType;
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function AssignmentRow({
  assignment,
  locale,
  regions,
  areas,
  committees,
}: {
  assignment: PortalAssignment;
  locale: "ar" | "en";
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
}) {
  const scopeLabel = getAssignmentScopeLabel(assignment, locale, {
    regions,
    areas,
    committees,
  });

  return (
    <GovernanceRow>
      <GovernanceCell className="whitespace-nowrap">
        <Badge variant="secondary" className="font-normal">
          {formatRoleLabel(assignment.roleCode, locale)}
        </Badge>
      </GovernanceCell>
      <GovernanceCell className="whitespace-nowrap text-muted-foreground">
        {scopeTypeLabel(assignment.scopeType, locale)}
      </GovernanceCell>
      <GovernanceCell className="max-w-[18rem]">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{scopeLabel}</p>
          <p className="text-xs text-muted-foreground">
            {assignment.scopeCode ?? assignment.scopeId ?? (locale === "ar" ? "غير مسند" : "Not assigned")}
          </p>
        </div>
      </GovernanceCell>
      <GovernanceCell className="whitespace-nowrap">
        <GovernancePill className={statusTone("ACTIVE")}>
          {locale === "ar" ? "نشط" : "Active"}
        </GovernancePill>
      </GovernanceCell>
    </GovernanceRow>
  );
}

export default async function PortalProfilePage() {
  const sessionUser = await requirePortalUser();
  const locale = await getPortalLocale(sessionUser);

  let governanceUser: PortalGovernanceUser | null = null;
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    [governanceUser, regions, areas, committees] = await Promise.all([
      getPortalUser(sessionUser.id),
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : locale === "ar"
          ? "تعذر تحميل تفاصيل الملف الشخصي من الخلفية."
          : "We could not load the profile details from the backend.";
  }

  if (errorMessage || !governanceUser) {
    return (
      <GovernanceSection
        title={locale === "ar" ? "تعذر تحميل الملف الشخصي" : "Unable to load profile"}
        description={errorMessage ?? (locale === "ar" ? "البيانات غير متاحة حاليًا." : "The requested data is unavailable right now.")}
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "سجل الهوية غير متاح" : "Identity record unavailable"}
          description={
            locale === "ar"
              ? "حاول إعادة تحميل الصفحة بعد عودة الخدمة."
              : "Try reloading the page once the backend service is available."
          }
        />
      </GovernanceSection>
    );
  }

  const assignments = sessionUser.assignments;
  const activeRoles = dedupe(sessionUser.roles.map((role) => formatRoleLabel(role, locale)));

  return (
    <div className="space-y-6" dir={locale}>
      <GovernancePageHeader
        eyebrow={locale === "ar" ? "الهوية" : "Identity"}
        title={sessionUser.displayName}
        description={
          locale === "ar"
            ? "الملف الشخصي المحكوم يعرض الهوية، الأدوار، التعيينات، والنطاق التشغيلي الحالي لهذا الحساب."
            : "The governed profile shows identity, roles, assignments, and the current operational footprint for this account."
        }
        breadcrumb={locale === "ar" ? ["البوابة", "مساحة العمل", "الملف الشخصي"] : ["Portal", "Workspace", "Profile"]}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={locale === "ar" ? "الأدوار" : "Roles"}
          value={activeRoles.length}
          hint={locale === "ar" ? "الأدوار الفعالة المرتبطة بهذا الحساب." : "Active roles attached to this account."}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "التعيينات" : "Assignments"}
          value={assignments.length}
          hint={locale === "ar" ? "جميع النطاقات المحكومة المرتبطة بالمستخدم." : "All governed scopes currently attached to the user."}
        />
      </GovernanceMetricGrid>

      <div className="space-y-6">
        <GovernanceSection
          title={locale === "ar" ? "الهوية والوصول" : "Identity and access"}
          description={
            locale === "ar"
              ? "البيانات الأساسية للحساب، مزود الهوية، والحالة المحكومة لهذا المستخدم."
              : "Core account data, identity provider, and the governed status for this user."
          }
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <GovernancePill className={statusTone(governanceUser.status)}>
                {governanceUser.status}
              </GovernancePill>
              <GovernancePill className="bg-accent/70 text-accent-foreground">
                {governanceUser.provider}
              </GovernancePill>
              <GovernancePill className="bg-white/90">
                {locale === "ar" ? "اللغة المفضلة" : "Preferred language"}: {sessionUser.preferredLanguage === "ar" ? "العربية" : "English"}
              </GovernancePill>
            </div>

            <GovernanceMetaGrid
              columns={3}
              items={[
                { label: locale === "ar" ? "البريد الإلكتروني" : "Email", value: governanceUser.email },
                { label: locale === "ar" ? "اسم العرض" : "Display name", value: governanceUser.displayName },
                { label: locale === "ar" ? "معرف المستخدم" : "User ID", value: governanceUser.id },
                { label: locale === "ar" ? "معرف المزود الخارجي" : "External subject", value: governanceUser.externalSubject ?? (locale === "ar" ? "غير متاح" : "Not available") },
                { label: locale === "ar" ? "تاريخ الإنشاء" : "Created", value: formatDateLabel(governanceUser.createdAt, locale) },
                { label: locale === "ar" ? "آخر تحديث" : "Updated", value: formatDateLabel(governanceUser.updatedAt, locale) },
                { label: locale === "ar" ? "آخر تسجيل دخول" : "Last login", value: formatDateTimeLabel(governanceUser.lastLoginAt, locale) },
                { label: locale === "ar" ? "الأدوار الفعالة" : "Active roles", value: activeRoles.length },
                { label: locale === "ar" ? "التعيينات الفعالة" : "Active assignments", value: assignments.length },
              ]}
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
                {locale === "ar" ? "الأدوار الحالية" : "Current roles"}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeRoles.length ? (
                  activeRoles.map((role) => (
                    <GovernancePill key={role}>{role}</GovernancePill>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {locale === "ar" ? "لا توجد أدوار فعالة." : "No active roles."}
                  </span>
                )}
              </div>
            </div>
          </div>
        </GovernanceSection>

        <GovernanceSection
          title={locale === "ar" ? "التعيينات" : "Assignments"}
          description={
            locale === "ar"
              ? "كل دور ونطاق حوكمي مرتبط بحسابك الحالي."
              : "Every governed role and scope currently attached to your account."
          }
        >
          {assignments.length ? (
            <GovernanceTable
              columns={[
                locale === "ar" ? "الدور" : "Role",
                locale === "ar" ? "نوع النطاق" : "Scope type",
                locale === "ar" ? "النطاق" : "Scope",
                locale === "ar" ? "الحالة" : "Status",
              ]}
              rows={assignments.map((assignment) => (
                <AssignmentRow
                  key={assignment.id}
                  assignment={assignment}
                  areas={areas}
                  committees={committees}
                  locale={locale}
                  regions={regions}
                />
              ))}
            />
          ) : (
            <GovernanceEmptyState
              title={locale === "ar" ? "لا توجد تعيينات" : "No assignments"}
              description={
                locale === "ar"
                  ? "لم يتم ربط أي نطاقات أو أدوار بهذا الحساب حتى الآن."
                  : "No governed roles or scopes are attached to this account yet."
              }
            />
          )}
        </GovernanceSection>
      </div>
    </div>
  );
}
