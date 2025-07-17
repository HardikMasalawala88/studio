"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { CaseForm } from "@/components/cases/CaseForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { USER_ROLES } from "@/lib/constants";
import { getCaseById } from "@/lib/caseService";
import type { Case } from "@/lib/model";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import ApiService from "@/api/apiService";

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSubscriptionActive, loading: authLoading } = useAuth();
  // const { user, loading: authLoading } = useAuth();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit =
    user?.role === USER_ROLES.ADMIN ||
    (user?.role === USER_ROLES.ADVOCATE && isSubscriptionActive);

  // useEffect(() => {
  //   if (caseId) {
  //     // getCaseById(caseId)
  //       .then(data => {
  //         if (data) {
  //           const res = ApiService.getCase(caseId);
  //           setCaseData(res.data);
  //         } else {
  //           setError("Case not found.");
  //         }
  //       })
  //       .catch(() => setError("Failed to load case details."))
  //       .finally(() => setLoading(false));
  //   } else {
  //       router.push('/cases');
  //   }
  // }, [caseId, router]);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getCase(caseId);
        const data = response.data;

        setCaseData(data);
      } catch (error) {
        console.error("Error fetching case:", error);
        setError("Failed to load case details.");
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  if (loading || authLoading) {
    return (
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.ADMIN]}>
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
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.ADMIN]}>
        <PageHeader title="Error" />
        <p>{error}</p>
        <Button onClick={() => router.push("/cases")} className="mt-4">
          Back to Cases
        </Button>
      </AppLayout>
    );
  }

  if (!caseData) {
    return (
      <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.ADMIN]}>
        <PageHeader title="Edit Case" />
        <p>Case data could not be loaded.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout allowedRoles={[USER_ROLES.ADVOCATE, USER_ROLES.ADMIN]}>
      <PageHeader
        title="Edit Case"
        description={`Updating details for case: ${caseData.CaseTitle}`}
      />
      {/* {user?.role === USER_ROLES.ADVOCATE && !isSubscriptionActive && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription Required</AlertTitle>
          <AlertDescription>
            Your subscription is inactive. You cannot edit this case. Please{" "}
            <Link href="/subscription" className="font-medium underline">
              renew your subscription
            </Link>
            .
          </AlertDescription>
        </Alert>
      )} */}
      <CaseForm initialData={caseData as Case} />
    </AppLayout>
  );
}
