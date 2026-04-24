import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceUploadForm } from "@/features/portal/components/resource-upload-form";
import {
  GovernanceEmptyState,
  GovernanceListCard,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { CreateResourceCategoryDialog } from "@/features/portal/components/create-resource-category-dialog";
import { UploadResourceDialog } from "@/features/portal/components/upload-resource-dialog";
import {
  PortalApiError,
  PortalResource,
  PortalResourceCategory,
  getPortalResourceCategories,
  getPortalResources,
} from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import {
  createPortalResourceCategoryAction,
  updatePortalResourceCategoryAction,
} from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalResourcesPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "الأدوار النشطة الحالية لا تمنحك صلاحية إدارة الموارد.",
          restrictedEmptyTitle: "الموارد التحريرية غير متاحة",
          restrictedEmptyDesc: "يمكن فقط لمحرري المحتوى والمشرف العام إدارة فئات الملفات والموارد.",
          loadTitle: "تعذّر تحميل الموارد",
          loadEmptyTitle: "خدمة الموارد غير متاحة",
          loadEmptyDesc: "لم تُرجع الواجهة الخلفية الفئات أو سجلات الموارد لهذا الحساب.",
          eyebrow: "التحرير",
          title: "إدارة الموارد",
          description:
            "حافظ على تصنيف الفئات وأصول الملفات المنظمة المستخدمة عبر المنصة العامة والداخلية.",
          resources: "الموارد",
          categories: "الفئات",
          publicFiles: "الملفات العامة",
          privateFiles: "الملفات الخاصة",
          categoriesTitle: "الفئات",
          categoriesDesc: "عدّل أسماء الفئات مع الحفاظ على الرموز الثابتة.",
          resourcesTitle: "سجل الموارد",
          resourcesDesc: "فهرس مباشر للموارد المرفوعة وبيانات الملفات ووضع التوزيع.",
          noCategories: "لا توجد فئات بعد",
          noCategoriesDesc: "أنشئ أول فئة قبل رفع المستندات المصنفة.",
          noResources: "لا توجد موارد بعد",
          noResourcesDesc: "ارفع أول مورد لملء سجل الأصول المنظم.",
        }
      : null;

  if (!canAccessPortalHref(user, "/portal/resources")) {
    return (
      <GovernanceSection
        title={copy?.restrictedTitle ?? "Access restricted"}
        description={copy?.restrictedDescription ?? "Your active roles do not currently allow access to resources administration."}
      >
        <GovernanceEmptyState
          title={copy?.restrictedEmptyTitle ?? "Editorial resources are unavailable"}
          description={copy?.restrictedEmptyDesc ?? "Only Content Editors and Super Admins can maintain resource categories and files."}
        />
      </GovernanceSection>
    );
  }

  let resources: PortalResource[] = [];
  let categories: PortalResourceCategory[] = [];
  let errorMessage: string | null = null;

  try {
    [resources, categories] = await Promise.all([
      getPortalResources(),
      getPortalResourceCategories(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load resources from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection title={copy?.loadTitle ?? "Unable to load resources"} description={errorMessage}>
        <GovernanceEmptyState
          title={copy?.loadEmptyTitle ?? "The resources service is unavailable"}
          description={copy?.loadEmptyDesc ?? "The backend did not return categories or resource records for this account."}
        />
      </GovernanceSection>
    );
  }

  const publicResources = resources.filter((resource) => resource.isPublic).length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy?.eyebrow ?? "Editorial"}
        title={copy?.title ?? "Resources admin"}
        description={copy?.description ?? "Maintain category taxonomy and governed document assets used across the public and internal platform."}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy?.eyebrow ?? "Editorial", locale === "ar" ? "الموارد" : "Resources"]}
        primaryAction={<UploadResourceDialog categories={categories} />}
        actions={<CreateResourceCategoryDialog />}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy?.resources ?? "Resources"} value={resources.length} hint={locale === "ar" ? "سجلات الموارد المخزنة الظاهرة ضمن النطاق." : "Stored resource records visible in scope."} />
        <GovernanceMetricCard label={copy?.categories ?? "Categories"} value={categories.length} hint={locale === "ar" ? "مجموعات تصنيف متاحة للفهرسة." : "Taxonomy groups available for classification."} />
        <GovernanceMetricCard label={copy?.publicFiles ?? "Public files"} value={publicResources} hint={locale === "ar" ? "موارد متاحة للوصول العام." : "Resources exposed for public access."} />
        <GovernanceMetricCard label={copy?.privateFiles ?? "Private files"} value={resources.length - publicResources} hint={locale === "ar" ? "موارد تتطلب وصولًا خاصًا أو تسليمًا موقّعًا." : "Resources that require private access or signed delivery."} />
      </GovernanceMetricGrid>


      <div className="grid gap-6 xl:grid-cols-2">
        <GovernanceSection
          title={copy?.categoriesTitle ?? "Categories"}
          description={copy?.categoriesDesc ?? "Edit category naming while keeping stable category codes."}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">{copy?.categoriesTitle ?? "Categories"}</h3>
            {categories.length === 0 ? (
              <GovernanceEmptyState
                title={copy?.noCategories ?? "No categories yet"}
                description={copy?.noCategoriesDesc ?? "Create the first resource category before uploading classified documents."}
              />
            ) : (
              categories.map((category) => (
                <form
                  key={category.id}
                  action={updatePortalResourceCategoryAction}
                  className="grid gap-4 rounded-2xl border border-border/40 p-4"
                >
                  <input name="categoryId" type="hidden" value={category.id} />
                  <Input name="code" defaultValue={category.code} required />
                  <Input name="nameEn" defaultValue={category.nameEn} required />
                  <Input name="nameAr" defaultValue={category.nameAr} required />
                  <div>
                    <Button type="submit" variant="outline">
                      Save category
                    </Button>
                  </div>
                </form>
              ))
            )}
          </div>
        </GovernanceSection>

        <GovernanceSection
          title={copy?.resourcesTitle ?? "Resource register"}
          description={copy?.resourcesDesc ?? "A live inventory of uploaded resources, file metadata, and delivery posture."}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">{copy?.resourcesTitle ?? "Resources"}</h3>
            {resources.length === 0 ? (
              <GovernanceEmptyState
                title={copy?.noResources ?? "No resources yet"}
                description={copy?.noResourcesDesc ?? "Upload the first resource to populate the governed asset register."}
              />
            ) : (
              resources.map((resource) => (
                <GovernanceListCard
                  key={resource.id}
                  title={resource.titleEn}
                  subtitle={resource.titleAr}
                  badges={
                    <>
                      <Badge>{resource.isPublic ? "Public" : "Private"}</Badge>
                      {resource.resource_categories ? (
                        <Badge className="bg-accent text-accent-foreground">
                          {resource.resource_categories.nameEn}
                        </Badge>
                      ) : null}
                    </>
                  }
                >
                  <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-primary">File:</span>{" "}
                      {resource.filePath}
                    </p>
                    <p>
                      <span className="font-semibold text-primary">Type:</span>{" "}
                      {resource.mimeType}
                    </p>
                    <p>
                      <span className="font-semibold text-primary">Size:</span>{" "}
                      {resource.sizeBytes} bytes
                    </p>
                    <p>
                      <span className="font-semibold text-primary">Downloads:</span>{" "}
                      {resource.downloadCount}
                    </p>
                  </div>
                </GovernanceListCard>
              ))
            )}
          </div>
        </GovernanceSection>
      </div>
    </div>
  );
}
