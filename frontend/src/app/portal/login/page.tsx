import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
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
          secure: "وصول محكوم بالأدوار والتعيينات",
          focused: "مساحة موحدة لإدارة الاجتماعات والفعاليات والمحتوى",
        }
      : {
          kicker: "Secured area",
          title: "SaudiNA operations portal",
          description:
            "Authorized staff can sign in with Google or Zoho, then access only the operational modules permitted by their active roles and assignments.",
          secure: "Role and assignment governed access",
          focused: "One workspace for meetings, events, content, and oversight",
        };

  return (
    <div
      className="min-h-screen bg-[linear-gradient(180deg,#fdfcf9_0%,#f2f6ed_54%,#fdfcf9_100%)] text-foreground"
      dir={locale}
      lang={locale}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-6 md:px-8">
        <div className={isRtl ? "ml-auto" : "mr-auto"}>
          <PortalLocaleSwitcher locale={locale} />
        </div>
        <div className="grid flex-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">{copy.kicker}</p>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-bold leading-tight text-primary md:text-5xl">{copy.title}</h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">{copy.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-secondary/15 bg-white/82 p-4 shadow-sm">
                <ShieldCheck className="size-5 text-secondary" />
                <p className="mt-3 text-sm font-semibold leading-6 text-primary">{copy.secure}</p>
              </div>
              <div className="rounded-lg border border-secondary/15 bg-white/82 p-4 shadow-sm">
                <Sparkles className="size-5 text-secondary" />
                <p className="mt-3 text-sm font-semibold leading-6 text-primary">{copy.focused}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-secondary/15 bg-white/95 p-6 shadow-[0_24px_70px_rgba(49,92,63,0.12)] md:p-8">
            <ProviderLogin locale={locale} googleUrl={providerAuthUrls.google} zohoUrl={providerAuthUrls.zoho} />
          </div>
        </div>
      </div>
    </div>
  );
}
