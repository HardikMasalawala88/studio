
"use client";

import type { AuthUser } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { getUsers, deactivateUser, activateUser } from "@/lib/userService";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, UserX, UserCheck, Search, Filter, Users2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { ClientForm } from "./ClientForm";
import { Skeleton } from "@/components/ui/skeleton";
import { USER_ROLES } from "@/lib/constants"; // For filtering clients

export function ClientList() {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]); // Store all users first
  const [clients, setClients] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<AuthUser | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const fetchedUsers = await getUsers();
      setAllUsers(fetchedUsers);
      // Filter for clients from all users
      setClients(fetchedUsers.filter(u => u.role === USER_ROLES.CLIENT));
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredClients = useMemo(() => {
    return clients
      .filter(c => 
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [clients, searchTerm]);

  const handleToggleClientStatus = async (client: AuthUser) => {
    try {
      let updatedClient: AuthUser | undefined;
      if (client.isActive) {
        updatedClient = await deactivateUser(client.uid);
        toast({ title: "Client Deactivated", description: `${client.firstName} ${client.lastName} has been deactivated.` });
      } else {
        updatedClient = await activateUser(client.uid);
        toast({ title: "Client Activated", description: `${client.firstName} ${client.lastName} has been activated.` });
      }
      if (updatedClient) {
        setClients(prevClients => prevClients.map(c => c.uid === updatedClient!.uid ? updatedClient! : c));
      }
    } catch (error: any) {
       toast({ title: "Error", description: error.message || "Failed to update client status.", variant: "destructive" });
    }
  };
  
  const handleOpenForm = (client?: AuthUser) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingClient(undefined);
    setIsFormOpen(false);
  };

  const handleClientSaved = (savedClient: AuthUser) => {
    if (editingClient) { // If editing
      setClients(prev => prev.map(c => c.uid === savedClient.uid ? savedClient : c));
    } else { // If creating new
      setClients(prev => [savedClient, ...prev]);
    }
  };
  
  if (loading) {
     return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-1/4" />
           <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

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

      {filteredClients.length === 0 ? (
         <div className="text-center py-12">
          <Users2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Clients Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length === 0 ? "You haven't added any clients yet." : "Try adjusting your search."}
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
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.uid}>
                  <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={client.isActive ? "default" : "outline"} className={client.isActive ? "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30" : "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.createdOn ? format(new Date(client.createdOn), "PP") : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit Client" onClick={() => handleOpenForm(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title={client.isActive ? "Deactivate Client" : "Activate Client"} 
                            className={client.isActive ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-700"}
                          >
                            {client.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will {client.isActive ? 'deactivate' : 'activate'} the client {client.firstName} {client.lastName}. 
                              {client.isActive ? ' Deactivated clients cannot log in or be assigned to new cases.' : ' Activated clients will regain access.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => handleToggleClientStatus(client)} 
                                className={client.isActive ? "bg-destructive hover:bg-destructive/90" : "bg-green-600 hover:bg-green-700/90 text-white"}
                            >
                              {client.isActive ? 'Deactivate' : 'Activate'}
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
      <ClientForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        initialData={editingClient}
        onClientSaved={handleClientSaved}
      />
    </div>
  );
}
