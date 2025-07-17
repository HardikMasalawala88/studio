"use client";

import type { AuthUser } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
// import { getUsers, deleteUser as deleteUserService } from "@/lib/userService";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_USER_ROLES, UserRole } from "@/lib/constants";
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
import { UserForm } from "./UserForm";
import { Skeleton } from "@/components/ui/skeleton";
import ApiService from "@/api/apiService";

export function UserList() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | undefined>(undefined);
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [subscriptionMap, setSubscriptionMap] = useState<Record<string, boolean>>({});

  async function loadUsers() {
    setLoading(true);
    const response = await ApiService.listUsers();
    const fetchedUsers = response.data.map((user: any) => ({
      uid: user.uid || user._id || "",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone || "",
      isActive: user.isActive ?? true,
      createdOn: user.createdAt || user.createdOn || null,
    }));
    setUsers(fetchedUsers);
    setLoading(false);
  }

  const loadUserSubscriptions = async () => {
    try {
      const { data } = await ApiService.listUserSubscriptions(); // 👈 one call for all
      const map: Record<string, boolean> = {};
      data.forEach((sub: any) => {
        map[sub.userId] = sub.isActive === true;
      });
      setSubscriptionMap(map);
    } catch (error) {
      console.error("Failed to load user subscriptions", error);
    }
  };


  useEffect(() => {
    loadUserSubscriptions();
    loadUsers();
  }, []);

  // const filteredUsers = useMemo(() => {
  //   return users
  //     .filter(u =>
  //       u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       u.email.toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //     .filter(u => roleFilter === "all" || u.role === roleFilter);
  // }, [users, searchTerm, roleFilter]);

  const filteredUsers = useMemo(() => {
    return users
      .filter(u =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(u => roleFilter === "all" || u.role === roleFilter)
      .filter(user => {
        if (subscriptionFilter === "all") return true;
        if (user.role !== "Advocate") return false; // 👈 only Advocates are filtered
        const isActive = subscriptionMap[user.uid];
        return subscriptionFilter === "active" ? isActive === true : isActive === false;
      });
  }, [users, searchTerm, roleFilter, subscriptionFilter]);

  const handleDeleteUser = async (userId: string) => {
    const success = await ApiService.deleteUser(userId);
    if (success) {
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== userId));
      loadUsers();
      toast({ title: "User Deleted", description: "The user has been successfully deleted." });
    } else {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
  };

  const handleOpenForm = (user?: AuthUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingUser(undefined);
    setIsFormOpen(false);
  };

  const handleUserSaved = (savedUser: AuthUser) => {
    if (editingUser) { // If editing
      setUsers(prev => prev.map(u => u.uid === savedUser.uid ? savedUser : u));
    } else { // If creating new
      setUsers(prev => [savedUser, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
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
            placeholder="Search users by name or email..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select
            value={subscriptionFilter}
            onValueChange={(value) => setSubscriptionFilter(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by subscription" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subscriptions</SelectItem>
              <SelectItem value="active">Active Subscription</SelectItem>
              <SelectItem value="inactive">Inactive Subscription</SelectItem>
            </SelectContent>
          </Select>


          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_USER_ROLES.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <Button onClick={() => handleOpenForm()} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button> */}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Users Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length === 0 ? "There are no users in the system yet." : "Try adjusting your search or filters."}
          </p>
          {/* {users.length === 0 && (
            <Button className="mt-6" onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First User
            </Button>
          )} */}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant={user.role === "Admin" ? "destructive" : "secondary"}>{user.role}</Badge></TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>{user.createdOn ? format(new Date(user.createdOn), "PP") : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit User" onClick={() => handleOpenForm(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete User" className="text-destructive hover:text-destructive" disabled={user.role === "Admin"}> {/* Prevent deleting Admin for safety */}
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user {user.firstName} {user.lastName}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">
                              Delete
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
      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        initialData={editingUser}
        onUserSaved={handleUserSaved}
      />
    </div>
  );
}
