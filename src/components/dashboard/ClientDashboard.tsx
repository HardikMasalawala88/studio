"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "./DashboardStats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

// Mock data for client cases
const mockClientCases = [
  { id: "case1", title: "My Injury Claim", status: "Upcoming", hearingDate: "2024-08-15T10:00:00Z", advocate: "Alice Advocate" },
  { id: "case3", title: "Property Dispute", status: "On Hold", hearingDate: "2024-09-01T14:00:00Z", advocate: "Alice Advocate" },
];

export function ClientDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.firstName}!`}
        description="Here's an overview of your cases."
      />
      <DashboardStats userRole={user.role} />

      <Card>
        <CardHeader>
          <CardTitle>Your Cases</CardTitle>
          <CardDescription>An overview of your current and past cases.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockClientCases.length > 0 ? (
            <div className="space-y-4">
              {mockClientCases.map((c) => (
                <Card key={c.id} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription>Advocate: {c.advocate}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p><span className="font-medium">Status:</span> {c.status}</p>
                    <p><span className="font-medium">Next Hearing:</span> {new Date(c.hearingDate).toLocaleDateString()}</p>
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
