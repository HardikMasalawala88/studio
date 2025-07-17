
"use client";

import Link from 'next/link';
import { Moon, Sun, Users2, CreditCard, Settings as SettingsIcon } from 'lucide-react'; 
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Users, FileText, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { USER_ROLES, UserRole } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { formatDistanceToNowStrict, isBefore, addDays } from 'date-fns';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  tag?: string; 
  tagVariant?: 'default' | 'warning' | 'destructive';
}

export function SidebarNav() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout, isSubscriptionActive } = useAuth();
  // const { toggleSidebar, isMobile } = useSidebar(); // Not used directly here anymore

  useEffect(() => setMounted(true), []);
  if (!user) return null;

  const userRole = user.role;
  
  let subscriptionTag: NavItem['tag'] | undefined;
  let subscriptionTagVariant: NavItem['tagVariant'] | undefined;

  if (userRole === USER_ROLES.ADVOCATE) {
    if (user.subscriptionPlanId === 'free_trial_1m' && user.subscriptionExpiryDate) {
      if (isSubscriptionActive) {
        const daysLeft = formatDistanceToNowStrict(new Date(user.subscriptionExpiryDate), { unit: 'day' });
        subscriptionTag = `Trial (${daysLeft})`;
        if (isBefore(new Date(user.subscriptionExpiryDate), addDays(new Date(), 7))) { 
            subscriptionTagVariant = 'warning';
        } else {
            subscriptionTagVariant = 'default';
        }
      } else {
        subscriptionTag = "Trial Expired";
        subscriptionTagVariant = 'destructive';
      }
    } else if (!isSubscriptionActive && user.subscriptionExpiryDate) { 
        subscriptionTag = "Expired";
        subscriptionTagVariant = 'destructive';
    } else if (isSubscriptionActive && user.subscriptionExpiryDate && isBefore(new Date(user.subscriptionExpiryDate), addDays(new Date(), 7))) { 
        subscriptionTag = "Expires Soon";
        subscriptionTagVariant = 'warning';
    }
  }


  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.ADMIN] },
    { href: '/cases', label: 'Cases', icon: Briefcase, roles: [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.ADMIN] },
    { href: '/clients', label: 'Clients', icon: Users2, roles: [USER_ROLES.ADVOCATE] },
    { href: '/daily-report', label: 'Daily Report', icon: FileText, roles: [USER_ROLES.ADVOCATE] },
    { 
      href: '/subscription', 
      label: 'My Subscription', 
      icon: CreditCard, 
      roles: [USER_ROLES.ADVOCATE],
      tag: subscriptionTag,
      tagVariant: subscriptionTagVariant
    },
    { href: '/admin/users', label: 'User Management', icon: Users, roles: [USER_ROLES.ADMIN] },
    { href: '/admin/subscriptions', label: 'Subscription Settings', icon: SettingsIcon, roles: [USER_ROLES.ADMIN] },
    { href: '/admin/paymentGateway', label: 'Paymeny GateWay Settings', icon: SettingsIcon, roles: [USER_ROLES.ADMIN] },
  ];


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
                    className="w-full justify-start relative" 
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                     {item.tag && (
                        <span className={cn(
                            "ml-auto text-xs px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden",
                            item.tagVariant === 'destructive' && "bg-destructive text-destructive-foreground",
                            item.tagVariant === 'warning' && "bg-yellow-500 text-black",
                            item.tagVariant === 'default' && "bg-primary/20 text-primary-foreground", // This was likely meant to be a different color for default badges
                            !item.tagVariant && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}>
                            {item.tag}
                        </span>
                    )}
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
