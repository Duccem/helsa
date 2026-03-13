"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/modules/shared/presentation/components/ui/sidebar";
import type * as React from "react";
import { OrganizationSwitcher } from "./organization-switcher";
import { SidebarOptions } from "./sidebar-options";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="#" className="py-2 flex items-center justify-center gap-2">
                  {open ? (
                    <>
                      <img src="/images/logo.png" className="size-8 rounded-sm" alt="" />
                      <span className="text-base font-semibold">Helsa</span>
                    </>
                  ) : (
                    <img src="/images/logo.png" className="size-5 rounded-xs" alt="" />
                  )}
                </Link>
              }
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarOptions />
      </SidebarContent>
      <SidebarFooter>
        <OrganizationSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

