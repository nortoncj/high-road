"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminBrand, adminNav } from "@/content/admin";
import { navIcons } from "./nav-icons";
import { UserMenu, type AdminSummary } from "./UserMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/admin/ui/sidebar";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop: a full sidebar that collapses to icons (Cmd/Ctrl+B, or the rail).
 * Phone: the same nav slides in as a sheet from the menu button in the top bar.
 * Both come from shadcn's Sidebar, so this file is just what goes in it.
 */
export function AppSidebar({ admin, newLeads, lateProjects = 0 }: { admin: AdminSummary; newLeads: number; lateProjects?: number }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnPhone = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={adminBrand.name}>
              <Link href="/admin" onClick={closeOnPhone}>
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <Image src={adminBrand.logo.onLight} alt="" width={26} height={32} className="dark:hidden" priority />
                  <Image src={adminBrand.logo.onDark} alt="" width={26} height={32} className="hidden dark:block" priority />
                </span>
                <span className="grid min-w-0 leading-tight">
                  <span className="font-display truncate text-[15px] font-semibold">{adminBrand.name}</span>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-[0.14em] uppercase">
                    {adminBrand.product}
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => {
                const Icon = navIcons[item.icon];
                const active = isActive(pathname, item.href);
                const showCount = item.icon === "leads" && newLeads > 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="data-[active=true]:shadow-[inset_3px_0_0_var(--brass)]"
                    >
                      <Link href={item.href} onClick={closeOnPhone} aria-current={active ? "page" : undefined}>
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.icon === "projects" && lateProjects > 0 ? (
                      <SidebarMenuBadge className="bg-negative-soft text-negative rounded-full px-1.5 tabular-nums">
                        {lateProjects}
                        <span className="sr-only"> late</span>
                      </SidebarMenuBadge>
                    ) : showCount ? (
                      <SidebarMenuBadge className="bg-brass-soft text-brass-ink rounded-full px-1.5 tabular-nums">
                        {newLeads > 99 ? "99+" : newLeads}
                        <span className="sr-only"> new</span>
                      </SidebarMenuBadge>
                    ) : item.soon ? (
                      <SidebarMenuBadge className="text-muted-foreground font-mono text-[10px] font-normal tracking-wide uppercase">
                        Soon
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu admin={admin} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
