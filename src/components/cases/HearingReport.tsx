"use client";

import { useEffect, useState, useRef } from "react";
import type { Case } from "@/lib/types";
import { getDailyHearings } from "@/lib/caseService"; // Mock service
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Printer, CalendarDays, Briefcase, User } from "lucide-react";
import { format } from "date-fns";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HearingReport() {
  const { user } = useAuth();
  const [hearings, setHearings] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    async function loadHearings() {
      if (user && user.role === "Advocate") {
        setLoading(true);
        const fetchedHearings = await getDailyHearings(user.uid, today);
        setHearings(fetchedHearings);
        setLoading(false);
      } else if (user) { // Non-advocates shouldn't see this, but handle gracefully
        setLoading(false);
      }
    }
    loadHearings();
  }, [user]);

  const handlePrint = () => {
    const printContents = reportRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;
    
    if (printContents) {
      // Temporarily replace body content with report content for printing
      document.body.innerHTML = `
        <html>
          <head>
            <title>Daily Hearing Report - ${format(today, "PPP")}</title>
            <style>
              body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .no-print { display: none !important; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1, h2 { color: #333; }
                .print-header { text-align: center; margin-bottom: 20px; }
                .print-logo { height: 40px; margin-bottom: 10px; } /* Adjust as needed */
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <!-- You can add a logo here if you have one -->
              <!-- <img src="/logo-print.png" alt="${APP_NAME} Logo" class="print-logo" /> -->
              <h1>${APP_NAME}</h1>
              <h2>Daily Hearing Report</h2>
              <p>Date: ${format(today, "PPP")}</p>
              <p>Advocate: ${user?.firstName} ${user?.lastName}</p>
            </div>
            ${printContents}
          </body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents; // Restore original content
      window.location.reload(); // Reload to reapply JS and styles
    }
  };
  
  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-24 ml-auto" />
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  if (user?.role !== "Advocate") {
    return <p>This report is only available for advocates.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-semibold">Today&apos;s Hearings - {format(today, "PPP")}</h2>
        <Button onClick={handlePrint} disabled={hearings.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      {hearings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-semibold">No Hearings Today</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You have no hearings scheduled for today.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div ref={reportRef}>
          {/* This table structure is primarily for the print view.
              The web view uses Cards for better responsiveness and UI. */}
          <table className="hidden print:table w-full"> {/* Hidden by default, shown only for print */}
            <thead>
              <tr>
                <th>Time</th>
                <th>Case Title</th>
                <th>Client Name</th>
                <th>Status</th>
                <th>Brief Notes (Last 2)</th>
              </tr>
            </thead>
            <tbody>
              {hearings.map((hearing) => (
                <tr key={hearing.caseId}>
                  <td>{format(new Date(hearing.hearingDate), "p")}</td>
                  <td>{hearing.title}</td>
                  <td>{hearing.clientName}</td>
                  <td>{hearing.status}</td>
                  <td>
                    {hearing.notes.slice(-2).map(note => note.message).join('; ') || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Web view using Cards */}
          <div className="space-y-4 no-print">
            {hearings.map((hearing) => (
              <Card key={hearing.caseId}>
                <CardHeader>
                  <CardTitle>{hearing.title}</CardTitle>
                  <CardDescription>
                    Hearing Time: {format(new Date(hearing.hearingDate), "p")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground" /> Client: <span className="font-medium ml-1">{hearing.clientName}</span></p>
                  <p className="text-sm flex items-center"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> Status: <span className="font-medium ml-1">{hearing.status}</span></p>
                  <div>
                    <h4 className="text-sm font-semibold mt-2">Recent Notes:</h4>
                    {hearing.notes.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-muted-foreground pl-2 max-h-20 overflow-y-auto">
                        {hearing.notes.slice(-3).map((note, index) => ( // Show last 3 notes
                          <li key={index} className="truncate">{note.message}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No notes available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
