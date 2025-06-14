
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { USER_ROLES } from "@/lib/constants";
import type { AuthUser, UserFormValues } from "@/lib/types"; // Using UserFormValues as base
import { createUser, updateUser } from "@/lib/userService";
import { useToast } from "@/hooks/use-toast";

// Schema for client form - role is fixed, no advocate enrollment number
const baseSchema = {
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  // isActive is handled by activate/deactivate actions, not directly in this form for now.
  // If needed, it can be added: isActive: z.boolean().optional(),
};

const createClientFormSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const editClientFormSchema = z.object(baseSchema);


interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AuthUser; // For editing
  onClientSaved: (client: AuthUser) => void;
}

export function ClientForm({ isOpen, onClose, initialData, onClientSaved }: ClientFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const currentFormSchema = initialData ? editClientFormSchema : createClientFormSchema;
  // Use UserFormValues for the form, but role will be fixed.
  type CurrentFormValues = z.infer<typeof currentFormSchema>;


  const form = useForm<CurrentFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: initialData 
      ? { 
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          email: initialData.email,
          phone: initialData.phone || "",
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "", // Required for create schema
          confirmPassword: "", // Required for create schema
        },
  });
  
  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset(initialData 
        ? { 
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            email: initialData.email,
            phone: initialData.phone || "",
          } 
        : {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
          }
      );
    }
  }, [isOpen, initialData, form]);


  async function onSubmit(values: CurrentFormValues) {
    setIsLoading(true);
    try {
      let savedClient: AuthUser | undefined;
      if (initialData) {
        // When updating, we cast to UserFormValues and ensure role is not changed via this form.
        const updatePayload: Partial<UserFormValues> = { ...values };
        savedClient = await updateUser(initialData.uid, updatePayload);
        toast({ title: "Client Updated", description: "Client details have been successfully updated." });
      } else {
        // When creating, pass full UserFormValues with role set to CLIENT
        const createPayload: UserFormValues = {
            ...values,
            role: USER_ROLES.CLIENT, // Set role explicitly
            isActive: true, // New clients are active by default
        };
        savedClient = await createUser(createPayload);
        toast({ title: "Client Created", description: "The new client has been successfully created." });
      }
      if (savedClient) {
        onClientSaved(savedClient);
      }
      onClose(); // Close dialog on success
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Failed to ${initialData ? 'update' : 'create'} client.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{initialData ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this client.' : 'Fill in the form to add a new client.'}
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
                  <FormControl><Input type="email" placeholder="client@example.com" {...field} /></FormControl>
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
            {!initialData && ( // Password fields only for new client creation
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Set Initial Password</FormLabel>
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
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Save Changes' : 'Create Client'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
