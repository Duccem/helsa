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
import { SidebarOptions } from "./sidebar-options";
import Link from "next/link";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import { SidebarUser } from "./sidebar-user";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { data, isPending } = authClient.useSession();
  if (isPending || !data) {
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
        <SidebarContent></SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }
  return (
    <Sidebar collapsible="icon" variant="floating" {...props} className="">
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
        <SidebarOptions role={data.user.role} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <SidebarMenuButton onClick={toggleTheme} className="cursor-pointer">
      <Moon className="hidden dark:block size-4" />
      <Sun className="dark:hidden size-4" />
      {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
    </SidebarMenuButton>
  );
};

