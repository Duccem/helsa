"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/modules/shared/presentation/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/modules/shared/presentation/components/ui/sidebar";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import {
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  ChartColumnBig,
  ChevronRight,
  Coins,
  Folder,
  Heart,
  House,
  Layers,
  LayoutDashboard,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  items?: {
    title: string;
    url: string;
  }[];
};

type MenuGroup = {
  items: MenuItem[];
  title: string;
};

type MenuConfig = {
  groups: MenuGroup[];
  role: "admin" | "doctor" | "patient";
};

export function SidebarOptions({ role }: { role?: string | null }) {
  const selectedConfig = configs.find((conf) => conf.role === role) ?? configs[0];
  return (
    <>
      {selectedConfig.groups.map((c, i) => (
        <SidebarGroup key={c.title + i}>
          <SidebarGroupLabel>{c.title.toUpperCase()}</SidebarGroupLabel>
          <SidebarMenu>
            {c.items.map((item) => (
              <Collapsible
                key={item.title}
                render={() => (
                  <SidebarMenuItem>
                    {!item.items ? (
                      <SidebarMenuButton tooltip={item.title}>
                        <Link href={item.url as any} className="flex items-center gap-2 w-full">
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          }
                        />
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  render={
                                    <Link href={subItem.url as any}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  }
                                />
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    )}
                  </SidebarMenuItem>
                )}
                className="group/collapsible"
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

const adminMenuConfig: MenuConfig = {
  role: "admin",
  groups: [
    {
      title: "Management",
      items: [
        {
          title: "Dashboard",
          url: "/home",
          icon: LayoutDashboard,
        },
        {
          title: "Appointments",
          url: "/appointments",
          icon: Calendar,
        },
        {
          title: "Patients",
          url: "/patients",
          icon: Users,
        },
        {
          title: "Doctors",
          url: "/doctors",
          icon: Stethoscope,
        },
        {
          title: "Analytics",
          url: "/courses",
          icon: ChartColumnBig,
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Hospital",
          url: "/settings/organization",
          icon: Building,
        },
        {
          title: "Billing",
          url: "/settings/billing",
          icon: Coins,
        },
        {
          title: "Staff",
          url: "/settings/team",
          icon: Briefcase,
        },
      ],
    },
  ],
};

const teacherMenuConfig: MenuConfig = {
  role: "doctor",
  groups: [
    {
      title: "Clinic",
      items: [
        {
          title: "Dashboard",
          url: "/home",
          icon: LayoutDashboard,
        },
        {
          title: "Appointments",
          url: "/appointments",
          icon: Calendar,
        },
        {
          title: "Patients",
          url: "/patients",
          icon: Users,
        },
        {
          title: "Analytics",
          url: "/courses",
          icon: ChartColumnBig,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Billing",
          url: "/settings/billing",
          icon: Coins,
        },
        {
          title: "Payout",
          url: "/settings/payout",
          icon: Wallet,
        },
      ],
    },
  ],
};

const parentMenuConfig: MenuConfig = {
  role: "patient",
  groups: [],
};

const configs = [adminMenuConfig, teacherMenuConfig, parentMenuConfig];

