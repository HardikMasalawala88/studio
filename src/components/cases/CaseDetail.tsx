"use client";

import type { Case, CaseDocument, Note } from "@/lib/types";
import { useEffect, useState } from "react";
import { getCaseById } from "@/lib/caseService";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, User, Users, FileText, Edit, ArrowLeft, Paperclip, Download } from "lucide-react";
import { format } from "date-fns";
import { DocumentUpload } from "./DocumentUpload";
import { CaseNotes } from "./CaseNotes";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES }
 from "@/lib/constants";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function CaseDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (caseId) {
      setLoading(true);
      getCaseById(caseId)
        .then(data => {
          if (data) {
            setCaseData(data);
          } else {
            setError("Case not found.");
          }
        })
        .catch(() => setError("Failed to load case details."))
        .finally(() => setLoading(false));
    }
  }, [caseId]);

  const handleNoteAdded = (newNote: Note) => {
    setCaseData(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
  };

  const handleDocumentUploaded = (newDocument: CaseDocument) => {
    setCaseData(prev => prev ? { ...prev, documents: [...prev.documents, newDocument] } : null);
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
        </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error} <Button variant="link" onClick={() => router.push('/cases')}>Go back to cases.</Button></AlertDescription>
      </Alert>
    );
  }

  if (!caseData) {
    return <p className="mt-4">No case data available.</p>;
  }

  const canEdit = user?.role === USER_ROLES.ADVOCATE || user?.role === USER_ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        title={caseData.title}
        description={`Case ID: ${caseData.caseId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            {canEdit && (
              <Button asChild>
                <Link href={`/case/${caseData.caseId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Case
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard icon={<CalendarDays />} title="Hearing Date" value={format(new Date(caseData.hearingDate), "PPPp")} />
        <InfoCard icon={<User />} title="Client" value={caseData.clientName || caseData.clientId} />
        <InfoCard icon={<Users />} title="Advocate" value={caseData.advocateName || caseData.advocateId} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Case Overview</CardTitle>
          <div className="flex justify-between items-center">
            <CardDescription>Created on: {format(new Date(caseData.createdOn), "PPP")}</CardDescription>
            <Badge variant={caseData.status === "Upcoming" ? "default" : caseData.status === "On Hold" ? "secondary" : "outline"}>
              {caseData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.description}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Attached files related to this case.</CardDescription>
            </CardHeader>
            <CardContent>
                {caseData.documents.length > 0 ? (
                <ul className="space-y-2">
                    {caseData.documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-primary" />
                            <span>{doc.name}</span>
                        </div>
                        {/* In a real app, doc.url would be a Firebase Storage URL */}
                        <Button variant="ghost" size="sm" asChild disabled={doc.url === "#"}>
                           <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.name}>
                             <Download className="h-4 w-4 mr-1" /> Download
                           </a>
                        </Button>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                )}
            </CardContent>
            {canEdit && (
                <CardContent className="border-t pt-4">
                     <DocumentUpload caseId={caseData.caseId} onDocumentUploaded={handleDocumentUploaded} />
                </CardContent>
            )}
        </Card>
        
        <CaseNotes caseId={caseData.caseId} initialNotes={caseData.notes} onNoteAdded={handleNoteAdded} />
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
                {React.cloneElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
            </CardHeader>
            <CardContent>
                <div className="text-lg font-semibold">{value}</div>
            </CardContent>
        </Card>
    );
}
