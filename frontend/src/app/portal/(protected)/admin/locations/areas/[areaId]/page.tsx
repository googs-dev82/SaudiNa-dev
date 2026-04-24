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
  GovernanceCell
} from "@/features/portal/components/governance-ui";
import { 
  getPortalArea, 
  getPortalRegion,
  getPortalCommittees,
  getPortalAssignments,
  getPortalUsers,
  PortalApiError,
  PortalRegion,
  PortalArea,
  PortalCommittee,
  PortalAdminAssignment,
  PortalAdminUser,
} from "@/features/portal/lib/api";
import { formatDateLabel } from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { 
  activatePortalAreaAction, 
  deactivatePortalAreaAction, 
  deletePortalAreaAction 
} from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { CreateCommitteeDialog } from "@/features/portal/components/create-committee-dialog";
import { CreateAssignmentDialog } from "@/features/portal/components/create-assignment-dialog";
import { Layout, Users, Activity, Map } from "lucide-react";

export default async function PortalAdminAreaDetailPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  const signedInUser = await requirePortalUser();
  const locale = await getPortalLocale(signedInUser);
  const { areaId } = await params;

  if (!canAccessPortalHref(signedInUser, "/portal/admin/areas")) {
    return (
      <GovernanceSection title={locale === "ar" ? "الوصول مقيّد" : "Access restricted"}>
        <GovernanceEmptyState
          title={locale === "ar" ? "ليس لديك صلاحية" : "You do not have permission"}
          description={locale === "ar" ? "يمكن للمشرفين العامين فقط إدارة المناطق الحوكمية." : "Only super administrators can manage governance areas."}
        />
      </GovernanceSection>
    );
  }

  let area: PortalArea | null = null;
  let region: PortalRegion | null = null;
  let committees: PortalCommittee[] = [];
  let assignments: PortalAdminAssignment[] = [];
  let users: PortalAdminUser[] = [];
  let errorMessage: string | null = null;

  try {
    const fetchedArea = await getPortalArea(areaId);
    area = fetchedArea;
    
    const [fetchedRegion, allCommittees, allAssignments, allUsers] = await Promise.all([
      getPortalRegion(area.regionId),
      getPortalCommittees(),
      getPortalAssignments(),
      getPortalUsers(),
    ]);
    
    region = fetchedRegion;
    committees = allCommittees.filter(c => c.areaId === areaId);
    assignments = allAssignments.filter(
      (assignment) =>
        assignment.scopeType === "AREA" &&
        (assignment.scopeId === areaId || assignment.scopeCode === fetchedArea.code),
    );
    users = allUsers;
  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      notFound();
    }
    errorMessage = error instanceof Error ? error.message : "Failed to load area details.";
  }

  if (errorMessage || !area) {
    return (
      <GovernanceSection title="Error loading area">
        <GovernanceEmptyState
          title="Area not found"
          description={errorMessage || "The area you are looking for does not exist or could not be loaded."}
        />
      </GovernanceSection>
    );
  }

  return (
    <div className="space-y-8 pb-12" dir={locale}>
      <GovernancePageHeader
        eyebrow={locale === "ar" ? "منطقة حوكميّة" : "Governance Area"}
        title={area.nameEn}
        description={locale === "ar" ? `إدارة الهيكل الحوكمي واللجان داخل منطقة ${area.nameEn}.` : `Manage the governance structure and committees within the ${area.nameEn} area.`}
        breadcrumb={locale === "ar" ? ["الإدارة", "المواقع", "المناطق الفرعية", area.code] : ["Admin", "Locations", "Areas", area.code]}
        actions={
          <div className="flex gap-2">
            {area.isActive ? (
              <PortalConfirmAction
                action={deactivatePortalAreaAction}
                description={locale === "ar" ? "سيخفي التعطيل اللجان المرتبطة بها من الواجهة العامة." : "Deactivating this area will hide its committees from the public site."}
                fields={{ areaId: area.id }}
                title={locale === "ar" ? "تعطيل هذه المنطقة الفرعية؟" : "Deactivate Area?"}
                triggerLabel={locale === "ar" ? "تعطيل" : "Deactivate"}
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            ) : (
              <PortalConfirmAction
                action={activatePortalAreaAction}
                description={locale === "ar" ? "سيعيد التفعيل ظهور اللجان المرتبطة بها." : "Activating this area will restore visibility for its committees."}
                fields={{ areaId: area.id }}
                title={locale === "ar" ? "تفعيل هذه المنطقة الفرعية؟" : "Activate Area?"}
                triggerLabel={locale === "ar" ? "تفعيل" : "Activate"}
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            )}
            <PortalConfirmAction
              action={deletePortalAreaAction}
              confirmVariant="destructive"
              description={locale === "ar" ? "الحذف نهائي ولا يسمح إلا إذا لم تكن هناك لجان مرتبطة." : "Deleting an area is permanent. You can only delete areas with no dependent committees."}
              fields={{ areaId: area.id }}
              title={locale === "ar" ? "حذف هذه المنطقة الفرعية؟" : "Delete Area?"}
              triggerLabel={locale === "ar" ? "حذف" : "Delete"}
              triggerVariant="destructive"
            />
          </div>
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={locale === "ar" ? "الحالة" : "Status"}
          value={area.isActive ? (locale === "ar" ? "نشطة" : "Active") : (locale === "ar" ? "غير نشطة" : "Inactive")}
          hint={locale === "ar" ? "الحالة التشغيلية الحالية" : "Current operational status"}
          icon={<Activity className="size-4" />}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "المنطقة الأم" : "Region"}
          value={region?.nameEn ?? (locale === "ar" ? "غير معروفة" : "Unknown")}
          hint={locale === "ar" ? "المنطقة الحاضنة" : "Parent region"}
          icon={<Map className="size-4" />}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "اللجان" : "Committees"}
          value={committees.length}
          hint={locale === "ar" ? "اللجان داخل هذه المنطقة" : "Committees in this area"}
          icon={<Layout className="size-4" />}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "آخر تحديث" : "Last updated"}
          value={formatDateLabel(area.updatedAt, locale)}
          hint={locale === "ar" ? "آخر تغيير حوكمي مسجّل" : "Most recent governance change"}
          icon={<Users className="size-4" />}
        />
      </GovernanceMetricGrid>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <GovernanceSection 
            title={locale === "ar" ? "لجان المنطقة" : "Area Committees"} 
            description={locale === "ar" ? "عرض اللجان العاملة داخل هذه المنطقة." : "View committees operating within this area."}
            actions={
              <CreateCommitteeDialog
                regions={region ? [region] : []}
                areas={[area]}
                defaultLevel="AREA"
                defaultRegionId={area.regionId}
                defaultAreaId={area.id}
                lockScope
                triggerLabel={locale === "ar" ? "إضافة لجنة" : "Add committee"}
              />
            }
          >
            <GovernanceTable
              columns={["Name", "Type", "Status"]}
              emptyTitle={locale === "ar" ? "لا توجد لجان" : "No area committees"}
              emptyDescription={locale === "ar" ? "لا توجد لجان مرتبطة مباشرة بهذه المنطقة." : "This area has no committees assigned to it directly."}
              rows={committees.map(comm => (
                <GovernanceRow key={comm.id}>
                  <GovernanceCell>
                     <Link href={`/portal/admin/committees/${comm.id}`} className="font-medium text-primary hover:underline">
                      {comm.nameEn}
                    </Link>
                    <p className="text-xs text-muted-foreground" dir="rtl">{comm.nameAr}</p>
                  </GovernanceCell>
                  <GovernanceCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">COMMITTEE</Badge>
                  </GovernanceCell>
                  <GovernanceCell>
                    <Badge variant={comm.isActive ? "default" : "secondary"}>
                      {comm.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </GovernanceCell>
                </GovernanceRow>
              ))}
            />
          </GovernanceSection>

          <GovernanceSection
            title={locale === "ar" ? "أعضاء المنطقة" : "Area members"}
            description={locale === "ar" ? "إدارة التعيينات التي تنطبق مباشرة على هذه المنطقة." : "Govern assignments scoped directly to this area."}
            actions={
              <CreateAssignmentDialog
                users={users}
                regions={region ? [region] : []}
                areas={[area]}
                committees={committees}
                defaultScopeType="AREA"
                defaultScopeId={area.id}
                defaultScopeCode={area.code}
                lockScope
                triggerLabel={locale === "ar" ? "إضافة عضو" : "Add member"}
              />
            }
          >
            <GovernanceTable
              columns={["User", "Role", "From", "Status"]}
              emptyTitle={locale === "ar" ? "لا يوجد أعضاء" : "No area members"}
              emptyDescription={locale === "ar" ? "لا توجد بعد أي تعيينات حوكمة مباشرة لهذه المنطقة." : "This area does not yet have any direct governance assignments."}
              rows={assignments.map((assignment) => {
                const user = users.find((entry) => entry.id === assignment.userId);

                return (
                  <GovernanceRow key={assignment.id}>
                    <GovernanceCell>
                      <Link href={`/portal/admin/users/${assignment.userId}`} className="font-medium text-primary hover:underline">
                        {user?.displayName ?? "Unknown user"}
                      </Link>
                      <p className="text-xs text-muted-foreground">{user?.email ?? assignment.userId}</p>
                    </GovernanceCell>
                    <GovernanceCell>{assignment.roleCode}</GovernanceCell>
                    <GovernanceCell>{assignment.activeFrom ? formatDateLabel(assignment.activeFrom, locale) : (locale === "ar" ? "فوري" : "Immediate")}</GovernanceCell>
                    <GovernanceCell>
                      <Badge variant={assignment.active ? "default" : "secondary"}>
                        {assignment.active ? "Active" : "Inactive"}
                      </Badge>
                    </GovernanceCell>
                  </GovernanceRow>
                );
              })}
            />
          </GovernanceSection>
        </div>

        <div className="space-y-8">
          <GovernanceSection title={locale === "ar" ? "تفاصيل المنطقة الفرعية" : "Area details"}>
            <GovernanceMetaGrid
              columns={1}
              items={[
                { label: locale === "ar" ? "الرمز" : "Code", value: area.code },
                { label: locale === "ar" ? "المنطقة الأم" : "Parent Region", value: region ? <Link href={`/portal/admin/locations/regions/${region.id}`} className="text-primary hover:underline">{region.nameEn}</Link> : (locale === "ar" ? "لا يوجد" : "None") },
                { label: locale === "ar" ? "الاسم (AR)" : "Name (Ar)", value: <span dir="rtl">{area.nameAr}</span> },
                { label: locale === "ar" ? "تاريخ الإنشاء" : "Created", value: formatDateLabel(area.createdAt, locale) },
              ]}
            />
          </GovernanceSection>
        </div>
      </div>
    </div>
  );
}
