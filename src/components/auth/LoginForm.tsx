// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { useAuth } from "@/context/AuthContext";
// import { Loader2 } from "lucide-react";
// import { APP_NAME } from "@/lib/constants";

// const formSchema = z.object({
//   email: z
//     .string()
//     .min(1, { message: "Email is required." })
//     .email({ message: "Invalid email address." }),

//   password: z
//     .string()
//     .min(1, { message: "Password is required." })
// });

// export function LoginForm() {
//   const { login, loading } = useAuth();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const handleLogin = async () => {
//     const { email, password } = form.getValues();
//     await login(email, password);
//   };

//   return (
//     <Card className="w-full max-w-md shadow-xl">
//       <CardHeader className="text-center">
//         <CardTitle className="text-2xl font-headline">{APP_NAME} Login</CardTitle>
//         <CardDescription>Enter your credentials to access your account-Om-Drashti-caseTracker.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <div className="space-y-6">
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input placeholder="you@example.com" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input type="password" placeholder="••••••••" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button onClick={handleLogin} type="button" className="w-full" disabled={loading}>
//               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Login
//             </Button>
//           </div>
//         </Form>
//       </CardContent>
//       <CardFooter className="flex flex-col space-y-2 text-sm">
//         <Link href="/forgot-password" passHref>
//           <Button variant="link" className="p-0 h-auto font-normal">Forgot password?</Button>
//         </Link>
//         <p className="text-muted-foreground">
//           Don&apos;t have an account?{" "}
//           <Link href="/signup" passHref>
//             <Button variant="link" className="p-0 h-auto">Sign up</Button>
//           </Link>
//         </p>
//       </CardFooter>
//     </Card>
//   );
// }

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." }),

  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ handle login with form validation
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await login(values.email, values.password);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">
          {APP_NAME} Login
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account-Om-Drashti-caseTracker.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        <Link href="/forgot-password" passHref>
          <Button variant="link" className="p-0 h-auto font-normal">
            Forgot password?
          </Button>
        </Link>
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" passHref>
            <Button variant="link" className="p-0 h-auto">
              Sign up
            </Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
