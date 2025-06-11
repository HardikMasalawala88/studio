"use client";
import type React from 'react';
import { Header } from './Header';
import { SidebarNav } from './SidebarNav';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ThemeProvider } from 'next-themes';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail, // Added import
} from '@/components/ui/sidebar';
import type { UserRole } from '@/lib/constants';

interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AppLayout({ children, allowedRoles }: AppLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthGuard allowedRoles={allowedRoles}>
        <SidebarProvider defaultOpen={true}>
          {/* <Header /> Header is part of SidebarProvider to access useSidebar for mobile toggle */}
          <div className="flex min-h-[calc(100vh-4rem)]"> {/* 4rem is approx h-16 */}
            <Sidebar collapsible="icon" variant="sidebar" side="left">
              <Header />
              <SidebarNav />
              <SidebarRail /> {/* Added SidebarRail component */}
            </Sidebar>
            <SidebarInset>
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="container mx-auto">
                 {children}
                </div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}
