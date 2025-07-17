"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "./DashboardStats";
import { Button } from "@/components/ui/button";
import {
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import ApiService from "@/api/apiService";
import type { UserFormValues, Case } from "@/lib/model";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdvocates: 0,
    totalClients: 0,
    activeCasesPlatformWide: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, caseRes] = await Promise.all([
          ApiService.listUsers(),      // or ApiService.listUsers() if defined
          ApiService.listCases(),      // or ApiService.listCases()
        ]);

        const users: UserFormValues[] = usersRes.data || [];
        const cases: Case[] = caseRes.data || [];

        const totalUsers = users.length;
        const totalAdvocates = users.filter((u) => u.role === "Advocate").length;
        const totalClients = users.filter((u) => u.role === "Client").length;
        const activeCasesPlatformWide = cases.filter((c) => c.caseStatus !== "Closed").length;

        setStats({
          totalUsers,
          totalAdvocates,
          totalClients,
          activeCasesPlatformWide,
        });
      } catch (error) {
        console.error("Failed to load super admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Manage users, system settings, and view platform analytics."
        actions={
          <Button asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" /> Manage Users
            </Link>
          </Button>
        }
      />

      <DashboardStats userRole={user.role} userId={user.uid} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> User Management
            </CardTitle>
            <CardDescription>
              View, add, edit, or remove users from the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Total Users:{" "}
                  <span className="font-semibold text-foreground">
                    {stats.totalUsers}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Advocates:{" "}
                  <span className="font-semibold text-foreground">
                    {stats.totalAdvocates}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Clients:{" "}
                  <span className="font-semibold text-foreground">
                    {stats.totalClients}
                  </span>
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/users">Go to User Management</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Platform Analytics
            </CardTitle>
            <CardDescription>
              Overview of platform-wide case statistics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Active Cases (Platform Wide):{" "}
                  <span className="font-semibold text-foreground">
                    {stats.activeCasesPlatformWide}
                  </span>
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  disabled
                >
                  View Full Analytics (Soon)
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> System Settings
            </CardTitle>
            <CardDescription>
              Configure application settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              System configuration options will be available here.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              disabled
            >
              Access System Settings (Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
