"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ALL_USER_ROLES, USER_ROLES, UserRole } from "@/lib/constants";
import type { AuthUser, UserFormValues } from "@/lib/types";
import { createUser, updateUser, getAssignableRoles } from "@/lib/userService";
import { useToast } from "@/hooks/use-toast";

const baseSchema = {
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  role: z.nativeEnum(USER_ROLES),
};

const createFormSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const editFormSchema = z.object(baseSchema);


interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AuthUser; // For editing
  onUserSaved: (user: AuthUser) => void;
}

export function UserForm({ isOpen, onClose, initialData, onUserSaved }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [assignableRoles, setAssignableRoles] = useState<UserRole[]>([]);
  
  const currentFormSchema = initialData ? editFormSchema : createFormSchema;
  type CurrentFormValues = z.infer<typeof currentFormSchema>;

  const form = useForm<CurrentFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: initialData 
      ? { 
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          email: initialData.email,
          phone: initialData.phone || "",
          role: initialData.role,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: USER_ROLES.CLIENT, // Default to client
          password: "",
          confirmPassword: "",
        },
  });

  useEffect(() => {
    async function fetchRoles() {
      const roles = await getAssignableRoles();
      setAssignableRoles(roles);
    }
    fetchRoles();
  }, []);
  
  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset(initialData 
        ? { 
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            email: initialData.email,
            phone: initialData.phone || "",
            role: initialData.role,
          } 
        : {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: USER_ROLES.CLIENT,
            password: "", // Important for create mode
            confirmPassword: "", // Important for create mode
          }
      );
    }
  }, [isOpen, initialData, form]);


  async function onSubmit(values: CurrentFormValues) {
    setIsLoading(true);
    try {
      let savedUser: AuthUser | undefined;
      if (initialData) {
        savedUser = await updateUser(initialData.uid, values as UserFormValues); // Cast needed as password fields are not in editFormSchema
        toast({ title: "User Updated", description: "User details have been successfully updated." });
      } else {
        savedUser = await createUser(values as UserFormValues); // Cast as values include password
        toast({ title: "User Created", description: "The new user has been successfully created." });
      }
      if (savedUser) {
        onUserSaved(savedUser);
      }
      onClose(); // Close dialog on success
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Failed to ${initialData ? 'update' : 'create'} user.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{initialData ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this user.' : 'Fill in the form to add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input placeholder="John" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl><Input type="tel" placeholder="123-456-7890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!initialData && ( // Password fields only for new user creation
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignableRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Save Changes' : 'Create User'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
