import { redirect } from "next/navigation";
import { GovernanceEmptyState, GovernanceSection } from "@/features/portal/components/governance-ui";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalStudioPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);

  if (!canAccessPortalHref(user, "/portal/studio")) {
    return (
      <GovernanceSection
        title={locale === "ar" ? "الوصول مقيد" : "Access restricted"}
        description={
          locale === "ar"
            ? "استوديو التحرير متاح فقط للمستخدمين الذين لديهم صلاحية CONTENT_EDITOR أو SUPER_ADMIN."
            : "Editorial Studio is available only to users with CONTENT_EDITOR or SUPER_ADMIN access."
        }
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "استوديو التحرير غير متاح" : "Editorial Studio is unavailable"}
          description={
            locale === "ar"
              ? "تواصل مع المشرف العام إذا كنت تحتاج صلاحية تحرير المحتوى العام."
              : "Contact a Super Admin if you need public content editing access."
          }
        />
      </GovernanceSection>
    );
  }

  redirect("/studio");
}
