import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  GovernanceEmptyState,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { portalNavItems } from "@/features/portal/lib/navigation";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import type { PortalUser } from "@/types/portal";

export function PortalPage({
  user,
  href,
  locale = "en",
}: {
  user: PortalUser;
  href: string;
  locale?: PortalLocale;
}) {
  const item = portalNavItems.find((navItem) => navItem.href === href);

  if (!item) {
    notFound();
  }

  if (!item.visible(user)) {
    const copy =
      locale === "ar"
        ? {
            title: "الوصول مقيد",
            description:
              "الأدوار والتعيينات النشطة الحالية لا تمنحك صلاحية الوصول إلى هذا القسم.",
          }
        : {
            title: "Access restricted",
            description:
              "Your active roles and assignments do not currently allow access to this area.",
          };

    return (
      <GovernanceSection title={copy.title} description={copy.description}>
        <GovernanceEmptyState title={copy.title} description={copy.description} />
      </GovernanceSection>
    );
  }

  const copy =
    locale === "ar"
      ? {
          eyebrow: "مساحة عمل",
          ready: "المسار جاهز",
          body:
            "هذه المساحة محمية حسب الدور والنطاق. استخدم لوحة التحكم للانتقال إلى سير العمل المتاح، أو اربط هذه الصفحة بسير العمل التفصيلي عند اكتمال المتطلبات الخلفية.",
        }
      : {
          eyebrow: "Workspace",
          ready: "Route ready",
          body:
            "This workspace is protected by role and scope. Use the dashboard to move into available workflows, or bind this page to its detailed workflow when the backend requirements are ready.",
        };

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={item.label[locale]}
        description={item.description[locale]}
      />
      <GovernanceSection title={copy.ready} description={copy.body}>
        <div className="flex items-start gap-4 rounded-lg border border-secondary/15 bg-secondary/5 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{copy.body}</p>
        </div>
      </GovernanceSection>
    </div>
  );
}
