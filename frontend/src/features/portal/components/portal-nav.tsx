"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { PortalNavItem } from "@/features/portal/lib/navigation";
import { portalIconMap } from "@/features/portal/lib/icon-map";
import { cn } from "@/lib/utils";

export function PortalNav({
  items,
  locale,
}: {
  items: PortalNavItem[];
  locale: "ar" | "en";
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isRtl = locale === "ar";
  const groupedItems = items.reduce<Record<string, PortalNavItem[]>>((groups, item) => {
    groups[item.group] ??= [];
    groups[item.group].push(item);
    return groups;
  }, {});

  return (
    <nav className="flex flex-col gap-5">
      {Object.entries(groupedItems).map(([group, groupItems]) => (
        <SidebarGroup key={group}>
          <SidebarGroupLabel className={isRtl ? "text-right" : undefined}>{group}</SidebarGroupLabel>
          <SidebarMenu>
            {groupItems.map((item) => {
              const Icon = portalIconMap[item.icon];
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} size="lg" className={cn(isRtl ? "text-right" : undefined)}>
                    <Link href={item.href}>
                      <Icon className="shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block whitespace-normal break-words font-semibold leading-6">{item.label}</span>
                        {state === "collapsed" ? null : (
                          <span
                            className={cn(
                              "mt-1 block text-xs leading-5",
                              active
                                ? "text-sidebar-accent-foreground/75"
                                : "text-sidebar-foreground/60",
                            )}
                          >
                            {item.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </nav>
  );
}
