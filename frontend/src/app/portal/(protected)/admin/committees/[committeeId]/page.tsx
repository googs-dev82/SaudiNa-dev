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
  getPortalCommittee, 
  getPortalRegion,
  getPortalArea,
  getPortalAssignments,
  getPortalUsers,
  PortalApiError,
  PortalRegion,
  PortalArea,
  PortalCommittee,
  PortalAdminAssignment,
  PortalAdminUser
} from "@/features/portal/lib/api";
import { formatDateLabel, formatRoleLabel } from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { 
  activatePortalCommitteeAction, 
  deactivatePortalCommitteeAction, 
  deletePortalCommitteeAction 
} from "@/features/portal/lib/mutations";
import { requirePortalUser } from "@/features/portal/lib/session";
import { getPortalLocale } from "@/features/portal/lib/session";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { CreateAssignmentDialog } from "@/features/portal/components/create-assignment-dialog";
import { Users, Activity, Map, MapPin, Shield } from "lucide-react";

export default async function PortalAdminCommitteeDetailPage({
  params,
}: {
  params: Promise<{ committeeId: string }>;
}) {
  const signedInUser = await requirePortalUser();
  const locale = await getPortalLocale(signedInUser);
  const { committeeId } = await params;
  const copy =
    locale === "ar"
      ? {
          accessTitle: "الوصول مقيّد",
          accessEmpty: "يمكن للمشرفين العامين فقط إدارة اللجان الحوكمية.",
          loadTitle: "تعذر تحميل اللجنة",
          loadEmpty: "تعذر جلب تفاصيل اللجنة من الخلفية.",
          eyebrow: "لجنة",
          back: "العودة",
          deactivateTitle: "تعطيل اللجنة؟",
          deactivateDesc: "سيؤثر التعطيل على ظهور اللجنة وخدماتها المرتبطة.",
          activateTitle: "تفعيل اللجنة؟",
          activateDesc: "سيعيد التفعيل ظهور اللجنة.",
          deleteTitle: "حذف اللجنة؟",
          deleteDesc: "الحذف نهائي ولا يسمح إلا إذا لم تكن هناك تبعيات.",
          status: "الحالة",
          active: "نشطة",
          inactive: "غير نشطة",
          members: "الأعضاء",
          membersHint: "الأعضاء النشطون المسندون",
          level: "المستوى",
          levelHint: "مستوى التسلسل الحوكمـي",
          scope: "النطاق",
          scopeHint: "نطاق اللجنة",
          membersTitle: "عضوية اللجنة",
          membersDesc: "إدارة الأعضاء والأدوار داخل هذه اللجنة.",
          addMember: "إضافة عضو",
          noMembersTitle: "لا يوجد أعضاء",
          noMembersDesc: "لا توجد حالياً أي تعيينات مستخدمين لهذه اللجنة.",
          detailsTitle: "تفاصيل اللجنة",
          code: "الرمز",
          levelLabel: "المستوى",
          regionLabel: "المنطقة الأم",
          areaLabel: "المنطقة الفرعية الأم",
          nameAr: "الاسم (AR)",
          created: "تاريخ الإنشاء",
        }
      : {
          accessTitle: "Access restricted",
          accessEmpty: "Only super administrators can manage governance committees.",
          loadTitle: "Error loading committee",
          loadEmpty: "The committee you are looking for does not exist or could not be loaded.",
          eyebrow: "Committee",
          back: "Back",
          deactivateTitle: "Deactivate Committee?",
          deactivateDesc: "Deactivating this committee will revoke its visibility and potentially affected services.",
          activateTitle: "Activate Committee?",
          activateDesc: "Activating this committee will restore its visibility.",
          deleteTitle: "Delete Committee?",
          deleteDesc: "Deleting a committee is permanent. This action is only allowed if there are no active dependencies.",
          status: "Status",
          active: "Active",
          inactive: "Inactive",
          members: "Members",
          membersHint: "Active members assigned",
          level: "Level",
          levelHint: "Governance hierarchy level",
          scope: "Region/Area",
          scopeHint: "Scope of committee",
          membersTitle: "Committee Membership",
          membersDesc: "Manage members and roles within this committee.",
          addMember: "Add member",
          noMembersTitle: "No members assigned",
          noMembersDesc: "There are currently no users assigned to this committee.",
          detailsTitle: "Committee details",
          code: "Code",
          levelLabel: "Level",
          regionLabel: "Parent Region",
          areaLabel: "Parent Area",
          nameAr: "Name (Ar)",
          created: "Created",
        };

  if (!canAccessPortalHref(signedInUser, "/portal/admin/committees")) {
    return (
      <GovernanceSection title={copy.accessTitle}>
        <GovernanceEmptyState
          title={locale === "ar" ? "ليس لديك صلاحية" : "You do not have permission"}
          description={copy.accessEmpty}
        />
      </GovernanceSection>
    );
  }

  let committee: PortalCommittee | null = null;
  let region: PortalRegion | null = null;
  let area: PortalArea | null = null;
  let assignments: PortalAdminAssignment[] = [];
  let users: PortalAdminUser[] = [];
  let errorMessage: string | null = null;

  try {
    const fetchedComm = await getPortalCommittee(committeeId);
    committee = fetchedComm;
    
    const [fetchedRegion, fetchedArea, allAssignments, allUsers] = await Promise.all([
      getPortalRegion(committee.regionId),
      committee.areaId ? getPortalArea(committee.areaId) : Promise.resolve(null),
      getPortalAssignments(),
      getPortalUsers()
    ]);
    
    region = fetchedRegion;
    area = fetchedArea;
    assignments = allAssignments.filter(a => a.scopeId === committeeId || a.scopeCode === committee?.code);
    users = allUsers;
  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      notFound();
    }
    errorMessage = error instanceof Error ? error.message : "Failed to load committee details.";
  }

  if (errorMessage || !committee) {
    return (
      <GovernanceSection title={copy.loadTitle}>
        <GovernanceEmptyState
          title={locale === "ar" ? "اللجنة غير موجودة" : "Committee not found"}
          description={errorMessage || copy.loadEmpty}
        />
      </GovernanceSection>
    );
  }

  return (
    <div className="space-y-8 pb-12" dir={locale}>
      <GovernancePageHeader
        eyebrow={`${copy.eyebrow} • ${committee.level}`}
        title={committee.nameEn}
        description={committee.descriptionEn || (locale === "ar" ? `إدارة العضوية ودورة الحياة للجنة ${committee.nameEn}.` : `Manage the membership and lifecycle of the ${committee.nameEn} committee.`)}
        breadcrumb={locale === "ar" ? ["الإدارة", "اللجان", committee.code] : ["Admin", "Committees", committee.code]}
        actions={
          <div className="flex gap-2">
            {committee.isActive ? (
              <PortalConfirmAction
                action={deactivatePortalCommitteeAction}
                description={copy.deactivateDesc}
                fields={{ committeeId: committee.id }}
                title={copy.deactivateTitle}
                triggerLabel={locale === "ar" ? "تعطيل" : "Deactivate"}
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            ) : (
              <PortalConfirmAction
                action={activatePortalCommitteeAction}
                description={copy.activateDesc}
                fields={{ committeeId: committee.id }}
                title={copy.activateTitle}
                triggerLabel={locale === "ar" ? "تفعيل" : "Activate"}
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            )}
            <PortalConfirmAction
              action={deletePortalCommitteeAction}
              confirmVariant="destructive"
              description={copy.deleteDesc}
              fields={{ committeeId: committee.id }}
              title={copy.deleteTitle}
              triggerLabel={locale === "ar" ? "حذف" : "Delete"}
              triggerVariant="destructive"
            />
          </div>
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={copy.status}
          value={committee.isActive ? copy.active : copy.inactive}
          hint={locale === "ar" ? "الحالة التشغيلية الحالية" : "Current operational status"}
          icon={<Activity className="size-4" />}
        />
        <GovernanceMetricCard
          label={copy.members}
          value={assignments.length}
          hint={copy.membersHint}
          icon={<Users className="size-4" />}
        />
        <GovernanceMetricCard
          label={copy.level}
          value={committee.level}
          hint={copy.levelHint}
          icon={<Shield className="size-4" />}
        />
        <GovernanceMetricCard
          label={copy.scope}
          value={area ? area.nameEn : (region?.nameEn ?? "National")}
          hint={copy.scopeHint}
          icon={<MapPin className="size-4" />}
        />
      </GovernanceMetricGrid>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <GovernanceSection 
            title={copy.membersTitle} 
            description={copy.membersDesc}
            actions={
              <CreateAssignmentDialog
                users={users}
                regions={region ? [region] : []}
                areas={area ? [area] : []}
                committees={[committee]}
                defaultScopeType="COMMITTEE"
                defaultScopeId={committee.id}
                defaultScopeCode={committee.code}
                lockScope
                triggerLabel={copy.addMember}
              />
            }
          >
            <GovernanceTable
              columns={["Member", "Role", "Active From", "Status"]}
              emptyTitle={copy.noMembersTitle}
              emptyDescription={copy.noMembersDesc}
              rows={assignments.map(assign => {
                const user = users.find(u => u.id === assign.userId);
                return (
                  <GovernanceRow key={assign.id}>
                    <GovernanceCell>
                      <Link href={`/portal/admin/users/${assign.userId}`} className="font-medium text-primary hover:underline">
                        {user?.displayName || "Unknown User"}
                      </Link>
                      <p className="text-xs text-muted-foreground">{user?.email || assign.userId}</p>
                    </GovernanceCell>
                    <GovernanceCell>
                      <Badge variant="outline" className="text-[10px] py-0">{formatRoleLabel(assign.roleCode)}</Badge>
                    </GovernanceCell>
                    <GovernanceCell>
                      {assign.activeFrom ? formatDateLabel(assign.activeFrom, locale) : (locale === "ar" ? "غير محدد" : "Not set")}
                    </GovernanceCell>
                    <GovernanceCell>
                      <Badge variant={assign.active ? "default" : "secondary"}>
                        {assign.active ? "Active" : "Inactive"}
                      </Badge>
                    </GovernanceCell>
                  </GovernanceRow>
                );
              })}
            />
          </GovernanceSection>
          
          {committee.descriptionAr && (
             <GovernanceSection title={locale === "ar" ? "الوصف بالعربية" : "Arabic Description"}>
                <div className="text-sm leading-8 text-right font-arabic" dir="rtl">
                   {committee.descriptionAr}
                </div>
             </GovernanceSection>
          )}
        </div>

        <div className="space-y-8">
          <GovernanceSection title={copy.detailsTitle}>
            <GovernanceMetaGrid
              columns={1}
              items={[
                { label: copy.code, value: committee.code },
                { label: copy.levelLabel, value: committee.level },
                { label: copy.regionLabel, value: region ? <Link href={`/portal/admin/locations/regions/${region.id}`} className="text-primary hover:underline">{region.nameEn}</Link> : (locale === "ar" ? "لا يوجد" : "None") },
                { label: copy.areaLabel, value: area ? <Link href={`/portal/admin/locations/areas/${area.id}`} className="text-primary hover:underline">{area.nameEn}</Link> : (locale === "ar" ? "لا يوجد" : "None") },
                { label: copy.nameAr, value: <span dir="rtl">{committee.nameAr}</span> },
                { label: copy.created, value: formatDateLabel(committee.createdAt, locale) },
              ]}
            />
          </GovernanceSection>
        </div>
      </div>
    </div>
  );
}
