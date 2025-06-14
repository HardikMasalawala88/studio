
"use client";

import { useEffect, useState, useRef } from "react";
import type { Case, AuthUser } from "@/lib/types";
import { getDailyHearings } from "@/lib/caseService"; 
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Printer, CalendarDays, Briefcase, User, Edit } from "lucide-react";
import { format } from "date-fns";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UpdateHearingDialog } from "./UpdateHearingDialog"; 

export function HearingReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hearings, setHearings] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedCaseForUpdate, setSelectedCaseForUpdate] = useState<Case | null>(null);

  const fetchHearings = async () => {
    if (user && user.role === USER_ROLES.ADVOCATE) {
      setLoading(true);
      const fetchedHearings = await getDailyHearings(user.uid, today);
      setHearings(fetchedHearings);
      setLoading(false);
    } else if (user) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, [user]);

  const handleOpenUpdateDialog = (caseItem: Case) => {
    setSelectedCaseForUpdate(caseItem);
    setIsUpdateDialogOpen(true);
  };

  const handleHearingUpdated = (updatedCase: Case) => {
    // Refresh the list of hearings for today
    setHearings(prev => prev.map(h => h.caseId === updatedCase.caseId ? updatedCase : h).filter(h => new Date(h.hearingDate).toDateString() === today.toDateString() && h.status !== "Closed"));
    fetchHearings(); // Re-fetch to get the most accurate list for today
  };

  const handlePrint = () => {
    if (!reportRef.current || !user) {
      toast({ title: "Error", description: "Cannot initiate print. Report data or user context is missing.", variant: "destructive" });
      return;
    }

    const tableNode = reportRef.current.querySelector('.printable-report-table');
    if (!tableNode) {
      toast({ title: "Error", description: "Printable content not found.", variant: "destructive" });
      return;
    }
    const printContents = tableNode.outerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) {
      toast({ title: "Error", description: "Could not create print frame.", variant: "destructive" });
      document.body.removeChild(iframe);
      return;
    }

    frameDoc.open();
    frameDoc.write(\`
      <html>
        <head>
          <title>Daily Hearing Report - \${format(today, "PPP")}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; margin: 20px; color: #333333; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 10pt; }
            th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; word-break: break-word; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1, h2, p { margin: 0 0 10px 0; }
            .print-header { text-align: center; margin-bottom: 20px; }
            ul { padding-left: 20px; margin: 0; }
            li { margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>\${APP_NAME}</h1>
            <h2>Daily Hearing Report</h2>
            <p>Date: \${format(today, "PPP")}</p>
            <p>Advocate: \${user.firstName} \${user.lastName}</p>
          </div>
          \${printContents}
        </body>
      </html>
    \`);
    frameDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus(); 
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Print error:", e);
        toast({ title: "Print Failed", description: "An error occurred while trying to print.", variant: "destructive"});
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
             document.body.removeChild(iframe);
          }
        }, 1000); 
      }
    }, 250);
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

  if (user?.role !== USER_ROLES.ADVOCATE) {
    return <p>This report is only available for advocates.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
         <h2 className="text-xl font-semibold">Today&apos;s Hearings - {format(today, "PPP")}</h2>
        <Button onClick={handlePrint} disabled={hearings.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      {hearings.length === 0 ? (
        <Card className="no-print">
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
          <table className="hidden print:table w-full printable-report-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Case Title</th>
                <th>Client Name</th>
                <th>Status</th>
                <th>Brief Notes (Last 2 from Hearing History)</th>
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
                    {hearing.hearingHistory && hearing.hearingHistory.length > 0 ? (
                        <ul>
                        {hearing.hearingHistory.slice(-2).filter(h => h.notes).map((histEntry, index) => (
                            <li key={index}>{histEntry.notes}</li>
                        ))}
                        </ul>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-4 no-print">
            {hearings.map((hearing) => (
              <Card key={hearing.caseId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{hearing.title}</CardTitle>
                      <CardDescription>
                        Hearing Time: {format(new Date(hearing.hearingDate), "p")}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenUpdateDialog(hearing)}>
                      <Edit className="mr-2 h-4 w-4" /> Update Hearing
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground" /> Client: <span className="font-medium ml-1">{hearing.clientName}</span></p>
                  <p className="text-sm flex items-center"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> Current Status: <span className="font-medium ml-1">{hearing.status}</span></p>
                  <div>
                    <h4 className="text-sm font-semibold mt-2">Recent Notes (General):</h4>
                    {hearing.notes && hearing.notes.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-muted-foreground pl-2 max-h-20 overflow-y-auto">
                        {hearing.notes.slice(-3).map((note, index) => (
                          <li key={index} className="truncate">{note.message}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No general notes available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {selectedCaseForUpdate && user && (
        <UpdateHearingDialog
          isOpen={isUpdateDialogOpen}
          onClose={() => {
            setIsUpdateDialogOpen(false);
            setSelectedCaseForUpdate(null);
          }}
          caseToUpdate={selectedCaseForUpdate}
          currentUser={user as AuthUser} // user is checked for advocate role, so it should be AuthUser
          onHearingUpdated={handleHearingUpdated}
        />
      )}
    </div>
  );
}
