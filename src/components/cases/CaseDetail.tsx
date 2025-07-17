"use client";

// import type { Case, CaseDocument, Note, HearingEntry } from "@/lib/types";
import type { Case, CaseDocument, Note } from "@/lib/model";
import React, { useEffect, useState } from "react";
import { getCaseById } from "@/lib/caseService";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarDays,
  User,
  Users,
  FileText,
  Edit,
  ArrowLeft,
  Paperclip,
  Download,
  History,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { DocumentUpload } from "./DocumentUpload";
import { CaseNotes } from "./CaseNotes";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES } from "@/lib/constants";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import ApiService from "@/api/apiService";

export function CaseDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientEmail, setClientEmail] = useState<string>("Loading...");
  const [advocateEmail, setAdvocateEmail] = useState<string>("Loading...");

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getCase(caseId);
        const data = response.data;

        // Normalize backend data to match frontend structure
        const normalizedData: Case = {
          id: data.id,
          caseTitle: data.caseTitle,
          caseDetail: data.caseDetail,
          caseStatus: data.caseStatus,
          hearingDate: data.hearingDate,
          filingDate: data.filingDate,
          clientId: data.clientId,
          advocateId: data.advocateId,
          caseDocuments: data.caseDocuments || [],
          caseNumber: data.caseNumber,
          caseParentId: data.caseParentId,
          courtLocation: data.courtLocation,
          opponant: data.opponant,
          oppositeAdvocate: data.oppositeAdvocate,
          caseRemark: data.caseRemark,
          hearingHistory: data.hearingHistory || [],
          notes: data.notes || [],
        };

        setCaseData(normalizedData);

        // Fetch client email
        if (data.clientId) {
          try {
            const clientRes = await ApiService.getClient(data.clientId);
            const clientData = clientRes.data;
            const clientname =
              clientData?.user?.firstName + " " + clientData?.user?.lastName;
            setClientEmail(clientname ?? "Unknown Client");
          } catch {
            setClientEmail("Unknown Client");
          }
        }

        // Fetch advocate email
        if (data.advocateId) {
          try {
            const advocateRes = await ApiService.getAdvocate(data.advocateId);
            const advocateData = advocateRes.data;
            const advocateName =
              advocateData?.firstName + " " + advocateData?.lastName;
            setAdvocateEmail(advocateName ?? "Unknown Advocate");
          } catch {
            setAdvocateEmail("Unknown Advocate");
          }
        }
        // if (data.advocateId) {
        //   if (user?.uid === data.advocateId) {
        //     const advocateName = user?.firstName + " " + user?.lastName;
        //     setAdvocateEmail(advocateName ?? "Unknown Advocate");
        //   } else {
        //     setAdvocateEmail("Unknown Advocate");
        //   }
        // }
      } catch (error) {
        console.error("Error fetching case:", error);
        setError("Failed to load case details.");
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const handleNoteAdded = (newNote: Note) => {
    setCaseData((prev) =>
      prev ? { ...prev, notes: [...(prev.notes || []), newNote] } : null
    );
  };

  const handleDocumentUploaded = (newDocument: CaseDocument) => {
    setCaseData((prev) =>
      prev
        ? { ...prev, documents: [...(prev.caseDocuments || []), newDocument] }
        : null
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/4 mb-8" />
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-40 w-full mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}{" "}
          <Button variant="link" onClick={() => router.push("/cases")}>
            Go back to cases.
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!caseData) {
    return <p className="mt-4">No case data available.</p>;
  }

  const canEdit =
    user?.role === USER_ROLES.ADVOCATE || user?.role === USER_ROLES.ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        title={caseData.caseTitle}
        description={`Case ID: ${caseData.id} | Current Status: ${caseData.caseStatus}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {canEdit && (
              <Button asChild>
                <Link href={`/case/${caseData.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Case
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          icon={<CalendarDays />}
          title="Next Hearing Date"
          value={format(new Date(caseData.hearingDate), "PPp")}
        />
        <InfoCard icon={<User />} title="Client" value={clientEmail} />
        <InfoCard icon={<Users />} title="Advocate" value={advocateEmail} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Overview</CardTitle>
          <CardDescription>
            Created on: {format(new Date(caseData.filingDate), "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {caseData.caseDetail}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" />
            Case Hearing History
          </CardTitle>
          <CardDescription>
            Chronological record of all hearings and status updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {caseData.hearingHistory && caseData.hearingHistory.length > 0 ? (
            <ScrollArea className="h-[300px] w-full">
              <div className="space-y-4 pr-4">
                {caseData.hearingHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-md bg-muted/50 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {format(new Date(entry.hearingDate), "PPP")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(entry.createdAt || entry.hearingDate),
                            "PPP"
                          )}
                        </span>
                      </div>

                      {entry.note && (
                        <div className="text-sm whitespace-pre-wrap border-l-2 border-primary/50 pl-3 py-1 text-muted-foreground">
                          {entry.note}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Updated by:{" "}
                        <span className="font-medium">
                          {entry.updatedBy || "Unknown"}
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hearing history recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Attached files related to this case.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {caseData.caseDocuments && caseData.caseDocuments.length > 0 ? (
              <ul className="space-y-2">
                {caseData.caseDocuments.map((doc, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span>{doc.fileName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      disabled={doc.url === "#"}
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.fileName}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet.
              </p>
            )}
          </CardContent>
          {canEdit && (
            <CardContent className="border-t pt-4">
              {/* <DocumentUpload
                caseId={caseData.id}
                onDocumentUploaded={handleDocumentUploaded}
              /> */}
            </CardContent>
          )}
        </Card>

        <CaseNotes
          caseId={caseData.id}
          initialNotes={caseData.notes || []}
          onNoteAdded={handleNoteAdded}
        />
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactElement;
  title: string;
  value: string;
}

function InfoCard({ icon, title, value }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.cloneElement(icon, {
          className: "h-4 w-4 text-muted-foreground",
        })}
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
