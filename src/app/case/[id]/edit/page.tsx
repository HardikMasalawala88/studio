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

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        router.push('/cases'); // Should not happen if route is matched correctly
    }
  }, [caseId, router]);

  if (loading) {
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
     return ( // Should be covered by error state, but as a fallback
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
        <PageHeader title="Edit Case" />
        <p>Case data could not be loaded.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.SUPER_ADMIN]}>
      <PageHeader title="Edit Case" description={`Updating details for case: ${caseData.title}`} />
      <CaseForm initialData={caseData} />
    </AppLayout>
  );
}
