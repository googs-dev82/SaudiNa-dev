import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ProviderLogin } from "@/features/portal/components/provider-login";
import { PortalLocaleSwitcher } from "@/features/portal/components/portal-locale-switcher";
import { getPortalUser, providerAuthUrls, getPortalLocale } from "@/features/portal/lib/session";

export default async function PortalLoginPage() {
  const user = await getPortalUser();
  const locale = await getPortalLocale();
  const isRtl = locale === "ar";

  if (user) {
    redirect("/portal");
  }

  const copy =
    locale === "ar"
      ? {
          kicker: "منطقة محمية",
          title: "بوابة سعودينا التشغيلية",
          description:
            "يمكن للموظفين المعتمدين تسجيل الدخول عبر Google أو Zoho ثم الوصول فقط إلى الوحدات التشغيلية المسموح بها وفق الأدوار والتعيينات النشطة.",
        }
      : {
          kicker: "Secured area",
          title: "SaudiNA operations portal",
          description:
            "Authorized staff can sign in with Google or Zoho, then access only the operational modules permitted by their active roles and assignments.",
        };

  return (
    <div className="min-h-screen bg-muted/20" dir={locale} lang={locale}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
        <div className={isRtl ? "ml-auto" : "mr-auto"}>
          <PortalLocaleSwitcher locale={locale} />
        </div>
        <div className="grid flex-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">{copy.kicker}</p>
          <h1 className="text-5xl font-bold leading-tight text-primary">{copy.title}</h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">{copy.description}</p>
        </div>
        <Card className="bg-white">
          <CardContent className="p-8">
            <ProviderLogin locale={locale} googleUrl={providerAuthUrls.google} zohoUrl={providerAuthUrls.zoho} />
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
