
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES, UserRole, APP_NAME } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { UserFormValues } from "@/lib/types";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  role: z.nativeEnum(USER_ROLES).default(USER_ROLES.CLIENT),
  advocateEnrollmentNumber: z.string().optional(),
  confirmIndiaAdvocate: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.role === USER_ROLES.ADVOCATE) {
    if (!data.advocateEnrollmentNumber || data.advocateEnrollmentNumber.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Advocate enrolment certificate number is required.",
        path: ["advocateEnrollmentNumber"],
      });
    }
    if (data.confirmIndiaAdvocate !== true) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please confirm you are an advocate practicing in India.",
        path: ["confirmIndiaAdvocate"],
      });
    }
  }
});

export function SignupForm() {
  const { signup, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: USER_ROLES.CLIENT,
      advocateEnrollmentNumber: "",
      confirmIndiaAdvocate: false,
    },
  });

  const roleWatcher = form.watch("role");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Ensure UserFormValues type is passed to signup
    const signupData: UserFormValues = {
        ...values,
        // isActive is true by default for new signups, handled in AuthContext/userService
    };
    await signup(signupData);
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Create an Account with {APP_NAME}</CardTitle>
        <CardDescription>Join us to manage your cases efficiently.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register as</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={USER_ROLES.CLIENT}>Client</SelectItem>
                      <SelectItem value={USER_ROLES.ADVOCATE}>Advocate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {roleWatcher === USER_ROLES.ADVOCATE && (
              <>
                <FormField
                  control={form.control}
                  name="advocateEnrollmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advocate Enrolment Certificate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MAH/1234/2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmIndiaAdvocate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I confirm that I am an advocate practicing in India and agree to the Terms of Service.
                        </FormLabel>
                         <FormDescription className="text-xs">
                           Subscriptions and services are currently available for Indian advocates only.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" passHref>
            <Button variant="link" className="p-0 h-auto">Login</Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
