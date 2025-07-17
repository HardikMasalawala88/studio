"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { USER_ROLES, UserRole, APP_NAME } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { UserFormValues } from "@/lib/model";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const formSchema = z
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

    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    role: z.nativeEnum(USER_ROLES).default(USER_ROLES.ADVOCATE),
    advocate: z
      .object({
        advocateEnrollmentNumber: z.string(),
        // AdvocateUniqueNumber: z.string(),
        Specialization: z.string(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === USER_ROLES.ADVOCATE) {
      const enrollmentNumber = data.advocate?.advocateEnrollmentNumber;
      // const uniqueNumber = data.advocate?.AdvocateUniqueNumber;
      const specialization = data.advocate?.Specialization;

      // Required field validations
      if (!enrollmentNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Advocate enrolment number is required.",
          path: ["advocate", "advocateEnrollmentNumber"],
        });
      } else {
        // Format validation
        const formatRegex = /^[A-Z]\/\d{1,5}\/\d{4}$/;
        if (!formatRegex.test(enrollmentNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enrollment number must be in format 'A/123/2025'.",
            path: ["advocate", "advocateEnrollmentNumber"],
          });
        }
      }

      // if (!data.advocate?.AdvocateUniqueNumber) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message: "Unique advocate number is required.",
      //     path: ["advocate", "AdvocateUniqueNumber"],
      //   });
      // }
      if (!data.advocate?.Specialization) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Specialization is required.",
          path: ["advocate", "Specialization"],
        });
      }
    }
  });

export function SignupForm() {
  const { signup, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: USER_ROLES.ADVOCATE,
      advocate: {
        advocateEnrollmentNumber: "",
        // AdvocateUniqueNumber: "",
        Specialization: "",
      },
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
        <CardTitle className="text-2xl font-headline">
          Create an Account with {APP_NAME}
        </CardTitle>
        <CardDescription>
          Join us to manage your cases efficiently.
        </CardDescription>
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
              name="confirmPassword"
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
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
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
            /> */}
            {/* <FormField
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
            /> */}
            {roleWatcher === USER_ROLES.ADVOCATE && (
              <>
                <FormField
                  control={form.control}
                  name="advocate.advocateEnrollmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advocate Enrollment Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A/123/2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="advocate.AdvocateUniqueNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unique Advocate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BCI123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <FormField
                  control={form.control}
                  name="advocate.Specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Criminal Law" {...field} />
                      </FormControl>
                      <FormMessage />
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
            <Button variant="link" className="p-0 h-auto">
              Login
            </Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
