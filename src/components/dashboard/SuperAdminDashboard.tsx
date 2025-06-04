"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "./DashboardStats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const mockSystemStats = {
  totalUsers: 50,
  totalAdvocates: 15,
  totalClients: 35,
  activeCasesPlatformWide: 120,
};


export function SuperAdminDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Manage users, system settings, and view platform analytics."
        actions={
          <Button asChild>
            <Link href="/admin/users"><Users className="mr-2 h-4 w-4" /> Manage Users</Link>
          </Button>
        }
      />
      <DashboardStats userRole={user.role} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> User Management</CardTitle>
            <CardDescription>View, add, edit, or remove users from the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Total Users: <span className="font-semibold text-foreground">{mockSystemStats.totalUsers}</span></p>
            <p className="text-sm text-muted-foreground mb-2">Advocates: <span className="font-semibold text-foreground">{mockSystemStats.totalAdvocates}</span></p>
            <p className="text-sm text-muted-foreground mb-4">Clients: <span className="font-semibold text-foreground">{mockSystemStats.totalClients}</span></p>
            <Button asChild className="w-full">
              <Link href="/admin/users">Go to User Management</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/> Platform Analytics</CardTitle>
            <CardDescription>Overview of platform-wide case statistics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Active Cases (Platform Wide): <span className="font-semibold text-foreground">{mockSystemStats.activeCasesPlatformWide}</span></p>
            {/* Placeholder for more analytics */}
            <p className="text-sm text-muted-foreground">More detailed analytics coming soon.</p>
             <Button variant="outline" className="w-full mt-4" disabled>View Full Analytics (Soon)</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/> System Settings</CardTitle>
            <CardDescription>Configure application settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for system settings */}
            <p className="text-sm text-muted-foreground">System configuration options will be available here.</p>
            <Button variant="outline" className="w-full mt-4" disabled>Access System Settings (Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
