
"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { CaseForm } from '@/components/cases/CaseForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { USER_ROLES } from '@/lib/constants';
import { getCaseById } from '@/lib/caseService';
import type { Case } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';


export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSubscriptionActive, loading: authLoading } = useAuth();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user?.role === USER_ROLES.SUPER_ADMIN || (user?.role === USER_ROLES.ADVOCATE && isSubscriptionActive);

  useEffect(() => {
    if (caseId) {
      getCaseById(caseId)
        .then(data => {
          if (data) {
            setCaseData(data);
          } else {
            setError("Case not found.");
          }
        })
        .catch(() => setError("Failed to load case details."))
        .finally(() => setLoading(false));
    } else {
        router.push('/cases'); 
    }
  }, [caseId, router]);

  if (loading || authLoading) {
    return (
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
        <PageHeader title="Edit Case" />
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/4 ml-auto" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
        <PageHeader title="Error" />
        <p>{error}</p>
        <Button onClick={() => router.push('/cases')} className="mt-4">Back to Cases</Button>
      </AppLayout>
    );
  }
  
  if (!caseData) {
     return ( 
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
        <PageHeader title="Edit Case" />
        <p>Case data could not be loaded.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
      <PageHeader title="Edit Case" description={`Updating details for case: ${caseData.title}`} />
       {user?.role === USER_ROLES.ADVOCATE && !isSubscriptionActive && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription Required</AlertTitle>
          <AlertDescription>
            Your subscription is inactive. You cannot edit this case. 
            Please <Link href="/subscription" className="font-medium underline">renew your subscription</Link>.
          </AlertDescription>
        </Alert>
      )}
      <CaseForm initialData={caseData} />
    </AppLayout>
  );
}
