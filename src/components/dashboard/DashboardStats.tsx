"use client";

import { useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Archive } from "lucide-react";
import { isAfter } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApiService from "@/api/apiService";
import type { Case } from "@/lib/model";

interface DashboardStatsProps {
  userRole: string;
  userId?: string;
}

export function DashboardStats({ userRole, userId }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalCases: 0,
    upcomingHearings: 0,
    closedCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await ApiService.listCases();
        const allCases: Case[] = res.data || [];
        // Filter cases based on user role
        const filteredCases = userRole === "Advocate"
          ? allCases.filter(c => c.advocateId === userId)
          : userRole === "Client"
          ? allCases.filter(c => c.clientId === userId)
          : allCases;

        const totalCases = filteredCases.length;
        const closedCases = filteredCases.filter(c => c.caseStatus === "Closed").length;
        const upcomingHearings = filteredCases.filter(
          c => c.hearingDate && isAfter(new Date(c.hearingDate), new Date())
        ).length;

        setStats({ totalCases, upcomingHearings, closedCases });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userRole, userId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-6 w-24 bg-muted rounded"></div>
              <div className="h-6 w-6 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded mt-1"></div>
              <div className="h-4 w-32 bg-muted rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCases}</div>
          <p className="text-xs text-muted-foreground">All active and closed cases</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingHearings}</div>
          <p className="text-xs text-muted-foreground">Hearings scheduled soon</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.closedCases}</div>
          <p className="text-xs text-muted-foreground">Successfully resolved cases</p>
        </CardContent>
      </Card>
    </div>
  );
}
