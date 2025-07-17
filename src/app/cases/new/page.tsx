
"use client"; // Required for using hooks like useAuth

import { AppLayout } from '@/components/layout/AppLayout';
import { CaseForm } from '@/components/cases/CaseForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For potential redirect
import { useEffect } from 'react';

export default function NewCasePage() {
  const { user, isSubscriptionActive, loading } = useAuth();
  const router = useRouter();

  const canCreate = user?.role === USER_ROLES.ADMIN || (user?.role === USER_ROLES.ADVOCATE && isSubscriptionActive);

  useEffect(() => {
    if (!loading && user?.role === USER_ROLES.ADVOCATE && !isSubscriptionActive) {
      // Optionally, redirect or just show the message
      // router.push('/subscription'); 
    }
  }, [loading, user, isSubscriptionActive, router]);

  if (loading) {
    // You might want a skeleton loader here
    return (
        <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.ADMIN]}>
            <PageHeader title="Create New Case" />
            <p>Loading...</p>
        </AppLayout>
    );
  }
  
  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.ADMIN]}>
      <PageHeader title="Create New Case" description="Fill in the details to register a new case." />
      {/* {user?.role === USER_ROLES.ADVOCATE && !isSubscriptionActive && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription Required</AlertTitle>
          <AlertDescription>
            Your subscription is inactive. You cannot create new cases. 
            Please <Link href="/subscription" className="font-medium underline">renew your subscription</Link>.
          </AlertDescription>
        </Alert>
      )} */}
      <CaseForm />
    </AppLayout>
  );
}
