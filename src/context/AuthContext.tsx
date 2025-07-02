// import type React from "react";
// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from "react";
// import type { AuthUser, UserFormValues, SubscriptionPlan } from "@/lib/types";
// import type { UserRole, SubscriptionPlanId } from "@/lib/constants";
// import { USER_ROLES, SUBSCRIPTION_PLAN_IDS } from "@/lib/constants";
// import { useRouter, usePathname } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// import {
//   getUsers,
//   getUserById,
//   createUser as serviceCreateUser,
//   updateUser as serviceUpdateUser,
//   updateAdvocateSubscription as serviceUpdateSubscription,
//   getSubscriptionPlanById, // Added import
// } from "@/lib/userService";
// import { isUserSubscriptionActive as checkIsSubscriptionActive } from "@/lib/utils";
// import ApiService from "@/api/apiService";

// interface AuthContextType {
//   user: AuthUser | null;
//   loading: boolean;
//   login: (email: string, password?: string) => Promise<void>;
//   signup: (values: UserFormValues) => Promise<void>;
//   logout: () => Promise<void>;
//   updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
//   isSubscriptionActive: boolean;
//   refreshUser: () => Promise<void>;
//   updateSubscription: (planId: SubscriptionPlanId) => Promise<boolean>; // Now takes planId
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const AUTH_STORAGE_KEY = "caseconnect.auth";

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const pathname = usePathname();
//   const { toast } = useToast();

//   const isSubscriptionActive = user ? checkIsSubscriptionActive(user) : false;

//   const refreshUser = useCallback(async () => {
//     if (user) {
//       setLoading(true);
//       const refreshedUser = await getUserById(user.uid);
//       if (refreshedUser) {
//         if (
//           refreshedUser.subscriptionExpiryDate &&
//           typeof refreshedUser.subscriptionExpiryDate === "string"
//         ) {
//           refreshedUser.subscriptionExpiryDate = new Date(
//             refreshedUser.subscriptionExpiryDate
//           );
//         }
//         if (
//           refreshedUser.lastPaymentDate &&
//           typeof refreshedUser.lastPaymentDate === "string"
//         ) {
//           refreshedUser.lastPaymentDate = new Date(
//             refreshedUser.lastPaymentDate
//           );
//         }
//         if (
//           refreshedUser.createdOn &&
//           typeof refreshedUser.createdOn === "string"
//         ) {
//           refreshedUser.createdOn = new Date(refreshedUser.createdOn);
//         }
//         setUser(refreshedUser);
//         localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshedUser));
//       } else {
//         setUser(null);
//         localStorage.removeItem(AUTH_STORAGE_KEY);
//       }
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
//       if (storedUser) {
//         const parsedUser = JSON.parse(storedUser);
//         if (parsedUser.subscriptionExpiryDate) {
//           parsedUser.subscriptionExpiryDate = new Date(
//             parsedUser.subscriptionExpiryDate
//           );
//         }
//         if (parsedUser.lastPaymentDate) {
//           parsedUser.lastPaymentDate = new Date(parsedUser.lastPaymentDate);
//         }
//         if (parsedUser.createdOn) {
//           parsedUser.createdOn = new Date(parsedUser.createdOn);
//         }
//         setUser(parsedUser);
//       }
//     } catch (error) {
//       console.error("Failed to load user from localStorage", error);
//       localStorage.removeItem(AUTH_STORAGE_KEY);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

  // const login = useCallback(async (email: string, _password?: string) => {
  //   debugger
  //   setLoading(true);
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   try {
  //     // const allUsers = await getUsers();
  //     // const foundUser = allUsers.find(u => u.email === email);
  //     //lOGIN API CALL
  //     const response = await ApiService.login({ Username: email, Password: _password ?? '' });

  //      if (response?.data?.message !== 'Login successful') {
  //     throw new Error("Login failed.");
  //   }
  //     const userFromApi = response.data.user;

  //     const foundUser: AuthUser = {
  //       uid: userFromApi.id,
  //       email: userFromApi.username,
  //       firstName: userFromApi.firstname, // Optional: can be fetched later if needed
  //       lastName: userFromApi.lastname,
  //       role: userFromApi.role,
  //       isActive: true,
  //       // subscriptionExpiryDate: null,
  //       // lastPaymentDate: null,
  //       createdOn: userFromApi.createdAt
  //     };
  //     if (foundUser && foundUser.isActive) {
  //       setUser(foundUser);
  //       localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
  //       toast({ title: "Login Successful", description: `Welcome back, ${foundUser.firstName}!` });
  //       router.push('/dashboard');
  //     } else if (foundUser && !foundUser.isActive) {
  //       toast({ title: "Login Failed", description: "Your account is inactive. Please contact support.", variant: "destructive" });
  //       setUser(null);
  //       localStorage.removeItem(AUTH_STORAGE_KEY);
  //     } else {
  //       toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
  //       setUser(null);
  //       localStorage.removeItem(AUTH_STORAGE_KEY);
  //     }
  //   } catch (error: any) {
  //     toast({ title: "Login Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
  //     setUser(null);
  //     localStorage.removeItem(AUTH_STORAGE_KEY);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [router, toast]);

//   const login = useCallback(
//     async (email: string, password?: string) => {
//       setLoading(true);
//       try {
//         console.log("🔁 Sending login data:", { email, password });

//         const response = await ApiService.login({
//           username: email,
//           password: password,
//         });

//         if (response?.data?.message !== "Login successful") {
//           throw new Error("Login failed.");
//         }

        

//         const userFromApi = response.data.user;

//         const foundUser: AuthUser = {
//           uid: userFromApi._id,
//           email: userFromApi.email,
//           firstName: userFromApi.firstName,
//           lastName: userFromApi.lastName,
//           role: userFromApi.role,
//           isActive: userFromApi.isActive ?? true,
//           createdOn: new Date(userFromApi.createdAt),
//         };


//         if (foundUser && foundUser.isActive) {
//           setUser(foundUser);
//           localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
//           toast({
//             title: "Login Successful",
//             description: `Welcome back, ${foundUser.firstName}!`,
//           });
//           router.push("/dashboard");
//         } else {
//           toast({
//             title: "Login Failed",
//             description: "Your account is inactive. Please contact support.",
//             variant: "destructive",
//           });
//           setUser(null);
//           localStorage.removeItem(AUTH_STORAGE_KEY);
//         }
//       } catch (error: any) {
//         toast({
//           title: "Login Error",
//           description: error.message || "An unexpected error occurred.",
//           variant: "destructive",
//         });
//         setUser(null);
//         localStorage.removeItem(AUTH_STORAGE_KEY);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [router, toast]
//   );

//   const signup = useCallback(
//     async (values: UserFormValues) => {
//       setLoading(true);
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       try {
//         debugger;
//          const createdUser = await ApiService.register(values); 
      
//       setUser(createdUser);
//       localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(createdUser));
//       toast({ title: "Signup Successful", description: `Welcome, ${createdUser.firstName}!` });
//       router.push('/dashboard');
//       } catch (error: any) {
//         toast({
//           title: "Signup Failed",
//           description: error.message || "An unexpected error occurred.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     },
//     [router, toast]
//   );

//   const logout = useCallback(async () => {
//     setLoading(true);
//     setUser(null);
//     localStorage.removeItem(AUTH_STORAGE_KEY);
//     await new Promise((resolve) => setTimeout(resolve, 300));
//     toast({
//       title: "Logged Out",
//       description: "You have been successfully logged out.",
//     });
//     router.push("/login");
//     setLoading(false);
//   }, [router, toast]);

//   const updateUserRole = useCallback(
//     async (uid: string, newRole: UserRole) => {
//       setLoading(true);
//       try {
//         const updatedUserFromService = await serviceUpdateUser(uid, {
//           role: newRole,
//         });

//         if (updatedUserFromService) {
//           if (user?.uid === uid) {
//             setUser(updatedUserFromService);
//             localStorage.setItem(
//               AUTH_STORAGE_KEY,
//               JSON.stringify(updatedUserFromService)
//             );
//           }
//           toast({
//             title: "User Role Updated",
//             description: `User role set to ${newRole}.`,
//           });
//         } else {
//           toast({
//             title: "Update Failed",
//             description: "User not found or update failed at service level.",
//             variant: "destructive",
//           });
//         }
//       } catch (error: any) {
//         toast({
//           title: "Update Error",
//           description: error.message || "Failed to update user role.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     },
//     [user, toast]
//   );

//   const updateSubscription = useCallback(
//     async (planId: SubscriptionPlanId): Promise<boolean> => {
//       if (!user || user.role !== USER_ROLES.ADVOCATE) {
//         toast({
//           title: "Error",
//           description: "Only advocates can have subscriptions.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       setLoading(true);
//       try {
//         // Fetch plan details using planId to ensure we use the latest price/duration
//         // (This step is now effectively handled by serviceUpdateSubscription which fetches the plan)
//         const updatedUser = await serviceUpdateSubscription(user.uid, planId);
//         if (updatedUser) {
//           setUser(updatedUser);
//           localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
//           // Fetch plan name for toast message
//           const planDetails = await getSubscriptionPlanById(planId);
//           toast({
//             title: "Subscription Updated!",
//             description: `You are now subscribed to ${
//               planDetails?.name || "the selected plan"
//             }.`,
//           });
//           setLoading(false);
//           return true;
//         } else {
//           throw new Error("Failed to update subscription in mock service.");
//         }
//       } catch (error: any) {
//         toast({
//           title: "Subscription Failed",
//           description: error.message || "Could not update subscription.",
//           variant: "destructive",
//         });
//         setLoading(false);
//         return false;
//       }
//     },
//     [user, toast]
//   );

//   useEffect(() => {
//     if (
//       !loading &&
//       !user &&
//       !["/login", "/signup", "/forgot-password", "/"].includes(pathname) &&
//       !pathname.startsWith("/subscription") &&
//       !pathname.startsWith("/admin")
//     ) {
//       // router.push('/login'); // Commented out for now as it might be too aggressive during development
//     }
//   }, [user, loading, pathname, router]);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         signup,
//         logout,
//         updateUserRole,
//         isSubscriptionActive,
//         refreshUser,
//         updateSubscription,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }


"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/api/apiService";
import loginApi from "@/api/loginApi"
import { UserFormValues } from "@/lib/model";
import { USER_ROLES } from "@/lib/constants";
interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdOn: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (userFormValues: UserFormValues) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "caseconnect.auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setLoading(true);
    try {
      const response = await loginApi.login({ username: email, password: password ?? "" });
      if (response?.data?.message !== "Login successful") throw new Error("Login failed.");

      const userFromApi = response.data.user;
      const foundUser: AuthUser = {
        uid: userFromApi.id,
        email: userFromApi.username,
        firstName: userFromApi.firstname,
        lastName: userFromApi.lastname,
        role: userFromApi.role,
        isActive: true,
        createdOn: userFromApi.createdAt,
      };

      setUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
      
      toast({ title: "Login Successful", description: `Welcome, ${foundUser.firstName}!` });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, [toast, router]);

  const signup = useCallback(
  async (values: UserFormValues) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role:USER_ROLES.ADVOCATE,
        username: values.email, // assigning email as username
        password: values.password,
        confirmPassword: values.confirmPassword,
        uid: values.uid || "",
        isActive: values.isActive || true,
        advocate: values.role === USER_ROLES.ADVOCATE ? {
          AdvocateUniqueNumber: values.advocate?.AdvocateUniqueNumber || "",
          Specialization: values.advocate?.Specialization || "",
          advocateEnrollmentNumber: values.advocate?.advocateEnrollmentNumber || "",
          createdBy: values.email,
          modifiedBy: values.email,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          id: values.advocate?.id || "",
        } : undefined,
      };

      const response = await ApiService.register(payload);
      const userFromApi = response.data.user || response.data;

      const newUser: AuthUser = {
        uid: userFromApi.id,
        email: userFromApi.username || userFromApi.email,
        firstName: userFromApi.firstname || userFromApi.firstName,
        lastName: userFromApi.lastname || userFromApi.lastName,
        role: userFromApi.role,
        isActive: userFromApi.isActive ?? true,
        createdOn: userFromApi.createdAt,
      };

      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));

      toast({
        title: "Signup Successful",
        description: `Welcome, ${newUser.firstName}!`,
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.response?.data?.detail || error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  },
  [router, toast]
);


  const logout = useCallback(async () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast({ title: "Logged Out", description: "You have been logged out." });
    router.push("/login");
    setLoading(false);
  }, [toast, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
