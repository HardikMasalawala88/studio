"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/api/apiService";
import loginApi from "@/api/loginApi"
import { SubscriptionPackage, UserFormValues, UserSubscription } from "@/lib/model";
import { USER_ROLES } from "@/lib/constants";

interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdOn: string;
  subscriptionPackageId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (userFormValues: UserFormValues) => Promise<void>;
  logout: () => Promise<void>;
  // updateSubscription: (planId: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isSubscriptionActive: boolean;
  userSubscription: UserSubscription | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "caseconnect.auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const refreshUser = useCallback(async () => {
    if (!user?.uid) return;
    try {
      // const { data } = await ApiService.getUserSubscriptionByUserId(user.uid);
      const { data } = await ApiService.getLatestUserSubscription(user.uid);
      setUserSubscription(data); // <-- this sets the subscription properly
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.role === "Advocate") {
      refreshUser();
    } else {
      setUserSubscription(null); // clear it when role is not Advocate
    }
  }, [user, refreshUser]);

  // const isSubscriptionActive = useMemo(() => {
  //   if (!userSubscription?.endDate) return false;
  //   return new Date(userSubscription.endDate) > new Date();
  // }, [userSubscription]);

  const isSubscriptionActive = useMemo(() => {
    if (!userSubscription?.startDate || !userSubscription?.endDate) return false;

    const now = new Date();
    const start = new Date(userSubscription.startDate);
    const end = new Date(userSubscription.endDate);

    return now >= start && now <= end;
  }, [userSubscription]);


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
        subscriptionPackageId: userFromApi.subscriptionPackageId
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

        const { data: packages } = await ApiService.listSubscriptionPackages();
        const trialPackage: SubscriptionPackage | undefined = packages.find(
          (pkg: SubscriptionPackage) => pkg.isTrial && pkg.isActive
        );

        if (!trialPackage) {
          throw new Error("No active trial subscription package found.");
        }

        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: USER_ROLES.ADVOCATE,
          username: values.email, // assigning email as username
          password: values.password,
          confirmPassword: values.confirmPassword,
          uid: values.uid || "",
          isActive: values.isActive || true,
          subscriptionPackageId: trialPackage.id, // <-- Assign trial package ID
          advocate: values.role === USER_ROLES.ADVOCATE ? {
            // AdvocateUniqueNumber: values.advocate?.AdvocateUniqueNumber || "",
            Specialization: values.advocate?.Specialization || "",
            advocateEnrollmentNumber: values.advocate?.advocateEnrollmentNumber || "",
            createdBy: values.email,
            modifiedBy: values.email,
            createdAt: new Date(),
            modifiedAt: new Date(),
            id: values.advocate?.id || "",
          } : undefined,
        };

        const response = await ApiService.register(payload);
        const userFromApi = response.data.user || response.data;

        // // 4. Create user subscription
        // const now = new Date();
        // const endDate = new Date();
        // endDate.setMonth(endDate.getMonth() + trialPackage.durationMonth);

        // const userSubscription: UserSubscription = {
        //   id: "",
        //   userId: userFromApi.id,
        //   subscriptionPackageId: trialPackage.id!,
        //   startDate: now,
        //   endDate: endDate,
        //   isActive: true,
        //   paymentId: "",
        //   createdBy: userFromApi.username,
        //   modifiedBy: "",
        //   createdAt: now,
        //   modifiedAt: now,
        // };

        // await ApiService.addUserSubscription(userSubscription); // <-- Add new API call

        const newUser: AuthUser = {
          uid: userFromApi.id,
          email: userFromApi.username || userFromApi.email,
          firstName: userFromApi.firstname || userFromApi.firstName,
          lastName: userFromApi.lastname || userFromApi.lastName,
          role: userFromApi.role,
          isActive: userFromApi.isActive ?? true,
          createdOn: userFromApi.createdAt,
          subscriptionPackageId: userFromApi.subscriptionPackageId
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

  // const updateSubscription = useCallback(async (planId: string): Promise<boolean> => {
  //   if (!user) return false;
  //   try {
  //     const now = new Date();
  //     const packageRes = await ApiService.getSubscriptionPackageById(planId);
  //     const subscriptionPackage = packageRes.data;
  //     const endDate = new Date();
  //     endDate.setMonth(endDate.getMonth() + subscriptionPackage.durationMonth);

  //     const updatedSubscription: UserSubscription = {
  //       userId: user.uid,
  //       subscriptionPackageId: subscriptionPackage.id!,
  //       startDate: now,
  //       endDate: endDate,
  //       isActive: true,
  //       createdBy: user.email,
  //       modifiedBy: user.email,
  //       createdAt: now,
  //       modifiedAt: now,
  //       status: 
  //     };

  //     await ApiService.addUserSubscription(updatedSubscription);
  //     await refreshUser();
  //     toast({ title: "Plan Updated", description: "Your subscription has been updated." });
  //     return true;
  //   } catch (error) {
  //     toast({ title: "Failed to update subscription", description: "Please try again later.", variant: "destructive" });
  //     return false;
  //   }
  // }, [user, refreshUser, toast]);

  return (
    // <AuthContext.Provider value={{ user, loading, login, signup, logout, updateSubscription, refreshUser, isSubscriptionActive, userSubscription }}>
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, isSubscriptionActive, userSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
