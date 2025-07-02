"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to load
    }

    if (!user) {
      // If not logged in, redirect to login page, preserving the intended path
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If logged in, check roles if specified
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // If user's role is not allowed, redirect to dashboard or an unauthorized page
      //router.push('/dashboard?error=unauthorized'); // Or a dedicated /unauthorized page
      router.push(`/login`);
    }
  }, [user, loading, router, pathname, allowedRoles]);

  if (loading || !user) {
    // Show a loading skeleton or spinner while checking auth or redirecting
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }
  
  // If user is authenticated and (no specific roles required OR user has allowed role)
  if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Fallback loading/redirect state if role check is still pending (should be covered by useEffect redirect)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
       <Skeleton className="h-12 w-full" />
    </div>
  );
}
