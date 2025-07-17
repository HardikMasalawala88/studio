"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  PlusCircle,
  Edit,
  UserX,
  UserCheck,
  Search,
  Users2,
} from "lucide-react";

import ApiService from "@/api/apiService";
import { USER_ROLES } from "@/lib/constants";
import { AuthUser } from "@/lib/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ClientForm } from "./ClientForm";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { UserFormValues, ClientData } from "@/lib/model";
import { useAuth } from "@/context/AuthContext";

export function ClientList() {
  const { toast } = useToast();
  const { user } = useAuth();
  // const [clients, setClients] = useState<UserFormValues[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | undefined>();
  // const [editingClient, setEditingClient] = useState<
  //   UserFormValues | undefined
  // >(undefined);

  useEffect(() => {
    loadClients();
  }, []);
  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await ApiService.listClients();
      const data = response.data;

      const allClients: ClientData[] = data.map((client: any) => ({
        id: client.id || client.user?._id,
        createdBy: client.createdBy,
        modifiedBy: client.modifiedBy,
        createdAt: client.createdAt,
        modifiedAt: client.modifiedAt,
        cases: client.cases ?? [],
        user: {
          ...client.user,
          uid: client.id || client.user?._id,
          phone: client.user.phone ?? "",
          isActive: client.user.isActive ?? true, // or from `client.user.isActive`
        },
      }));
      // setClients(allClients);
      const filterByAdvocate =
        user?.role === "Advocate"
          ? allClients.filter((c) => c.user.createdBy === user.email)
          : allClients;
      setClients(filterByAdvocate);
    } catch (error: any) {
      toast({
        title: "Error loading clients",
        description: error?.response?.data?.detail || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const user = client.user;
      if (!user) return false;

      const term = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [clients, searchTerm]);

  const handleOpenForm = (client?: ClientData) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingClient(undefined);
    setIsFormOpen(false);
  };

  const handleClientSaved = (savedClient: ClientData) => {
    if (editingClient) {
      setClients((prev) =>
        prev.map((c) => (c.id === savedClient.id ? savedClient : c))
      );
    } else {
      setClients((prev) => [savedClient, ...prev]);
    }
    loadClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients by name or email..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenForm()} className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-full mb-4" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <Users2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Clients Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length === 0
              ? "You haven't added any clients yet."
              : "Try adjusting your search."}
          </p>
          {clients.length === 0 && (
            <Button className="mt-6" onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Client
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id || client.user.uid || client.user.email}
                >
                  <TableCell>
                    {client.user.firstName} {client.user.lastName}
                  </TableCell>
                  <TableCell>{client.user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={client.user.isActive ? "default" : "destructive"}
                    >
                      {client.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {client.createdAt
                      ? format(new Date(client.createdAt), "PP")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {client.user.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {client.user.isActive
                                ? `Deactivate ${client.user.firstName}?`
                                : `Activate ${client.user.firstName}?`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                const newStatus = !client.user.isActive;
                                try {
                                  await ApiService.updateClientStatus(
                                    client.id,
                                    newStatus
                                  );
                                  toast({
                                    title: `Client ${
                                      newStatus ? "Activated" : "Deactivated"
                                    }`,
                                  });

                                  // Update state
                                  setClients((prev) =>
                                    prev.map((c) =>
                                      c.id === client.id
                                        ? {
                                            ...c,
                                            user: {
                                              ...c.user,
                                              isActive: newStatus,
                                            },
                                          }
                                        : c
                                    )
                                  );
                                } catch (err) {
                                  toast({
                                    title: "Error updating status",
                                    description: "Something went wrong",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isFormOpen && (
        <ClientForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          initialData={editingClient}
          onClientSaved={handleClientSaved}
        />
      )}
    </div>
  );
}
