import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GovernanceEmptyState,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { InServiceMeetingForm } from "@/features/portal/components/in-service-meeting-form";
import { getPortalCommittees } from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { createPortalInServiceMeetingAction } from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function CreatePhysicalInServiceMeetingPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);

  if (!canAccessPortalHref(user, "/portal/meetings/in-service")) {
    return (
      <GovernanceSection
        title={locale === "ar" ? "الوصول مقيد" : "Access restricted"}
        description={locale === "ar" ? "ليست لديك صلاحية إنشاء اجتماعات خدمة." : "You do not have permission to create in-service meetings."}
      >
        <GovernanceEmptyState
          title={locale === "ar" ? "غير متاح" : "Unavailable"}
          description={locale === "ar" ? "اجتماعات الخدمة متاحة للأدوار المخولة فقط." : "In-service meetings are available only to authorized roles."}
        />
      </GovernanceSection>
    );
  }

  const committees = await getPortalCommittees();

  async function createPhysicalMeeting(formData: FormData) {
    "use server";
    await createPortalInServiceMeetingAction(formData);
    redirect("/portal/meetings/in-service");
  }

  return (
    <div className="flex flex-col gap-6">
      <GovernancePageHeader
        eyebrow={locale === "ar" ? "اجتماعات الخدمة" : "In-service meetings"}
        title={locale === "ar" ? "اجتماع خدمة حضوري" : "Physical service meeting"}
        description={locale === "ar" ? "أنشئ سجل اجتماع حضوري مع تفاصيل المكان فقط، إلى جانب عناصر سير العمل المشتركة." : "Create an in-person committee meeting with only venue-focused details and the shared workflow fields."}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", locale === "ar" ? "العمليات" : "Operations", locale === "ar" ? "اجتماعات الخدمة" : "In-service meetings", locale === "ar" ? "حضوري" : "Physical"]}
        actions={
          <Button asChild variant="secondary">
            <Link href="/portal/meetings/in-service">
              <ArrowLeft data-icon="inline-start" />
              {locale === "ar" ? "العودة للسجل" : "Back to register"}
            </Link>
          </Button>
        }
      />

      <GovernanceSection
        title={locale === "ar" ? "تعريف الاجتماع الحضوري" : "Physical meeting definition"}
        description={locale === "ar" ? "هذه الصفحة تعرض حقول المكان والحضور فقط حتى يبقى النموذج واضحًا ومناسبًا للاجتماعات الحضورية." : "This page keeps the form focused on venue and attendance details that matter for physical service meetings."}
        actions={<Badge variant="secondary"><MapPin data-icon="inline-start" /> {locale === "ar" ? "حضوري" : "Physical"}</Badge>}
      >
        <InServiceMeetingForm
          action={createPhysicalMeeting}
          committees={committees}
          format="PHYSICAL"
          submitLabel={locale === "ar" ? "إنشاء الاجتماع الحضوري" : "Create physical meeting"}
        />
      </GovernanceSection>
    </div>
  );
}
