import { PortalShell } from "@/features/portal/components/portal-shell";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir}>
      <PortalShell user={user} locale={locale}>
        {children}
      </PortalShell>
    </div>
  );
}
