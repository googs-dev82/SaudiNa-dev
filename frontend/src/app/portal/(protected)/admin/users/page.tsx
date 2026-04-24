import Link from "next/link";
import { UserPlus, Users, UserCheck, UserX, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GovernanceEmptyState,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import {
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
import { createPortalUserAction } from "@/features/portal/lib/mutations";
import { requirePortalUser } from "@/features/portal/lib/session";
import { UsersDirectoryTable } from "@/features/users/components/users-directory-table";
import { UsersFilters } from "@/features/users/components/users-filters";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import {
  buildUsersDirectoryEntries,
  filterUsersDirectoryEntries,
  getUsersRoleOptions,
} from "@/features/users/lib/users-listing";
import { getPortalLocale } from "@/features/portal/lib/session";

const identityProviders = ["GOOGLE", "ZOHO", "INTERNAL"] as const;

function AccessRestricted() {
  // locale resolved inside page
  return (
    <GovernanceSection
      title="Access restricted"
      description="Only super administrators can open the identity governance area."
    >
      <GovernanceEmptyState
        title="You do not currently have access"
        description="This module is reserved for super admins because it affects platform identity, operational scope, and authorization."
      />
    </GovernanceSection>
  );
}

export default async function PortalAdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    role?: string;
  }>;
}) {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const params = searchParams ? await searchParams : undefined;
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDesc: "يمكن للمشرفين العامين فقط فتح مساحة حوكمة الهوية.",
          restrictedEmptyTitle: "لا يمكنك الوصول حاليًا",
          restrictedEmptyDesc: "هذه الوحدة مخصصة للمشرف العام لأنها تؤثر على الهوية والنطاق والصلاحيات.",
          eyebrow: "الحوكمة",
          title: "المستخدمون",
          description: "إدارة هويات المنصة والحسابات المرتبطة بالمزوّد وحالة الوصول الخاضع للحوكمة.",
          totalUsers: "إجمالي المستخدمين",
          activeAccounts: "الحسابات النشطة",
          governedAssignments: "التعيينات الخاضعة للحوكمة",
          inactive: "غير نشط",
          userDirectory: "دليل المستخدمين",
          userDirectoryDesc: "استخدم السجل للبحث والتصفية والانتقال إلى تفاصيل المستخدم.",
          noUsersYet: "لا يوجد مستخدمون بعد",
          noMatches: "لا يوجد مستخدمون يطابقون هذه المرشحات",
          firstUser: "أنشئ أول هوية داخلية لبدء تعيين الوصول المنظم.",
          changeFilters: "جرّب كلمة بحث أو حالة أو دورًا مختلفًا.",
          loadTitle: "تعذّر تحميل المستخدمين",
          loadDesc: "لم نتمكن من تحميل بيانات الحوكمة الخاصة بالمستخدمين من الواجهة الخلفية.",
          loadEmptyTitle: "بيانات الهوية غير متاحة",
          loadEmptyDesc: "لم تُرجع واجهة البرمجة سجل المستخدمين. حاول مرة أخرى عندما تصبح الخدمة متاحة.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDesc: "Only super administrators can open the identity governance area.",
          restrictedEmptyTitle: "You do not currently have access",
          restrictedEmptyDesc: "This module is reserved for super admins because it affects platform identity, operational scope, and authorization.",
          eyebrow: "Governance",
          title: "Users",
          description: "Manage internal identities, provider-linked accounts, and governed access posture.",
          totalUsers: "Total users",
          activeAccounts: "Active accounts",
          governedAssignments: "Governed assignments",
          inactive: "Inactive",
          userDirectory: "User directory",
          userDirectoryDesc: "Use the register to search, filter, and navigate into user details. Daily governance work starts here.",
          noUsersYet: "No users yet",
          noMatches: "No users match these filters",
          firstUser: "Create the first internal identity to begin assigning governed access.",
          changeFilters: "Try a different search term, status, or role filter.",
          loadTitle: "Unable to load users",
          loadDesc: "We could not load user governance data from the backend.",
          loadEmptyTitle: "Identity data is unavailable",
          loadEmptyDesc: "The backend API did not return the user registry. Try again once the service is reachable.",
        };

  if (!canAccessPortalHref(user, "/portal/admin/users")) {
    return (
      <GovernanceSection title={copy.restrictedTitle} description={copy.restrictedDesc}>
        <GovernanceEmptyState title={copy.restrictedEmptyTitle} description={copy.restrictedEmptyDesc} />
      </GovernanceSection>
    );
  }

  let users: PortalAdminUser[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    const assignmentsPromise = getPortalAssignments();
    [users, regions, areas, committees] = await Promise.all([
      getPortalUsers(),
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees(),
    ]);
    const assignments = await assignmentsPromise;

    const query = params?.q?.trim().toLowerCase() ?? "";
    const statusFilter = params?.status ?? "ALL";
    const roleFilter = params?.role ?? "ALL";
    const directoryEntries = buildUsersDirectoryEntries(users, {
      assignments,
      regions,
      areas,
      committees,
    });
    const filteredUsers = filterUsersDirectoryEntries(directoryEntries, {
      query,
      status: statusFilter,
      role: roleFilter,
    });
    const roleOptions = getUsersRoleOptions(assignments);
    const activeUsers = users.filter((entry) => entry.status === "ACTIVE").length;
    const usersWithAssignments = directoryEntries.filter((entry) => entry.assignmentCount > 0).length;
    const inactiveUsers = users.length - activeUsers;

    return (
      <div className="space-y-6">
        <GovernancePageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
          primaryAction={<CreateUserDialog regions={regions} areas={areas} committees={committees} />}
        />

        <GovernanceMetricGrid>
          <GovernanceMetricCard
            label={copy.totalUsers}
            value={users.length}
            hint=""
            icon={<Users className="size-4" />}
            trend={{ value: "+20.1%", label: "from last month", positive: true }}
          />
          <GovernanceMetricCard
            label={copy.activeAccounts}
            value={activeUsers}
            hint=""
            icon={<UserCheck className="size-4" />}
            trend={{ value: "+12%", label: "from last month", positive: true }}
          />
          <GovernanceMetricCard
            label={copy.governedAssignments}
            value={usersWithAssignments}
            hint=""
            icon={<UserPlus className="size-4" />}
            trend={{ value: "+4", label: "new this week", positive: true }}
          />
          <GovernanceMetricCard
            label={copy.inactive}
            value={inactiveUsers}
            hint=""
            icon={<UserX className="size-4" />}
            trend={{ value: "-2", label: "from last week", positive: true }}
          />
        </GovernanceMetricGrid>

        <GovernanceSection
          title={copy.userDirectory}
          description={copy.userDirectoryDesc}
        >
          <div className="space-y-4">
            <UsersFilters
              defaultQuery={params?.q ?? ""}
              defaultRole={params?.role ?? "ALL"}
              defaultStatus={params?.status ?? "ALL"}
              roleOptions={roleOptions}
              regions={regions}
              areas={areas}
              committees={committees}
            />

            {filteredUsers.length === 0 ? (
              <GovernanceEmptyState
                title={users.length === 0 ? copy.noUsersYet : copy.noMatches}
                description={
                  users.length === 0
                    ? copy.firstUser
                    : copy.changeFilters
                }
              />
            ) : (
              <UsersDirectoryTable entries={filteredUsers} />
            )}
          </div>
        </GovernanceSection>


      </div>
    );
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load user governance data from the backend.";
  }

  return (
    <GovernanceSection title={copy.loadTitle} description={errorMessage ?? copy.loadDesc}>
      <GovernanceEmptyState
        title={copy.loadEmptyTitle}
        description={copy.loadEmptyDesc}
      />
    </GovernanceSection>
  );
}
