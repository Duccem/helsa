'use client';

import { cn } from '@helsa/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useSession } from '../auth/session-provider';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function NavigationBilling({ className, role, ...props }: SidebarNavProps) {
  const { user } = useSession();
  const pathname = usePathname();
  const items = navItems.filter((item) => item.roles.includes(user.role.value));
  return (
    <Nav
      links={items.map((item) => ({
        title: item.title,
        href: item.href,
        variant: pathname === item.href ? 'default' : 'ghost',
      }))}
    />
  );
}

interface NavProps {
  links: {
    title: string;
    label?: string;
    href: string;
    variant: 'default' | 'ghost';
  }[];
}

export function Nav({ links }: NavProps) {
  const pathname = usePathname();
  return (
    <div className="flex  gap-5 py-2 justify-start items-center max-sm:max-w-full max-sm:overflow-x-scroll no-scroll">
      {links.map((link, index) => (
        <Link
          href={link.href}
          key={link.title}
          className={cn('text-muted-foreground', {
            'text-primary font-bold': pathname === link.href,
          })}
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
}

const navItems = [
  {
    title: 'Facturas',
    href: '/billing',
    roles: ['DOCTOR', 'PATIENT', 'HOSPITAL'],
  },
  {
    title: 'Tarifas',
    href: '/billing/prices',
    roles: ['DOCTOR', 'HOSPITAL'],
  },
];
