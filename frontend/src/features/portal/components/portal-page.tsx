import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="bg-white">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-primary">{copy.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {copy.description}
          </p>
        </CardContent>
      </Card>
    );
  }

  const copy =
    locale === "ar"
      ? {
          body:
            "هذه الشاشة مهيأة ومحمية. الخطوة التالية هي ربط هذا المسار بسير العمل الخلفي والاستعلامات المقيدة الخاصة بالمستخدم المسجل الدخول.",
        }
      : {
          body:
            "This screen is scaffolded and protected. The next implementation step is to bind this route to the corresponding backend workflows and scoped queries for the signed-in user.",
        };

  return (
    <Card className="bg-white">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-primary">{item.label[locale]}</h2>
        <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground">
          {item.description[locale]}
        </p>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">{copy.body}</p>
      </CardContent>
    </Card>
  );
}
