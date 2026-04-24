"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";

type Provider = "GOOGLE" | "ZOHO";

export function ProviderLogin({
  locale,
  googleUrl,
  zohoUrl,
}: {
  locale: PortalLocale;
  googleUrl?: string;
  zohoUrl?: string;
}) {
  const router = useRouter();
  const rtl = locale === "ar";
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devEmail, setDevEmail] = useState("admin@saudina.local");
  const [devDisplayName, setDevDisplayName] = useState("SaudiNA Super Admin");
  const copy =
    locale === "ar"
      ? {
          googleTitle: "المتابعة عبر Google",
          zohoTitle: "المتابعة عبر Zoho",
          googleDesc: "استخدم حساب Google المؤسسي المرتبط مسبقًا بالمستخدم.",
          zohoDesc: "استخدم حساب Zoho المؤسسي المرتبط مسبقًا بالمستخدم.",
          signIn: "تسجيل الدخول",
          redirecting: "جاري التوجيه...",
          devTitle: "تسجيل دخول التطوير",
          devDesc:
            "تثق هذه النسخة المحلية في بيانات الاعتماد في بيئة التطوير فقط. استخدم بريداً إلكترونياً معتمداً لإنشاء جلسة آمنة دون انتظار إعداد لوحة مزود الخدمة.",
          emailPlaceholder: "البريد الإلكتروني",
          displayNamePlaceholder: "الاسم المعروض",
          signInWithGoogle: "تسجيل تجريبي عبر Google",
          signInWithZoho: "تسجيل تجريبي عبر Zoho",
          setupTitle: "لا يزال إعداد مزود الخدمة مطلوبًا",
          setupDesc:
            "يُتوقع أن يأتي تسجيل OAuth الحقيقي من نقاط نهاية المصادقة في الخلفية. أضف إعدادات Google وZoho في الخلفية بالإضافة إلى `NEXT_PUBLIC_API_BASE_URL` في الواجهة لتفعيل التحويلات الحقيقية.",
          failed:
            "فشل تسجيل الدخول. تأكد من أن الخلفية تعمل وأن المستخدم يمتلك صلاحية وصول صحيحة.",
        }
      : {
          googleTitle: "Continue with Google",
          zohoTitle: "Continue with Zoho",
          googleDesc: "Use the organizational Google account already assigned to the user.",
          zohoDesc: "Use the organizational Zoho account already assigned to the user.",
          signIn: "Sign in",
          redirecting: "Redirecting...",
          devTitle: "Development sign-in",
          devDesc:
            "This repo currently trusts claims in development. Use an assigned email to create a secure portal session without waiting on provider console setup.",
          emailPlaceholder: "Email",
          displayNamePlaceholder: "Display name",
          signInWithGoogle: "Dev sign in with Google",
          signInWithZoho: "Dev sign in with Zoho",
          setupTitle: "Provider setup still required",
          setupDesc:
            "Real OAuth provider start is now expected to come from the backend auth endpoints. Add backend Google and Zoho OAuth client settings plus `NEXT_PUBLIC_API_BASE_URL` on the frontend to enable true account redirects.",
          failed:
            "Sign-in failed. Confirm the backend is running and the user has valid access.",
        };
  const providers = useMemo(
    () => [
      {
        key: "GOOGLE" as const,
        title: copy.googleTitle,
        description: copy.googleDesc,
        href: googleUrl,
      },
      {
        key: "ZOHO" as const,
        title: copy.zohoTitle,
        description: copy.zohoDesc,
        href: zohoUrl,
      },
    ],
    [copy.googleDesc, copy.googleTitle, copy.zohoDesc, copy.zohoTitle, googleUrl, zohoUrl],
  );

  return (
    <div className="grid gap-4" dir={locale} lang={locale}>
      {providers.map((provider) => (
        <Card key={provider.key} className="bg-white">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-primary">{provider.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{provider.description}</p>
            </div>
            <Button
              className="hero-gradient h-12 rounded-xl px-6 text-primary-foreground"
              disabled={pending !== null}
              onClick={() => {
                if (!provider.href) {
                  setError("Provider OAuth start URL is not configured yet.");
                  return;
                }

                setPending(provider.key);
                window.location.href = provider.href;
              }}
            >
              {pending === provider.key ? copy.redirecting : copy.signIn}
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-white">
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="text-lg font-bold text-primary">{copy.devTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.devDesc}
            </p>
          </div>
          <Input value={devEmail} onChange={(event) => setDevEmail(event.target.value)} placeholder={copy.emailPlaceholder} />
          <Input value={devDisplayName} onChange={(event) => setDevDisplayName(event.target.value)} placeholder={copy.displayNamePlaceholder} />
          <div className="flex flex-wrap gap-3">
            {(["GOOGLE", "ZOHO"] as const).map((provider) => (
              <Button
                key={provider}
                className="hero-gradient rounded-xl px-5 text-primary-foreground"
                disabled={!devEmail || !devDisplayName || pending !== null}
                onClick={async () => {
                  setPending(provider);
                  setError(null);

                  const response = await fetch("/api/portal/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      provider,
                      email: devEmail,
                      displayName: devDisplayName,
                    }),
                  });

                  if (!response.ok) {
                    setPending(null);
                    setError(copy.failed);
                    return;
                  }

                  router.replace("/portal");
                  router.refresh();
                }}
              >
                {pending === provider ? (rtl ? "جارٍ تسجيل الدخول..." : "Signing in...") : provider === "GOOGLE" ? copy.signInWithGoogle : copy.signInWithZoho}
              </Button>
            ))}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {!googleUrl || !zohoUrl ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-primary">{copy.setupTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.setupDesc}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
