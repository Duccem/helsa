"use client";

import { useEffect } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/modules/shared/presentation/components/ui/sidebar";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/modules/shared/presentation/components/ui/dropdown-menu";
import Link from "next/link";

export function OrganizationSwitcher() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: listOrgs, isPending: isPendingList } = authClient.useListOrganizations();
  const { data: activeOrg, isPending: isPendingOrg } = authClient.useActiveOrganization();

  useEffect(() => {
    if (!activeOrg && listOrgs && listOrgs.length > 0) {
      authClient.organization.setActive(
        {
          organizationId: listOrgs[0].id,
        },
        {
          onSuccess: () => {
            router.refresh();
          },
        },
      );
    }
  }, [activeOrg, listOrgs, router]);

  if (!activeOrg || !listOrgs || isPendingList || isPendingOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-not-allowed opacity-50">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center">
              ...
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {activeOrg.logo ? <img src={activeOrg.logo ?? ""} alt="" /> : <span>{activeOrg.name.charAt(0)}</span>}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activeOrg.name}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>
              {listOrgs.map((organization, index) => (
                <DropdownMenuItem
                  key={organization.name}
                  onClick={async () => {
                    await authClient.organization.setActive(
                      {
                        organizationId: organization.id,
                      },
                      {
                        onSuccess: () => {
                          router.refresh();
                        },
                      },
                    );
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center border">
                    {organization.logo ? (
                      <img src={organization.logo ?? ""} alt="" className="object-cover w-full aspect-square" />
                    ) : (
                      <span>{organization.name.charAt(0)}</span>
                    )}
                  </div>
                  {organization.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/new-organization"} className="flex items-center w-full gap-2">
                  <Plus />
                  Add New Workspace
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

