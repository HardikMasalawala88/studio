"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import ApiService from "@/api/apiService";
import { USER_ROLES } from "@/lib/constants";
import type { ClientData, UserFormValues } from "@/lib/model";
import { createDeflate } from "zlib";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ClientData; // From GET /clients/:id
  onClientSaved: (client: ClientData) => void;
}

// Zod schemas
const createSchema = z.object({
  user: z
    .object({
      firstName: z
        .string()
        .min(1, { message: "First name is required." })
        .regex(/^[A-Za-z\s]+$/, {
          message: "First name must contain only letters.",
        }),

      lastName: z
        .string()
        .min(1, { message: "Last name is required." })
        .regex(/^[A-Za-z\s]+$/, {
          message: "Last name must contain only letters.",
        }),

      email: z.string().email("Invalid email."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      confirmPassword: z.string(),
      isActive: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
});

const updateSchema = z.object({
  user: z.object({
    firstName: z
      .string()
      .min(1, { message: "First name is required." })
      .regex(/^[A-Za-z\s]+$/, {
        message: "First name must contain only letters.",
      }),

    lastName: z
      .string()
      .min(1, { message: "Last name is required." })
      .regex(/^[A-Za-z\s]+$/, {
        message: "Last name must contain only letters.",
      }),

    email: z.string().email("Invalid email."),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    isActive: z.boolean(),
  }),
});

export function ClientForm({
  isOpen,
  onClose,
  initialData,
  onClientSaved,
}: ClientFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentSchema = initialData ? updateSchema : createSchema;
  type FormType = z.infer<typeof currentSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      user: {
        firstName: initialData?.user?.firstName ?? "",
        lastName: initialData?.user?.lastName ?? "",
        email: initialData?.user?.email ?? "",
        password: initialData?.user?.password ?? "",
        confirmPassword: initialData?.user?.confirmPassword ?? "",
        isActive: initialData?.user?.isActive ?? true,
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        user: {
          firstName: initialData?.user?.firstName ?? "",
          lastName: initialData?.user?.lastName ?? "",
          email: initialData?.user?.email ?? "",
          password: initialData?.user?.confirmPassword ?? "",
          confirmPassword: initialData?.user?.confirmPassword ?? "",
          isActive: initialData?.user?.isActive ?? true,
        },
      });
    }
  }, [isOpen, initialData, form]);

  async function onSubmit(values: FormType) {
    setIsLoading(true);
    try {
      let response;

      const userPayload: UserFormValues = {
        // uid: initialData?.user.uid,
        ...values.user,
        username: values.user.email,
        role: USER_ROLES.CLIENT,
        password: initialData
          ? initialData.user.password
          : values.user.password,
        confirmPassword: initialData
          ? initialData.user.confirmPassword
          : values.user.confirmPassword,
        createdBy: initialData ? initialData.user.createdBy : user?.email,
        modifiedBy: initialData?.user?.createdBy,
        createdAt: initialData?.user.createdAt ?? new Date(),
        modifiedAt: new Date(),
        isActive: initialData ? initialData.user.isActive : true,
      };

      if (initialData) {
        // ✅ update-client expects nested "user" and "cases"
        response = await ApiService.updateClient(initialData.id, {
          id: initialData.id,
          user: { ...userPayload, uid: initialData.user.uid },
          modifiedBy: initialData?.user.createdBy,
          modifiedAt: new Date(),
          cases: initialData.cases ?? [],
        });

        toast({
          title: "Client updated",
          description: "Client has been updated successfully.",
        });
      } else {
        // ✅ add-client expects FLAT User object
        response = await ApiService.addClient(userPayload);

        toast({
          title: "Client created",
          description: "Client has been created successfully.",
        });
      }
      const client = response?.data ?? response;
      onClientSaved(client);
      onClose();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      let msg = "Something went wrong.";
      if (Array.isArray(detail)) {
        msg = detail.map((d: any) => d.msg).join("\n");
      } else if (typeof detail === "string") {
        msg = detail;
      } else if (error.message) {
        msg = error.message;
      }

      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update client information."
              : "Fill the details to register a new client."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="user.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!initialData && (
              <>
                <FormField
                  control={form.control}
                  name="user.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user.confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground focus:outline-none"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="user.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user.confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Client" : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
