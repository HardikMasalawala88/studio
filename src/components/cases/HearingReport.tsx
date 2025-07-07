"use client";

import { useEffect, useState, useRef } from "react";
import type { Case } from "@/lib/model";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Printer, CalendarDays, Briefcase, User, Edit } from "lucide-react";
import { format } from "date-fns";
import { APP_NAME, USER_ROLES, UserRole } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UpdateHearingDialog } from "./UpdateHearingDialog";
import ApiService from "@/api/apiService";

export function HearingReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hearings, setHearings] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedCaseForUpdate, setSelectedCaseForUpdate] =
    useState<Case | null>(null);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});

  const fetchHearings = async () => {
    if (user && user.role === USER_ROLES.ADVOCATE) {
      setLoading(true);
      try {
        const res = await ApiService.listCases();
        const fetchedCases: Case[] = res.data.map((item: any) => ({
          ...item,
          hearingDate: new Date(item.hearingDate),
        }));

        const todaysCases = fetchedCases.filter(
          (c) =>
            new Date(c.hearingDate).toDateString() === today.toDateString() &&
            c.advocateId === user.uid
        );

        setHearings(todaysCases);

        const uniqueClientIds = Array.from(
          new Set(todaysCases.map((c) => c.clientId))
        );

        const clientNameMap: Record<string, string> = {};
        await Promise.all(
          uniqueClientIds.map(async (clientId) => {
            try {
              const clientRes = await ApiService.getClient(clientId);
              const clientData = clientRes.data;
              const fullName = `${clientData?.user?.firstName || ""} ${
                clientData?.user?.lastName || ""
              }`.trim();
              clientNameMap[clientId] = fullName || "Unknown Client";
            } catch (err) {
              clientNameMap[clientId] = "Unknown Client";
              console.error(`Failed to fetch client for ID ${clientId}:`, err);
            }
          })
        );

        setClientNames(clientNameMap);
      } catch (error) {
        toast({
          title: "Error loading hearings",
          description: "Unable to fetch today's hearings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else if (user) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, [user]);

  const handleOpenUpdateDialog = (caseItem: Case) => {
    setSelectedCaseForUpdate(caseItem);
    setUpdatingCaseId(caseItem.id);
    setIsUpdateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsUpdateDialogOpen(false);
    setSelectedCaseForUpdate(null);
    setUpdatingCaseId(null);
  };

  // const handleHearingUpdated = (updatedCase: Case) => {
  //   setHearings((prev) =>
  //     prev
  //       .map((h) => (h.id === updatedCase.id ? updatedCase : h))
  //       .filter(
  //         (h) =>
  //           new Date(h.hearingDate).toDateString() === today.toDateString() &&
  //           h.caseStatus !== "Closed"
  //       )
  //   );
  //   fetchHearings();
  // };

  const handleHearingUpdated = (updatedCase: Case) => {
    setHearings((prev) =>
      prev.map((h) => (h.id === updatedCase.id ? updatedCase : h))
    );
    fetchHearings();
  };

  const handlePrint = () => {
    if (!reportRef.current || !user) return;

    const printContents = reportRef.current.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) return;

    frameDoc.open();
    frameDoc.write(`
      <html>
        <head>
          <title>Daily Hearing Report - ${format(today, "PPP")}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${APP_NAME}</h1>
          <h2>Daily Hearing Report - ${format(today, "PPP")}</h2>
          ${printContents}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-24 ml-auto" />
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
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
        <h2 className="text-xl font-semibold mr-2">
          Today's Hearings - {format(today, "PPP")}
        </h2>
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
                <th>Case</th>
                <th>Client</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {hearings.map((hearing) => (
                <tr key={hearing.id}>
                  <td>{format(new Date(hearing.hearingDate), "p")}</td>
                  <td>{hearing.caseTitle}</td>
                  <td>{clientNames[hearing.clientId] || "Unknown"}</td>
                  <td>{hearing.caseStatus}</td>
                  <td></td>
                  {/* <td>
                    {hearing.hearingHistory
                      ?.slice(-2)
                      .map((h, i) => <div key={i}>{h.note}</div>) || "N/A"}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-4 no-print">
        {hearings.map((hearing) => (
          <Card key={hearing.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="mb-2">{hearing.caseTitle}</CardTitle>
                  <CardDescription>
                    Hearing Time: {format(new Date(hearing.hearingDate), "p")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenUpdateDialog(hearing)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Update Hearing
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                Client:{" "}
                <span className="font-medium ml-1">
                  {clientNames[hearing.clientId] || "Unknown"}
                </span>
              </p>
              <p className="text-sm flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                Current Status:{" "}
                <span className="font-medium ml-1">{hearing.caseStatus}</span>
              </p>
              <div>
                <h4 className="text-sm font-semibold mt-2">Recent Notes:</h4>
                {(hearing.hearingHistory?.length ?? 0) > 0 ? (
                  <ul className="list-disc list-inside text-xs text-muted-foreground pl-2 max-h-20 overflow-y-auto">
                    {hearing.hearingHistory!.slice(-3).map((note, index) => (
                      <li key={index} className="truncate">
                        {note.note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No notes available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCaseForUpdate && user && (
        <UpdateHearingDialog
          isOpen={isUpdateDialogOpen}
          onClose={handleDialogClose}
          caseToUpdate={selectedCaseForUpdate}
          currentUser={{
            ...user,
            createdOn: new Date(user.createdOn),
            role: user.role as UserRole,
          }}
          onHearingUpdated={handleHearingUpdated}
        />
      )}
    </div>
  );
}
