import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/admin/auth";
import { countNewLeads } from "@/lib/admin/data";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { TopBar } from "@/components/admin/TopBar";
import { SidebarInset, SidebarProvider } from "@/components/admin/ui/sidebar";

/** The signed-in shell: sidebar, glass top bar, content. Login and confirm sit outside this group. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const [newLeads, cookieStore] = await Promise.all([countNewLeads(), cookies()]);
  // shadcn's sidebar remembers collapsed/expanded in this cookie. Reading it here avoids a flash.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppSidebar admin={{ name: admin.name, email: admin.email, role: admin.role }} newLeads={newLeads} />
      <SidebarInset className="bg-shore min-w-0">
        <TopBar />
        {/* SidebarInset already renders <main>, so this is a div. */}
        <div
          id="main"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] outline-none sm:gap-6 sm:p-6 lg:p-8"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
