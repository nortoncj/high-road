"use client";

import { useEffect, useRef, useTransition } from "react";
import posthog from "posthog-js";
import { useTheme } from "next-themes";
import { TbDeviceDesktop, TbExternalLink, TbLoader2, TbLogout, TbMoon, TbSelector, TbSun } from "react-icons/tb";
import { adminBrand } from "@/content/admin";
import { signOut } from "@/lib/admin/auth-actions";
import { initials } from "@/lib/admin/format";
import { Avatar, AvatarFallback } from "@/components/admin/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/admin/ui/sidebar";

export type AdminSummary = { id: string; name: string; email: string; role: string };

const themes = [
  { value: "light", label: "Day", Icon: TbSun },
  { value: "dark", label: "Night", Icon: TbMoon },
  { value: "system", label: "Match device", Icon: TbDeviceDesktop },
] as const;

export function UserMenu({ admin }: { admin: AdminSummary }) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [signingOut, startSignOut] = useTransition();
  const identified = useRef(false);

  useEffect(() => {
    if (identified.current) return;

    posthog.identify(admin.id, {
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
    identified.current = true;
  }, [admin]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="bg-primary text-primary-foreground rounded-lg text-xs font-semibold">
                  {initials(admin.name)}
                </AvatarFallback>
              </Avatar>
              <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{admin.name}</span>
                <span className="text-muted-foreground truncate text-xs capitalize">{admin.role}</span>
              </span>
              <TbSelector aria-hidden="true" className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-semibold">{admin.name}</p>
              <p className="text-muted-foreground truncate text-xs">{admin.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
              {themes.map(({ value, label, Icon }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  <Icon aria-hidden="true" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={adminBrand.siteHref} target="_blank" rel="noopener">
                <TbExternalLink aria-hidden="true" />
                View the site
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={signingOut}
              onSelect={(e) => {
                e.preventDefault();
                posthog.reset();
                startSignOut(() => signOut());
              }}
            >
              {signingOut ? <TbLoader2 aria-hidden="true" className="animate-spin" /> : <TbLogout aria-hidden="true" />}
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
