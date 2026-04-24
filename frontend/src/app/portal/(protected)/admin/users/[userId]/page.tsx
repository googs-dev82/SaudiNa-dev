import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssignmentForm } from "@/features/portal/components/assignment-form";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import {
  GovernanceEmptyState,
  GovernanceMetaGrid,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernancePill,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import {
  PortalAdminAssignment,
  PortalApiError,
  PortalArea,
  PortalCommittee,
  PortalGovernanceUser,
  PortalRegion,
  getPortalAreas,
  getPortalAssignments,
  getPortalCommittees,
  getPortalRegions,
  getPortalUser,
} from "@/features/portal/lib/api";
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatRoleLabel,
  getUserRoleLabels,
  getUserScopeSummary,
} from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import {
  activatePortalUserAction,
  deactivatePortalUserAction,
  deletePortalUserAction,
  updatePortalUserAction,
} from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

function AccessRestricted() {
  return (
    <GovernanceSection
      title="الوصول مقيّد"
      description="يمكن للمشرفين العامين فقط فتح مساحة حوكمة الهوية."
    >
      <GovernanceEmptyState
        title="ليس لديك صلاحية للوصول"
        description="هذا القسم محجوز للمشرفين العامين لأنه يؤثر على الهوية والصلاحيات والنطاق."
      />
    </GovernanceSection>
  );
}

export default async function PortalAdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const signedInUser = await requirePortalUser();
  const locale = await getPortalLocale(signedInUser);
  const { userId } = await params;
  const copy =
    locale === "ar"
      ? {
          accessTitle: "الوصول مقيّد",
          accessDesc: "يمكن للمشرفين العامين فقط فتح مساحة حوكمة الهوية.",
          accessEmpty: "هذا القسم محجوز للمشرفين العامين لأنه يؤثر على الهوية والصلاحيات والنطاق.",
          loadTitle: "تعذر تحميل المستخدم",
          loadDesc: "تعذر جلب تفاصيل حوكمة المستخدم من الخلفية.",
          loadEmpty: "لم تُرجع الخلفية تفاصيل هذا المستخدم.",
        }
      : {
          accessTitle: "Access restricted",
          accessDesc: "Only super administrators can open the identity governance area.",
          accessEmpty: "This module is reserved for super admins because it affects platform identity, operational scope, and authorization.",
          loadTitle: "Unable to load user",
          loadDesc: "We could not load the user governance details from the backend.",
          loadEmpty: "The backend did not return user governance details for this request.",
        };

  if (!canAccessPortalHref(signedInUser, "/portal/admin/users")) {
    return <AccessRestricted />;
  }

  let user: PortalGovernanceUser | null = null;
  let assignments: PortalAdminAssignment[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    [user, assignments, regions, areas, committees] = await Promise.all([
      getPortalUser(userId),
      getPortalAssignments(),
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load the user governance details from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection title={copy.loadTitle} description={errorMessage}>
        <GovernanceEmptyState
          title={locale === "ar" ? "سجل المستخدم غير متاح" : "The user record is unavailable"}
          description={copy.loadEmpty}
        />
      </GovernanceSection>
    );
  }

  if (!user) {
    notFound();
  }

  const userAssignments = assignments.filter((assignment) => assignment.userId === user.id);
  const roleLabels = getUserRoleLabels(user, assignments, locale);
  const scopeSummary = getUserScopeSummary(user, assignments, locale, {
    regions,
    areas,
    committees,
  });
  const protectedReferences =
    user._count.recovery_meetings +
    user._count.in_service_meetings_in_service_meetings_createdByIdTousers +
    user._count.in_service_meetings_in_service_meetings_approvedByIdTousers +
    user._count.reports_reports_createdByIdTousers +
    user._count.reports_reports_approvedByIdTousers;

  return (
    <div className="space-y-6" dir={locale}>
      <GovernancePageHeader
        eyebrow={locale === "ar" ? "الحوكمة" : "Governance"}
        title={user.displayName}
        description={
          locale === "ar"
            ? "تفاصيل الملف والتعيينات وضوابط دورة الحياة والمراجع التشغيلية المحكومة لهذا الحساب."
            : "Profile details, assignments, lifecycle controls, and governed operational references for this identity."
        }
        breadcrumb={locale === "ar" ? ["البوابة", "الحوكمة", "المستخدمون", user.displayName] : ["Portal", "Governance", "Users", user.displayName]}
      />

      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href="/portal/admin/users" />} variant="secondary">
          {locale === "ar" ? "العودة إلى المستخدمين" : "Back to users"}
        </Button>
        {user.status === "ACTIVE" ? (
          <PortalConfirmAction
            action={deactivatePortalUserAction}
                description={locale === "ar" ? "يحتفظ المستخدم المعطل بسجله الحوكمي لكنه يفقد الوصول التشغيلي حتى إعادة التفعيل." : "Deactivated users keep their governed history but lose operational access until reactivated."}
                fields={{ userId: user.id }}
                title={locale === "ar" ? "تعطيل هذا المستخدم؟" : "Deactivate this user?"}
                triggerLabel={locale === "ar" ? "تعطيل" : "Deactivate"}
                triggerVariant="outline"
              />
            ) : (
          <PortalConfirmAction
            action={activatePortalUserAction}
                description={locale === "ar" ? "إعادة التفعيل تعيد الوصول إلى البوابة وفق التعيينات الفعالة." : "Activating this user restores portal access according to their active assignments."}
                fields={{ userId: user.id }}
                title={locale === "ar" ? "تفعيل هذا المستخدم؟" : "Activate this user?"}
                triggerLabel={locale === "ar" ? "تفعيل" : "Activate"}
                triggerVariant="outline"
              />
            )}
        <PortalConfirmAction
          action={deletePortalUserAction}
          confirmVariant="destructive"
          description="Delete is only allowed when the user is not referenced by governed operational records. If protected records exist, the backend will stop this action."
          fields={{ userId: user.id }}
          title="Delete this user?"
          triggerLabel="Delete"
          triggerVariant="destructive"
        />
      </div>

      <GovernanceMetricGrid>
          <GovernanceMetricCard label={locale === "ar" ? "التعيينات" : "Assignments"} value={userAssignments.length} hint={locale === "ar" ? "جميع التعيينات المرتبطة بهذا المستخدم." : "All assignments currently attached to this user."} />
        <GovernanceMetricCard label={locale === "ar" ? "السجلات المحمية" : "Protected records"} value={protectedReferences} hint={locale === "ar" ? "السجلات التشغيلية التي تمنع الحذف النهائي." : "Operational records that prevent hard deletion."} />
        <GovernanceMetricCard label={locale === "ar" ? "الإنشاء" : "Created"} value={formatDateLabel(user.createdAt, locale)} hint={locale === "ar" ? "وقت دخول المستخدم إلى المنصة المحكومة." : "When this user entered the governed platform."} />
        <GovernanceMetricCard label={locale === "ar" ? "آخر تسجيل دخول" : "Last login"} value={formatDateTimeLabel(user.lastLoginAt, locale)} hint={locale === "ar" ? "آخر وقت تسجيل دخول من مزود الهوية." : "Most recent sign-in timestamp from the identity provider."} />
      </GovernanceMetricGrid>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          <GovernanceSection
            title={locale === "ar" ? "الملف" : "Profile"}
            description={locale === "ar" ? "بيانات الهوية الأساسية وملخص مستوى الوصول لهذا الحساب." : "Core identity data and high-level access posture for this account."}
          >
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <GovernancePill className="bg-white/80">{user.status}</GovernancePill>
                <GovernancePill className="bg-accent/70 text-accent-foreground">
                  {user.provider}
                </GovernancePill>
                {roleLabels.map((role) => (
                  <Badge key={role}>{role}</Badge>
                ))}
              </div>

              <GovernanceMetaGrid
                items={[
                  { label: locale === "ar" ? "البريد الإلكتروني" : "Email", value: user.email },
                  { label: locale === "ar" ? "اسم العرض" : "Display name", value: user.displayName },
                  { label: locale === "ar" ? "الإنشاء" : "Created", value: formatDateLabel(user.createdAt, locale) },
                  { label: locale === "ar" ? "التحديث" : "Updated", value: formatDateLabel(user.updatedAt, locale) },
                  { label: locale === "ar" ? "آخر تسجيل دخول" : "Last login", value: formatDateTimeLabel(user.lastLoginAt, locale) },
                  { label: locale === "ar" ? "التعيينات" : "Assignments", value: userAssignments.length },
                ]}
              />

              <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
                  {locale === "ar" ? "النطاقات الفعالة" : "Active scope footprint"}
                  </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scopeSummary.length ? (
                    scopeSummary.map((scope, index) => (
                      <GovernancePill key={`${scope}-${index}`}>{scope}</GovernancePill>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar" ? "لا توجد تعيينات نطاق فعالة." : "No active scope assignments."}
                    </span>
                  )}
                </div>
              </div>

              <form
                action={updatePortalUserAction}
                className="grid gap-3 rounded-[1.35rem] bg-white/90 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
              >
                <input name="userId" type="hidden" value={user.id} />
                <Input defaultValue={user.displayName} name="displayName" required />
                <select
                  className="h-12 rounded-xl border border-border/30 bg-white px-4 text-sm text-foreground shadow-sm"
                  defaultValue={user.status}
                  name="status"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <Button className="w-full md:w-auto" type="submit">
                  {locale === "ar" ? "حفظ المستخدم" : "Save user"}
                </Button>
              </form>
            </div>
          </GovernanceSection>

          <GovernanceSection
            title="Assignments"
            description="Edit role, scope, lifecycle dates, and assignment status in place."
          >
            <div className="space-y-4">
              {userAssignments.length ? (
                userAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-[1.35rem] bg-white/88 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge>{formatRoleLabel(assignment.roleCode)}</Badge>
                      <Badge className="bg-accent/70 text-accent-foreground">
                        {assignment.scopeType}
                      </Badge>
                      <Badge className="bg-muted text-foreground">
                        {assignment.active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                    <AssignmentForm
                      mode="update"
                      assignment={assignment}
                      userId={user.id}
                      regions={regions}
                      areas={areas}
                      committees={committees}
                    />
                  </div>
                ))
              ) : (
                <GovernanceEmptyState
                  title="No assignments yet"
                  description="Create the first assignment to attach a governed role and scope to this identity."
                />
              )}
            </div>
          </GovernanceSection>
        </div>

        <div className="space-y-6">
          <GovernanceSection
            title="Operational references"
            description="These counts determine whether the user can be safely deleted."
          >
            <GovernanceMetaGrid
              items={[
                { label: "Recovery meetings created", value: user._count.recovery_meetings },
                {
                  label: "In-service meetings created",
                  value: user._count.in_service_meetings_in_service_meetings_createdByIdTousers,
                },
                {
                  label: "In-service approvals",
                  value: user._count.in_service_meetings_in_service_meetings_approvedByIdTousers,
                },
                {
                  label: "Reports created",
                  value: user._count.reports_reports_createdByIdTousers,
                },
                {
                  label: "Report approvals",
                  value: user._count.reports_reports_approvedByIdTousers,
                },
              ]}
            />
            <p className="text-sm leading-7 text-muted-foreground">
              If any protected record count is above zero, the backend will reject hard delete and require deactivation instead.
            </p>
          </GovernanceSection>

          <GovernanceSection
            title="Add assignment"
            description="Create a new governed role assignment directly from the user details page."
          >
            <AssignmentForm
              mode="create"
              users={[user]}
              userId={user.id}
              regions={regions}
              areas={areas}
              committees={committees}
            />
          </GovernanceSection>
        </div>
      </div>
    </div>
  );
}
