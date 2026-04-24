import { getVisiblePortalNavItems } from "@/features/portal/lib/navigation";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import type { PortalUser } from "@/types/portal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PortalAppSidebar } from "./portal-app-sidebar";
import { PortalSiteHeader } from "./portal-site-header";

export function PortalShell({
  user,
  locale,
  children,
}: {
  user: PortalUser;
  locale: PortalLocale;
  children: React.ReactNode;
}) {
  const navItems = getVisiblePortalNavItems(user, locale);
  const side = locale === "ar" ? "right" : "left";
  const sidebarWidth = locale === "ar" ? "21.5rem" : "17rem";
  const sidebarIconWidth = locale === "ar" ? "5.75rem" : "4.5rem";

  return (
    <SidebarProvider
      defaultOpen
      side={side}
      style={
        {
          "--sidebar-width": sidebarWidth,
          "--sidebar-width-icon": sidebarIconWidth,
        } as React.CSSProperties
      }
    >
      <PortalAppSidebar items={navItems} user={user} locale={locale} />
      <SidebarInset className="min-w-0 bg-[radial-gradient(circle_at_top,rgba(214,187,125,0.12),transparent_24%),linear-gradient(180deg,#f8f6f1_0%,#f5f6f7_100%)]">
        <PortalSiteHeader items={navItems} locale={locale} />
        <div className="flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
