"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isToday } from "date-fns";
import { PlusCircle, ListOrdered, CreditCard } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/lib/constants";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ApiService from "@/api/apiService";
import type { Case } from "@/lib/model";
import { DashboardStats } from "./DashboardStats";

export function AdvocateDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientEmailsById, setClientEmailsById] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const fetchCases = async () => {
      if (!user || user.role !== USER_ROLES.ADVOCATE) return;
      try {
        const res = await ApiService.listCases();
        const allCases = res.data || [];
        const advocateCases = allCases.filter(
          (c: any) => c.advocateId === user.uid
        );
        setCases(advocateCases);

        const missingclientIds = advocateCases
          .map((c: any) => c.clientId)
          .filter((id: any) => id && !clientEmailsById[id]);

        await Promise.all(
          missingclientIds.map(async (clientId: any) => {
            try {
              const clientRes = await ApiService.getClient(clientId);
              const clientData = clientRes.data;

              const clientname =
                clientData?.user?.firstName && clientData?.user?.lastName
                  ? `${clientData.user.firstName} ${clientData.user.lastName}`
                  : clientData?.user?.email || "Unknown Client";

              setClientEmailsById((prev) => ({
                ...prev,
                [clientId]: clientname,
              }));
            } catch (err: any) {
              console.error(
                `Failed to load client for ID ${clientId}:`,
                err?.response?.data || err.message
              );
            }
          })
        );
      } catch (err: any) {
        console.error(
          "Failed to fetch cases:",
          err?.response?.data || err.message
        );
      }
    };

    fetchCases();
  }, [user]);

  if (!user || user.role !== USER_ROLES.ADVOCATE) return null;

  const todayHearings = cases.filter(
    (c) => new Date(c.hearingDate).toDateString() === new Date().toDateString()
  );

  const closedCases = cases.filter((c) => c.caseStatus === "Closed");

  const recentActivity = cases
    .filter((c) => !!c.modifiedAt) // filter out undefined/null modifiedAt
    .slice()
    .sort(
      (a, b) =>
        new Date(b.modifiedAt!).getTime() - new Date(a.modifiedAt!).getTime()
    )
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      description: `Updated case: ${c.caseTitle}`,
      time: format(new Date(c.modifiedAt!), "PP p"),
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.firstName}!`}
        description="Here's an overview of your activities."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button asChild>
              <Link href="/cases/new">
                <PlusCircle className="mr-2 h-4 w-4" /> New Case
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/daily-report">
                <ListOrdered className="mr-2 h-4 w-4" /> Daily Report
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/subscription">
                <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
              </Link>
            </Button>
          </div>
        }
      />

      <DashboardStats userRole={user.role} userId={user.uid} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Hearings</CardTitle>
            <CardDescription>
              Your scheduled hearings for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayHearings.length > 0 ? (
              <ul className="space-y-3">
                {todayHearings.map((hearing) => (
                  <li
                    key={hearing.id}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{hearing.caseTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Client:{" "}
                        {clientEmailsById[hearing.clientId] ?? "Loading..."}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {format(new Date(hearing.hearingDate), "p")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No hearings scheduled for today.
              </p>
            )}
            <Button variant="link" className="mt-4 p-0 h-auto" asChild>
              <Link href="/daily-report">View All Today&apos;s Hearings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your cases.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-3">
                {recentActivity.map((act) => (
                  <li key={act.id} className="p-3 border-b last:border-b-0">
                    <p className="text-sm">{act.description}</p>
                    <p className="text-xs text-muted-foreground">{act.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent activity.</p>
            )}
            <Button variant="link" className="mt-4 p-0 h-auto" asChild>
              <Link href="/cases">View All Cases</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
