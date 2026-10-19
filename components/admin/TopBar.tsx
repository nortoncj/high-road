"use client";

import { usePathname } from "next/navigation";
import { adminNav } from "@/content/admin";
import { Separator } from "@/components/admin/ui/separator";
import { SidebarTrigger } from "@/components/admin/ui/sidebar";

/** Sticky glass bar: the menu button (opens the nav on phones) and where you are. */
export function TopBar() {
  const pathname = usePathname();
  const current =
    adminNav.find((n) => n.href !== "/admin" && (pathname === n.href || pathname.startsWith(`${n.href}/`))) ?? adminNav[0];

  return (
    <header className="bg-background/70 sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
      <div className="flex h-14 w-full items-center gap-2">
        <SidebarTrigger className="-ml-1 size-9" />
        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
        <span className="text-sm font-medium">{current.label}</span>
      </div>
    </header>
  );
}
