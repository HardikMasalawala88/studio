"use server";
import type { AuthUser, UserFormValues } from './types';
import { USER_ROLES, UserRole } from './constants';

// This MOCK_USERS list should be consistent with the one in AuthContext for demo purposes.
// In a real app, this would be a single source of truth (Firestore).
let MOCK_USERS_DB: AuthUser[] = [
  { uid: 'advocate1', firstName: 'Alice', lastName: 'Advocate', email: 'advocate@example.com', role: USER_ROLES.ADVOCATE, phone: '1234567890', createdOn: new Date('2023-01-15') },
  { uid: 'client1', firstName: 'Bob', lastName: 'Client', email: 'client@example.com', role: USER_ROLES.CLIENT, phone: '0987654321', createdOn: new Date('2023-02-20') },
  { uid: 'admin1', firstName: 'Eve', lastName: 'Admin', email: 'admin@example.com', role: USER_ROLES.SUPER_ADMIN, phone: '1122334455', createdOn: new Date('2023-01-01') },
  { uid: 'advocate-other', firstName: 'Charles', lastName: 'Xavier', email: 'cx@example.com', role: USER_ROLES.ADVOCATE, createdOn: new Date('2023-03-10') },
  { uid: 'client-acme', firstName: 'Acme Rep', lastName: 'Corp', email: 'acme@example.com', role: USER_ROLES.CLIENT, createdOn: new Date('2023-04-05') },
];

export async function getUsers(): Promise<AuthUser[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return MOCK_USERS_DB;
}

export async function getUserById(uid: string): Promise<AuthUser | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_USERS_DB.find(u => u.uid === uid);
}

export async function createUser(userData: UserFormValues): Promise<AuthUser> {
  await new Promise(resolve => setTimeout(resolve, 700));
  if (MOCK_USERS_DB.some(u => u.email === userData.email)) {
    throw new Error("User with this email already exists.");
  }
  const newUser: AuthUser = {
    uid: `user-${Date.now()}`,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    role: userData.role,
    phone: userData.phone,
    createdOn: new Date(),
  };
  MOCK_USERS_DB.push(newUser);
  return newUser;
}

export async function updateUser(uid: string, userData: Partial<UserFormValues>): Promise<AuthUser | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const userIndex = MOCK_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    // Check for email conflict if email is being changed
    if (userData.email && userData.email !== MOCK_USERS_DB[userIndex].email && MOCK_USERS_DB.some(u => u.email === userData.email && u.uid !== uid)) {
        throw new Error("Another user with this email already exists.");
    }
    MOCK_USERS_DB[userIndex] = { ...MOCK_USERS_DB[userIndex], ...userData } as AuthUser;
    return MOCK_USERS_DB[userIndex];
  }
  return undefined;
}

export async function deleteUser(uid: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = MOCK_USERS_DB.length;
  MOCK_USERS_DB = MOCK_USERS_DB.filter(u => u.uid !== uid);
  return MOCK_USERS_DB.length < initialLength;
}

export async function getAssignableRoles(): Promise<UserRole[]> {
    // SuperAdmin can assign any role.
    return [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.SUPER_ADMIN];
}
