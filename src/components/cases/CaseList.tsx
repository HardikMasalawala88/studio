
"use client";

import type { Case } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCases, deleteCase as deleteCaseService } from "@/lib/caseService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye, Search, Filter, Briefcase, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CASE_STATUSES, CASE_STATUSES, USER_ROLES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CaseList() {
  const { user, isSubscriptionActive } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>(""); // YYYY-MM-DD

  const canManageCases = user?.role === USER_ROLES.SUPER_ADMIN || (user?.role === USER_ROLES.ADVOCATE && isSubscriptionActive);
  const isAdvocateWithExpiredSubscription = user?.role === USER_ROLES.ADVOCATE && !isSubscriptionActive;


  useEffect(() => {
    async function loadCases() {
      if (user) {
        setLoading(true);
        const fetchedCases = await getCases(user.uid, user.role);
        setCases(fetchedCases);
        setLoading(false);
      }
    }
    loadCases();
  }, [user]);

  const filteredCases = useMemo(() => {
    return cases
      .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(c => statusFilter === "all" || c.status === statusFilter)
      .filter(c => {
        if (!dateFilter) return true;
        try {
          const filterDate = new Date(dateFilter + "T00:00:00"); 
          return (
            c.hearingDate.getFullYear() === filterDate.getFullYear() &&
            c.hearingDate.getMonth() === filterDate.getMonth() &&
            c.hearingDate.getDate() === filterDate.getDate()
          );
        } catch (e) { return true; } 
      });
  }, [cases, searchTerm, statusFilter, dateFilter]);

  const handleDeleteCase = async (caseId: string) => {
    if (!canManageCases) {
        toast({ title: "Action Denied", description: "Your subscription does not allow this action.", variant: "destructive" });
        return;
    }
    const success = await deleteCaseService(caseId);
    if (success) {
      setCases(prevCases => prevCases.filter(c => c.caseId !== caseId));
      toast({ title: "Case Deleted", description: "The case has been successfully deleted." });
    } else {
      toast({ title: "Error", description: "Failed to delete case.", variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case CASE_STATUSES.UPCOMING: return "default";
      case CASE_STATUSES.ON_HOLD: return "secondary";
      case CASE_STATUSES.CLOSED: return "outline";
      default: return "default";
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-1/4" />
           <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {isAdvocateWithExpiredSubscription && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription Expired</AlertTitle>
          <AlertDescription>
            Your subscription has expired. You can view and print cases, but add, edit, or delete features are disabled. 
            Please <Link href="/subscription" className="font-medium underline">renew your subscription</Link> to regain full access.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cases by title..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ALL_CASE_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-full sm:w-auto"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by hearing date"
          />
        </div>
        {user?.role !== USER_ROLES.CLIENT && (
           <Button asChild className="w-full md:w-auto" disabled={!canManageCases && user?.role === USER_ROLES.ADVOCATE}>
            <Link href="/cases/new">
              <PlusCircle className="mr-2 h-4 w-4" /> New Case
            </Link>
          </Button>
        )}
      </div>

      {filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Cases Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {cases.length === 0 ? "You don't have any cases yet." : "Try adjusting your search or filters."}
          </p>
          {user?.role !== USER_ROLES.CLIENT && cases.length === 0 && (
            <Button className="mt-6" asChild disabled={!canManageCases && user?.role === USER_ROLES.ADVOCATE}>
              <Link href="/cases/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Case
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                {user?.role !== USER_ROLES.CLIENT && <TableHead>Client</TableHead>}
                {user?.role !== USER_ROLES.ADVOCATE && <TableHead>Advocate</TableHead>}
                <TableHead>Hearing Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((c) => (
                <TableRow key={c.caseId}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  {user?.role !== USER_ROLES.CLIENT && <TableCell>{c.clientName || 'N/A'}</TableCell>}
                  {user?.role !== USER_ROLES.ADVOCATE && <TableCell>{c.advocateName || 'N/A'}</TableCell>}
                  <TableCell>{format(new Date(c.hearingDate), "PPp")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="View Case">
                        <Link href={`/case/${c.caseId}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      {user?.role !== USER_ROLES.CLIENT && (
                        <>
                          <Button variant="ghost" size="icon" asChild title="Edit Case" disabled={!canManageCases}>
                            <Link href={`/case/${c.caseId}/edit`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete Case" className="text-destructive hover:text-destructive" disabled={!canManageCases}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the case titled &quot;{c.title}&quot;.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCase(c.caseId)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
