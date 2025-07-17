
"use server";
import type { AuthUser, UserFormValues, SubscriptionPlan } from './types';
import { USER_ROLES, UserRole, SUBSCRIPTION_PLAN_IDS, INITIAL_SUBSCRIPTION_PLANS_CONFIG, ALL_INITIAL_SUBSCRIPTION_PLANS, type SubscriptionPlanId } from './constants';
import { addMonths } from 'date-fns';

let MOCK_USERS_DB: AuthUser[] = [
  {
    uid: 'advocate1', firstName: 'Alice', lastName: 'Advocate', email: 'advocate@example.com', role: USER_ROLES.ADVOCATE, phone: '1234567890', createdOn: new Date('2023-01-15'), advocateEnrollmentNumber: 'MAH/123/2000', isActive: true,
    subscriptionPlanId: SUBSCRIPTION_PLAN_IDS.YEARLY, subscriptionExpiryDate: addMonths(new Date(), 10), lastPaymentAmount: 800, lastPaymentCurrency: 'INR', lastPaymentDate: new Date(new Date().setMonth(new Date().getMonth()-2))
  },
  { uid: 'client1', firstName: 'Bob', lastName: 'Client', email: 'client@example.com', role: USER_ROLES.CLIENT, phone: '0987654321', createdOn: new Date('2023-02-20'), isActive: true },
  { uid: 'admin1', firstName: 'Eve', lastName: 'Admin', email: 'admin@example.com', role: USER_ROLES.ADMIN, phone: '1122334455', createdOn: new Date('2023-01-01'), isActive: true },
  {
    uid: 'advocate-other', firstName: 'Charles', lastName: 'Xavier', email: 'cx@example.com', role: USER_ROLES.ADVOCATE, createdOn: new Date('2023-03-10'), advocateEnrollmentNumber: 'DEL/456/2010', isActive: true,
    subscriptionPlanId: SUBSCRIPTION_PLAN_IDS.FREE_TRIAL, subscriptionExpiryDate: addMonths(new Date(), -2) // Expired trial
  },
  { uid: 'client-acme', firstName: 'Acme Rep', lastName: 'Corp', email: 'acme@example.com', role: USER_ROLES.CLIENT, createdOn: new Date('2023-04-05'), isActive: true },
  { uid: 'client-inactive', firstName: 'Inactive', lastName: 'User', email: 'inactive@example.com', role: USER_ROLES.CLIENT, createdOn: new Date('2023-05-01'), isActive: false },
];

// Mock database for subscription plans, initialized from constants
let MOCK_SUBSCRIPTION_PLANS_DB: SubscriptionPlan[] = JSON.parse(JSON.stringify(ALL_INITIAL_SUBSCRIPTION_PLANS));


export async function getUsers(): Promise<AuthUser[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_USERS_DB;
}

export async function getUserById(uid: string): Promise<AuthUser | undefined> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_USERS_DB.find(u => u.uid === uid);
}

export async function createUser(userData: UserFormValues): Promise<AuthUser> {
  await new Promise(resolve => setTimeout(resolve, 500));
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
    isActive: userData.isActive === undefined ? true : userData.isActive,
  };

  if (userData.role === USER_ROLES.ADVOCATE) {
    if (!userData.advocateEnrollmentNumber) {
        throw new Error("Advocate enrolment certificate number is required for advocates.");
    }
    if (!userData.confirmIndiaAdvocate) {
        throw new Error("Confirmation of practicing in India is required for advocates.");
    }
    newUser.advocateEnrollmentNumber = userData.advocateEnrollmentNumber;
    
    const trialPlan = await getSubscriptionPlanById(SUBSCRIPTION_PLAN_IDS.FREE_TRIAL);
    if (trialPlan) {
        newUser.subscriptionPlanId = trialPlan.id;
        newUser.subscriptionExpiryDate = addMonths(new Date(), trialPlan.durationMonths);
    } else {
        console.warn("[UserService] Free trial plan not found during user creation.");
    }
  }

  MOCK_USERS_DB.push(newUser);
  return newUser;
}

export async function updateUser(uid: string, userData: Partial<UserFormValues & Pick<AuthUser, 'subscriptionPlanId' | 'subscriptionExpiryDate' | 'lastPaymentAmount' | 'lastPaymentCurrency' | 'lastPaymentDate' | 'lastPaymentTransactionId'>>): Promise<AuthUser | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const userIndex = MOCK_USERS_DB.findIndex(u => u.uid === uid);
  if (userIndex > -1) {
    if (userData.email && userData.email !== MOCK_USERS_DB[userIndex].email && MOCK_USERS_DB.some(u => u.email === userData.email && u.uid !== uid)) {
        throw new Error("Another user with this email already exists.");
    }
    
    const updatedUser = { ...MOCK_USERS_DB[userIndex], ...userData } as AuthUser;

    if (userData.role === USER_ROLES.ADVOCATE && !userData.advocateEnrollmentNumber && !updatedUser.advocateEnrollmentNumber) {
      // This logic can be refined, but for now, we assume advocateEnrollmentNumber is sticky unless changed.
    } else if (userData.role && userData.role !== USER_ROLES.ADVOCATE) {
        delete updatedUser.advocateEnrollmentNumber;
        delete updatedUser.subscriptionPlanId;
        delete updatedUser.subscriptionExpiryDate;
        delete updatedUser.lastPaymentAmount;
        // ... clear other payment fields
    }
    
    MOCK_USERS_DB[userIndex] = updatedUser;
    return MOCK_USERS_DB[userIndex];
  }
  return undefined;
}

export async function deleteUser(uid: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 400));
  const initialLength = MOCK_USERS_DB.length;
  MOCK_USERS_DB = MOCK_USERS_DB.filter(u => u.uid !== uid);
  return MOCK_USERS_DB.length < initialLength;
}

export async function activateUser(uid: string): Promise<AuthUser | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = MOCK_USERS_DB.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
        MOCK_USERS_DB[userIndex].isActive = true;
        return MOCK_USERS_DB[userIndex];
    }
    return undefined;
}

export async function deactivateUser(uid: string): Promise<AuthUser | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = MOCK_USERS_DB.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
        MOCK_USERS_DB[userIndex].isActive = false;
        return MOCK_USERS_DB[userIndex];
    }
    return undefined;
}

export async function getAssignableRoles(): Promise<UserRole[]> {
    return [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.ADMIN];
}

export async function updateAdvocateSubscription(userId: string, planId: SubscriptionPlanId): Promise<AuthUser | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700)); 
  const userIndex = MOCK_USERS_DB.findIndex(u => u.uid === userId && u.role === USER_ROLES.ADVOCATE);
  if (userIndex === -1) {
    throw new Error("Advocate not found.");
  }

  const plan = await getSubscriptionPlanById(planId);
  if (!plan) {
    throw new Error("Selected subscription plan not found.");
  }

  const newExpiryDate = addMonths(new Date(), plan.durationMonths);
  
  MOCK_USERS_DB[userIndex] = {
    ...MOCK_USERS_DB[userIndex],
    subscriptionPlanId: plan.id,
    subscriptionExpiryDate: newExpiryDate,
    lastPaymentDate: new Date(),
    lastPaymentAmount: plan.priceINR,
    lastPaymentCurrency: 'INR',
    lastPaymentTransactionId: `MOCK_PHONEPE_${Date.now()}` 
  };
  return MOCK_USERS_DB[userIndex];
}

// --- Subscription Plan Management ---

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Return a deep copy to prevent direct modification of the mock DB
  return JSON.parse(JSON.stringify(MOCK_SUBSCRIPTION_PLANS_DB));
}

export async function getSubscriptionPlanById(planId: SubscriptionPlanId): Promise<SubscriptionPlan | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const plan = MOCK_SUBSCRIPTION_PLANS_DB.find(p => p.id === planId);
  return plan ? JSON.parse(JSON.stringify(plan)) : undefined;
}

export async function updateSubscriptionPlan(
  planId: SubscriptionPlanId,
  updates: { name?: string; description?: string; priceINR?: number; durationMonths?: number }
): Promise<SubscriptionPlan | undefined> {
  await new Promise(resolve => setTimeout(resolve, 400));
  const planIndex = MOCK_SUBSCRIPTION_PLANS_DB.findIndex(p => p.id === planId);
  if (planIndex > -1) {
    // Prevent changing 'id' or 'isTrial' status via this function
    const originalPlan = MOCK_SUBSCRIPTION_PLANS_DB[planIndex];
    if (originalPlan.isTrial && (updates.priceINR !== undefined || updates.durationMonths !== undefined)) {
        throw new Error("Price and duration for trial plans cannot be modified.");
    }

    MOCK_SUBSCRIPTION_PLANS_DB[planIndex] = {
      ...originalPlan,
      ...updates,
      id: originalPlan.id, // Ensure ID doesn't change
      isTrial: originalPlan.isTrial, // Ensure isTrial doesn't change
    };
    return JSON.parse(JSON.stringify(MOCK_SUBSCRIPTION_PLANS_DB[planIndex]));
  }
  return undefined;
}
