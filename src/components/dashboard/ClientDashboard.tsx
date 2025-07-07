"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { format } from "date-fns";

import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "./DashboardStats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import ApiService from "@/api/apiService";
import type { Case } from "@/lib/model";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientDashboard() {
  const { user } = useAuth();
  const [clientCases, setClientCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientCases = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const res = await ApiService.listCases();
        const allCases: Case[] = res.data || [];
        const filtered = allCases.filter(c => c.clientId === user.uid);
        setClientCases(filtered);
      } catch (err) {
        console.error("Failed to load client cases:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClientCases();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.firstName}!`}
        description="Here's an overview of your cases."
      />
      <DashboardStats userRole={user.role} userId={user.uid} />

      <Card>
        <CardHeader>
          <CardTitle>Your Cases</CardTitle>
          <CardDescription>An overview of your current and past cases.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-muted/20">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : clientCases.length > 0 ? (
            <div className="space-y-4">
              {clientCases.map(c => (
                <Card key={c.id} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{c.caseTitle}</CardTitle>
                    <CardDescription>Advocate: {c.advocateId}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p><span className="font-medium">Status:</span> {c.caseStatus}</p>
                    <p><span className="font-medium">Next Hearing:</span> {c.hearingDate ? format(new Date(c.hearingDate), "PPP p") : "N/A"}</p>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/case/${c.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You currently have no active cases.</p>
          )}

          <div className="mt-6 text-center">
            <Button asChild>
              <Link href="/cases">View All My Cases</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
