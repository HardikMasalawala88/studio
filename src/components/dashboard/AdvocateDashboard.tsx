"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "./DashboardStats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ListOrdered } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

// Mock data, replace with actual data fetching
const mockUpcomingHearings = [
  { id: "case1", title: "Case Alpha vs. Beta", time: "10:00 AM", client: "Client X" },
  { id: "case2", title: "Case Gamma Hearing", time: "02:30 PM", client: "Client Y" },
];

const mockRecentActivity = [
  { id: "act1", description: "New note added to Case Alpha vs. Beta", time: "2 hours ago" },
  { id: "act2", description: "Document uploaded for Case Delta", time: "5 hours ago" },
  { id: "act3", description: "Case Epsilon status changed to On Hold", time: "1 day ago" },
];

export function AdvocateDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.firstName}!`}
        description="Here's an overview of your activities."
        actions={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/cases/new"><PlusCircle className="mr-2 h-4 w-4" /> New Case</Link>
            </Button>
             <Button variant="outline" asChild>
              <Link href="/daily-report"><ListOrdered className="mr-2 h-4 w-4" /> Daily Report</Link>
            </Button>
          </div>
        }
      />
      <DashboardStats userRole={user.role} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Hearings</CardTitle>
            <CardDescription>Your scheduled hearings for today.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockUpcomingHearings.length > 0 ? (
              <ul className="space-y-3">
                {mockUpcomingHearings.map((hearing) => (
                  <li key={hearing.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="font-medium">{hearing.title}</p>
                      <p className="text-sm text-muted-foreground">Client: {hearing.client}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{hearing.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No hearings scheduled for today.</p>
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
             {mockRecentActivity.length > 0 ? (
              <ul className="space-y-3">
                {mockRecentActivity.map((activity) => (
                  <li key={activity.id} className="p-3 border-b last:border-b-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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
