"use client";

import Link from 'next/link';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Users, FileText, UserCircle, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { USER_ROLES, UserRole } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/components/ui/sidebar'; // Ensure this hook is available or correctly imported
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar'; // Assuming these are correctly exported from your sidebar UI component

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.SUPER_ADMIN] },
  { href: '/cases', label: 'Cases', icon: Briefcase, roles: [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.SUPER_ADMIN] },
  { href: '/daily-report', label: 'Daily Report', icon: FileText, roles: [USER_ROLES.ADVOCATE] },
  { href: '/admin/users', label: 'User Management', icon: Users, roles: [USER_ROLES.SUPER_ADMIN] },
  // Add more general items like profile or settings if needed
  // { href: '/profile', label: 'Profile', icon: UserCircle, roles: [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.SUPER_ADMIN] },
  // { href: '/settings', label: 'Settings', icon: Settings, roles: [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.SUPER_ADMIN] },
];

export function SidebarNav() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar(); // Assuming useSidebar provides toggleSidebar and isMobile

  useEffect(() => setMounted(true), []);
  if (!user) return null;

  const userRole = user.role;

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-sidebar-primary" />
            <div>
                <p className="font-semibold text-sm text-sidebar-foreground font-headline">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-sidebar-foreground/70">{user.role}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    variant="default"
                    size="default"
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                    tooltip={{ children: item.label, side: 'right' }}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            {mounted && (
            <SidebarMenuItem>
              <SidebarMenuButton
                variant="default"
                size="default"
                tooltip={{ children: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode', side: 'right' }}
                className="w-full justify-start"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} variant="default" size="default" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
