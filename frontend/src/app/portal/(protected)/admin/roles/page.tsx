import {
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { roleDefinitions } from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { RolesDirectoryTable } from "@/features/portal/components/roles-directory-table";

export default async function PortalAdminRolesPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيّد",
          restrictedDesc: "يمكن للمشرفين العامين فقط مراجعة نموذج الأدوار الكامل للمنصة.",
          eyebrow: "الحوكمة",
          title: "الأدوار",
          description:
            "أدوار SaudiNA محددة مسبقًا ومفروضة من الخلفية. يساعد هذا القسم المشرفين على فهم كيف يرتبط كل دور بالنطاق والحوكمة والمسؤولية التشغيلية.",
          breadcrumb: ["البوابة", "الحوكمة", "الأدوار"] as const,
          predefined: "الأدوار المعرّفة مسبقًا",
          predefinedHint: "تم تقليص كتالوج الأدوار عمداً للحفاظ على وضوح الحوكمة.",
          globalRoles: "الأدوار الشاملة",
          globalRolesHint: "أدوار تعمل بدون ارتباط جغرافي أو لجنة.",
          scopedRoles: "الأدوار النطاقية",
          scopedRolesHint: "أدوار لا تصبح فعالة إلا عند ربطها بنطاق محكوم.",
          makerChecker: "فصل الصلاحيات",
          makerCheckerHint: "تظل الموافقات الحساسة مفروضة في خدمات الخلفية، وليس في الواجهة.",
          catalogTitle: "كتالوج الأدوار",
          catalogDesc:
            "استخدم هذا المرجع عند إسناد الصلاحيات. تخفي البوابة الإجراءات غير المصرح بها، لكن الخلفية تظل المصدر النهائي للحقيقة.",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDesc: "Only super administrators can review the full platform role model.",
          eyebrow: "Governance",
          title: "Roles",
          description:
            "SaudiNA roles are predefined and backend-enforced. This module helps administrators understand how each role maps to scope, governance intent, and operational responsibility.",
          breadcrumb: ["Portal", "Governance", "Roles"] as const,
          predefined: "Predefined roles",
          predefinedHint: "The role catalog is intentionally constrained to preserve governance clarity.",
          globalRoles: "Global roles",
          globalRolesHint: "Roles that are intended to operate without a geography or committee scope.",
          scopedRoles: "Scoped roles",
          scopedRolesHint: "Roles that only become active when paired with a governed target scope.",
          makerChecker: "Maker-checker",
          makerCheckerHint: "Approval-sensitive workflows remain enforced in backend services, not the UI.",
          catalogTitle: "Role catalog",
          catalogDesc:
            "Use this reference when assigning access. The portal hides unauthorized actions, but the backend remains the final source of truth.",
        };

  if (!canAccessPortalHref(user, "/portal/admin/roles")) {
    return (
      <GovernanceSection
        title={copy.restrictedTitle}
        description={copy.restrictedDesc}
      />
    );
  }

  const globalRoles = roleDefinitions.filter((role) => role.scopeType === "GLOBAL").length;
  const scopedRoles = roleDefinitions.length - globalRoles;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={copy.breadcrumb as unknown as string[]}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label={copy.predefined}
          value={roleDefinitions.length}
          hint={copy.predefinedHint}
        />
        <GovernanceMetricCard
          label={copy.globalRoles}
          value={globalRoles}
          hint={copy.globalRolesHint}
        />
        <GovernanceMetricCard
          label={copy.scopedRoles}
          value={scopedRoles}
          hint={copy.scopedRolesHint}
        />
        <GovernanceMetricCard
          label={copy.makerChecker}
          value="Enabled"
          hint={copy.makerCheckerHint}
        />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy.catalogTitle}
        description={copy.catalogDesc}
      >
        <RolesDirectoryTable />
      </GovernanceSection>
    </div>
  );
}
