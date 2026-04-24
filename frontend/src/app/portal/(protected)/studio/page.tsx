import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalStudioPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);

  if (!canAccessPortalHref(user, "/portal/studio")) {
    return (
      <Card className="bg-white">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-primary">
            {locale === "ar" ? "الوصول مقيد" : "Access restricted"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {locale === "ar" ? (
              <>
                استوديو التحرير متاح فقط للمستخدمين الذين لديهم صلاحية
                <span className="font-semibold text-primary"> CONTENT_EDITOR </span>
                أو
                <span className="font-semibold text-primary"> SUPER_ADMIN </span>
                .
              </>
            ) : (
              <>
                Editorial Studio is available only to users with
                <span className="font-semibold text-primary"> CONTENT_EDITOR </span>
                or
                <span className="font-semibold text-primary"> SUPER_ADMIN </span>
                access.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  redirect("/studio");
}
