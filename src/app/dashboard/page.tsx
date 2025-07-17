"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { AdvocateDashboard } from '@/components/dashboard/AdvocateDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/4" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (!user) {
      // This should ideally be handled by AuthGuard, but as a fallback:
      return <p>Redirecting to login...</p>;
    }

    switch (user.role) {
      case USER_ROLES.ADVOCATE:
        return <AdvocateDashboard />;
      case USER_ROLES.CLIENT:
        return <ClientDashboard />;
      case USER_ROLES.ADMIN:
        return <SuperAdminDashboard />;
      default:
        return <p>Unknown user role. Please contact support.</p>;
    }
  };

  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.ADMIN]}>
      {renderDashboardContent()}
    </AppLayout>
  );
}
