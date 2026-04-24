import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { portalIconMap } from "@/features/portal/lib/icon-map";
import { formatRoleLabel } from "@/features/portal/lib/governance";
import { getVisiblePortalNavItems } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalHomePage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const modules = getVisiblePortalNavItems(user, locale).filter((item) => item.href !== "/portal");
  const copy =
    locale === "ar"
      ? {
          welcome: "مرحباً",
          title: "لوحة القيادة التشغيلية",
          description:
            "تتكيف هذه الصفحة الافتتاحية مع المستخدم المسجّل. كل وحدة ظاهرة أدناه تُشتق من الأدوار النشطة ونطاقات التعيين، بحيث تبقى المساحة الآمنة متوافقة مع قواعد الصلاحيات في الخلفية.",
          rolesLabel: "الأدوار الفعالة",
        }
      : {
          welcome: "Welcome",
          title: "Operational dashboard",
          description:
            "This landing page adapts to the signed-in user. Every visible module below is derived from active roles plus assignment scope, so the secure area stays aligned with backend authorization rules.",
          rolesLabel: "Active roles",
        };

  return (
    <div className="space-y-8">
      <Card className="bg-white">
        <CardContent className="p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">{copy.welcome}</p>
          <h2 className="mt-3 text-3xl font-bold text-primary">{copy.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role}>{formatRoleLabel(role, locale)}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {modules.map((module) => {
          const Icon = portalIconMap[module.icon];
          return (
            <Link key={module.href} href={module.href}>
              <Card className="h-full bg-white transition-transform hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl soft-gradient-blue text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary">{module.label}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{module.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-secondary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
