"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, UserFormValues } from '@/lib/types';
import type { UserRole } from '@/lib/constants';
import { USER_ROLES } from '@/lib/constants';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mocked User Data (replace with actual API calls)
const MOCK_USERS: AuthUser[] = [
  { uid: 'advocate1', firstName: 'Alice', lastName: 'Advocate', email: 'advocate@example.com', role: USER_ROLES.ADVOCATE, phone: '1234567890' },
  { uid: 'client1', firstName: 'Bob', lastName: 'Client', email: 'client@example.com', role: USER_ROLES.CLIENT, phone: '0987654321' },
  { uid: 'admin1', firstName: 'Eve', lastName: 'Admin', email: 'admin@example.com', role: USER_ROLES.SUPER_ADMIN, phone: '1122334455' },
];

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>; // Password optional for mock
  signup: (values: Pick<UserFormValues, 'firstName' | 'lastName' | 'email' | 'password' | 'role'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>; // For admin
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'caseconnect.auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, _password?: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
      toast({ title: "Login Successful", description: `Welcome back, ${foundUser.firstName}!` });
      router.push('/dashboard');
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setLoading(false);
  }, [router, toast]);

  const signup = useCallback(async (values: Pick<UserFormValues, 'firstName' | 'lastName' | 'email' | 'password' | 'role'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (MOCK_USERS.find(u => u.email === values.email)) {
      toast({ title: "Signup Failed", description: "Email already exists.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const newUser: AuthUser = {
      uid: `new-${Date.now()}`,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      role: values.role || USER_ROLES.CLIENT, // Default to client
      createdOn: new Date(),
    };
    MOCK_USERS.push(newUser); // Add to mock users list
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    toast({ title: "Signup Successful", description: `Welcome, ${newUser.firstName}!` });
    router.push('/dashboard');
    setLoading(false);
  }, [router, toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
    setLoading(false);
  }, [router, toast]);

  const updateUserRole = useCallback(async (uid: string, newRole: UserRole) => {
    // This is a mock function for admin to update roles
    const userIndex = MOCK_USERS.findIndex(u => u.uid === uid);
    if (userIndex !== -1) {
      MOCK_USERS[userIndex].role = newRole;
      if (user?.uid === uid) { // If current user's role is changed
        const updatedCurrentUser = { ...MOCK_USERS[userIndex] };
        setUser(updatedCurrentUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedCurrentUser));
      }
      toast({ title: "User Role Updated", description: `User role set to ${newRole}.` });
    } else {
      toast({ title: "Update Failed", description: "User not found.", variant: "destructive" });
    }
  }, [user, toast]);


  useEffect(() => {
    if (!loading && !user && !['/login', '/signup', '/forgot-password', '/'].includes(pathname)) {
       // router.push('/login');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
