"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { portalIconMap } from "@/features/portal/lib/icon-map";
import type { PortalNavItem } from "@/features/portal/lib/navigation";
import type { PortalUser } from "@/types/portal";
import { LogoutButton } from "./logout-button";
import { PortalNav } from "./portal-nav";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import { makeT } from "@/features/portal/lib/i18n";
import { formatRoleLabel } from "@/features/portal/lib/governance";

export function PortalAppSidebar({
  items,
  user,
  locale,
}: {
  items: PortalNavItem[];
  user: PortalUser;
  locale: PortalLocale;
}) {
  const { state } = useSidebar();
  const t = makeT(locale);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={false} size="lg">
              <Link href="/portal">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{t("portal.name")}</div>
                  <div className="truncate text-xs text-sidebar-foreground/60">
                    {t("portal.tagline")}
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/12 text-sidebar-primary">
              <Sparkles className="size-5" />
            </div>
            {state === "collapsed" ? null : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {t("portal.sidebar.editorial.title")}
                </p>
                <p className="mt-1 text-xs leading-5 text-sidebar-foreground/65">
                  {t("portal.sidebar.editorial.desc")}
                </p>
              </div>
            )}
          </div>
        </div>

        <PortalNav items={items} locale={locale} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          {state === "collapsed" ? (
            <div className="flex justify-center">
              <LogoutButton compact />
            </div>
          ) : (
            <>
              <SidebarGroupLabel>{t("portal.sidebar.signedIn")}</SidebarGroupLabel>
              <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/55 p-4">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.displayName}
                </p>
                <p className="mt-1 truncate text-xs text-sidebar-foreground/60">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} className="bg-sidebar text-sidebar-foreground">
                      {formatRoleLabel(role, locale)}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4">
                  <LogoutButton />
                </div>
              </div>
            </>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
