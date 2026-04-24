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
  getPortalRegion, 
  getPortalAreas,
  getPortalCommittees,
  PortalApiError,
  PortalRegion,
  PortalArea,
  PortalCommittee
} from "@/features/portal/lib/api";
import { formatDateLabel } from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { 
  activatePortalRegionAction, 
  deactivatePortalRegionAction, 
  deletePortalRegionAction 
} from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { CreateAreaDialog } from "@/features/portal/components/create-area-dialog";
import { CreateCommitteeDialog } from "@/features/portal/components/create-committee-dialog";
import { MapPin, Layout, Users, Activity } from "lucide-react";

export default async function PortalAdminRegionDetailPage({
  params,
}: {
  params: Promise<{ regionId: string }>;
}) {
  const signedInUser = await requirePortalUser();
  const locale = await getPortalLocale(signedInUser);
  const { regionId } = await params;

  if (!canAccessPortalHref(signedInUser, "/portal/admin/regions")) {
    return (
      <GovernanceSection title={locale === "ar" ? "الوصول مقيّد" : "Access restricted"}>
        <GovernanceEmptyState
          title={locale === "ar" ? "ليس لديك صلاحية" : "You do not have permission"}
          description={locale === "ar" ? "يمكن للمشرفين العامين فقط إدارة المناطق الحوكمية." : "Only super administrators can manage governance regions."}
        />
      </GovernanceSection>
    );
  }

  let region: PortalRegion | null = null;
  let areas: PortalArea[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    const [fetchedRegion, allAreas, allCommittees] = await Promise.all([
      getPortalRegion(regionId),
      getPortalAreas(),
      getPortalCommittees()
    ]);
    region = fetchedRegion;
    areas = allAreas.filter(a => a.regionId === regionId);
    committees = allCommittees.filter(c => c.regionId === regionId);
  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      notFound();
    }
    errorMessage = error instanceof Error ? error.message : "Failed to load region details.";
  }

  if (errorMessage || !region) {
    return (
      <GovernanceSection title="Error loading region">
        <GovernanceEmptyState
          title="Region not found"
          description={errorMessage || "The region you are looking for does not exist or could not be loaded."}
        />
      </GovernanceSection>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div dir={locale}>
      <GovernancePageHeader
        eyebrow={locale === "ar" ? "منطقة حوكميّة" : "Governance Region"}
        title={region.nameEn}
        description={locale === "ar" ? `إدارة الهيكل الحوكمي والمناطق الفرعية واللجان داخل ${region.nameEn}.` : `Manage the governance structure, areas, and committees within ${region.nameEn}.`}
        breadcrumb={locale === "ar" ? ["الإدارة", "المواقع", "المناطق", region.code] : ["Admin", "Locations", "Regions", region.code]}
        actions={
          <div className="flex gap-2">
            {region.isActive ? (
              <PortalConfirmAction
                action={deactivatePortalRegionAction}
                description={locale === "ar" ? "سيخفي التعطيل المناطق الفرعية واللجان المرتبطة بها من الواجهة العامة." : "Deactivating this region will hide its areas and committees from the public site."}
                fields={{ regionId: region.id }}
                title={locale === "ar" ? "تعطيل هذه المنطقة؟" : "Deactivate Region?"}
                triggerLabel={locale === "ar" ? "تعطيل" : "Deactivate"}
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            ) : (
              <PortalConfirmAction
                action={activatePortalRegionAction}
                description={locale === "ar" ? "سيعيد التفعيل ظهور المناطق الفرعية واللجان المرتبطة بها." : "Activating this region will restore visibility for its areas and committees."}
                fields={{ regionId: region.id }}
                title={locale === "ar" ? "تفعيل هذه المنطقة؟" : "Activate Region?"}
                triggerLabel={locale === "ar" ? "تفعيل" : "Activate"}
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            )}
            <PortalConfirmAction
              action={deletePortalRegionAction}
              confirmVariant="destructive"
              description={locale === "ar" ? "الحذف نهائي ولا يسمح إلا إذا لم تكن هناك مناطق فرعية مرتبطة." : "Deleting a region is permanent. You can only delete regions with no dependent areas."}
              fields={{ regionId: region.id }}
              title={locale === "ar" ? "حذف هذه المنطقة؟" : "Delete Region?"}
              triggerLabel={locale === "ar" ? "حذف" : "Delete"}
              triggerVariant="destructive"
            />
          </div>
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={locale === "ar" ? "الحالة" : "Status"}
          value={region.isActive ? (locale === "ar" ? "نشطة" : "Active") : (locale === "ar" ? "غير نشطة" : "Inactive")}
          hint={locale === "ar" ? "الحالة التشغيلية الحالية" : "Current operational status"}
          icon={<Activity className="size-4" />}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "المناطق الفرعية" : "Areas"}
          value={areas.length}
          hint={locale === "ar" ? "عدد المناطق الفرعية المسجلة" : "Number of registered areas"}
          icon={<MapPin className="size-4" />}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "اللجان" : "Committees"}
          value={committees.length}
          hint={locale === "ar" ? "إجمالي اللجان داخل المنطقة" : "Total committees in region"}
          icon={<Layout className="size-4" />}
        />
        <GovernanceMetricCard
          label={locale === "ar" ? "آخر تحديث" : "Last updated"}
          value={formatDateLabel(region.updatedAt, locale)}
          hint={locale === "ar" ? "آخر تغيير حوكمي مسجّل" : "Most recent governance change"}
          icon={<Users className="size-4" />}
        />
      </GovernanceMetricGrid>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <GovernanceSection 
            title={locale === "ar" ? "المناطق الفرعية" : "Areas"} 
            description={locale === "ar" ? "إدارة المناطق الجغرافية داخل هذه المنطقة." : "Manage geographic areas within this region."}
            actions={
              <CreateAreaDialog
                regions={[region]}
                defaultRegionId={region.id}
                lockRegion
                triggerLabel={locale === "ar" ? "إضافة منطقة فرعية" : "Add area"}
              />
            }
          >
            <GovernanceTable
              columns={["Name", "Code", "Status", "Updated"]}
              emptyTitle={locale === "ar" ? "لا توجد مناطق فرعية" : "No areas found"}
              emptyDescription={locale === "ar" ? "لا توجد مناطق فرعية مسجلة ضمن هذه المنطقة." : "There are no areas registered in this region."}
              rows={areas.map(area => (
                <GovernanceRow key={area.id}>
                  <GovernanceCell>
                    <Link href={`/portal/admin/locations/areas/${area.id}`} className="font-medium text-primary hover:underline">
                      {area.nameEn}
                    </Link>
                    <p className="text-xs text-muted-foreground" dir="rtl">{area.nameAr}</p>
                  </GovernanceCell>
                  <GovernanceCell>
                    <Badge variant="outline" className="font-mono text-[10px]">{area.code}</Badge>
                  </GovernanceCell>
                  <GovernanceCell>
                    <Badge variant={area.isActive ? "default" : "secondary"}>
                      {area.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </GovernanceCell>
                  <GovernanceCell>
                    {formatDateLabel(area.updatedAt, locale)}
                  </GovernanceCell>
                </GovernanceRow>
              ))}
            />
          </GovernanceSection>

          <GovernanceSection 
            title={locale === "ar" ? "اللجان" : "Committees"} 
            description={locale === "ar" ? "عرض اللجان العاملة على مستوى المنطقة." : "View committees operating at the regional level."}
            actions={
              <div className="flex flex-wrap gap-3">
                <CreateCommitteeDialog
                  regions={[region]}
                  areas={areas}
                  defaultLevel="REGIONAL"
                  defaultRegionId={region.id}
                  lockScope
                  triggerLabel={locale === "ar" ? "إضافة لجنة إقليمية" : "Add regional committee"}
                />
                <CreateCommitteeDialog
                  regions={[region]}
                  areas={areas}
                  defaultLevel="AREA"
                  defaultRegionId={region.id}
                  triggerLabel={locale === "ar" ? "إضافة لجنة منطقة" : "Add area committee"}
                />
              </div>
            }
          >
            <GovernanceTable
              columns={["Name", "Level", "Status"]}
              emptyTitle={locale === "ar" ? "لا توجد لجان إقليمية" : "No regional committees"}
              emptyDescription={locale === "ar" ? "هذه المنطقة لا تحتوي على لجان إقليمية عليا." : "This region has no top-level regional committees."}
              rows={committees.filter(c => c.level === "REGIONAL").map(comm => (
                <GovernanceRow key={comm.id}>
                  <GovernanceCell>
                     <Link href={`/portal/admin/committees/${comm.id}`} className="font-medium text-primary hover:underline">
                      {comm.nameEn}
                    </Link>
                  </GovernanceCell>
                  <GovernanceCell>{comm.level}</GovernanceCell>
                  <GovernanceCell>
                    <Badge variant={comm.isActive ? "default" : "secondary"}>
                      {comm.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </GovernanceCell>
                </GovernanceRow>
              ))}
            />
          </GovernanceSection>
        </div>

        <div className="space-y-8">
          <GovernanceSection title={locale === "ar" ? "تفاصيل المنطقة" : "Region details"}>
            <GovernanceMetaGrid
              columns={2}
              items={[
                { label: locale === "ar" ? "الرمز" : "Code", value: region.code },
                { label: locale === "ar" ? "الاسم (EN)" : "Name (En)", value: region.nameEn },
                { label: locale === "ar" ? "الاسم (AR)" : "Name (Ar)", value: <span dir="rtl">{region.nameAr}</span> },
                { label: locale === "ar" ? "تاريخ الإنشاء" : "Created", value: formatDateLabel(region.createdAt, locale) },
              ]}
            />
          </GovernanceSection>
        </div>
      </div>
      </div>
    </div>
  );
}
