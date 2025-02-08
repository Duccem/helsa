'use client';
import logoiso from '@/src/assets/images/HELSA NUEVO BLANCO ISOTIPO.png';
import logo from '@/src/assets/images/HELSA NUEVO BLANCO.png';
import logoiso2 from '@/src/assets/images/HELSA NUEVO NEGRO ISOTIPO.png';
import logo2 from '@/src/assets/images/HELSA NUEVO NEGRO.png';
import { authClient } from '@helsa/auth/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@helsa/ui/components/sidebar';
import { cn } from '@helsa/ui/lib/utils';
import {
  BookMarked,
  Calendar,
  CircleDollarSign,
  History,
  LayoutDashboard,
  MessagesSquare,
  PieChart,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Section {
  title: string;
  routes: SectionRoute[];
}

export interface SectionRoute {
  icon: React.ReactNode;
  name: string;
  path: string;
}

const SideBar = ({ role }: { role: string }) => {
  const { data } = authClient.useSession();
  const sections = sideBarItems.map((section) => ({
    title: section.title,
    routes: section.routes.filter((route) => route.roles.includes(role)),
  }));
  const path = usePathname();
  const theme = useTheme();
  if (!data?.session) {
    return null;
  }
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" className="bg-background border-r">
      <SidebarHeader className="bg-background">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none justify-start data-[state=close]:hidden"
        >
          <Link href="/dashboard" className="flex items-center justify-center gap-2">
            {open && (
              <>
                {theme.theme === 'dark' || theme.theme === 'system' ? (
                  <img src={logo.src} alt="" className="rounded-lg object-contain h-[40px]" />
                ) : (
                  <img src={logo2.src} alt="" className="rounded-lg object-contain" />
                )}
              </>
            )}
            {!open && (
              <>
                {theme.theme === 'dark' || theme.theme === 'system' ? (
                  <img src={logoiso.src} alt="" className="rounded-lg object-contain h-[40px]" />
                ) : (
                  <img src={logoiso2.src} alt="" className="rounded-lg object-contain" />
                )}
              </>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-muted-foreground">{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.routes.map((route) => (
                  <SidebarMenuItem key={route.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn('hover:bg-sidebar hover:border rounded-none', {
                        'border  bg-sidebar': path == route.url,
                      })}
                    >
                      <Link href={route.url}>
                        {<route.icon />}
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;

export const sideBarItems = [
  {
    title: 'General',
    routes: [
      {
        icon: LayoutDashboard,
        title: 'Inicio',
        url: '/dashboard',
        roles: ['DOCTOR', 'PATIENT', 'HOSPITAL'],
      },
      {
        icon: Calendar,
        title: 'Calendario',
        url: '/schedule',
        roles: ['DOCTOR', 'PATIENT', 'HOSPITAL'],
      },
      {
        icon: BookMarked,
        title: 'Citas',
        url: '/appointments',
        roles: ['DOCTOR', 'PATIENT'],
      },
      {
        icon: Stethoscope,
        title: 'Doctores',
        url: '/book',
        roles: ['PATIENT'],
      },
      {
        icon: History,
        title: 'Historial medico',
        url: '/medical-history',
        roles: ['PATIENT'],
      },
      {
        icon: Users,
        title: 'Pacientes',
        url: '/patients',
        roles: ['DOCTOR', 'HOSPITAL'],
      },
      {
        icon: Stethoscope,
        title: 'Doctores',
        url: '/patients',
        roles: ['HOSPITAL'],
      },
      {
        icon: PieChart,
        title: 'Reportes',
        url: '/reports',
        roles: ['DOCTOR', 'PATIENT', 'HOSPITAL'],
      },
    ],
  },
  {
    title: 'Tools',
    routes: [
      {
        icon: MessagesSquare,
        title: 'Mensajería',
        url: '/chats',
        roles: ['DOCTOR', 'PATIENT', 'HOSPITAL'],
      },
      {
        icon: CircleDollarSign,
        title: 'Facturación',
        url: '/billing',
        roles: ['DOCTOR', 'PATIENT', 'HOSPITAL'],
      },
    ],
  },
];
