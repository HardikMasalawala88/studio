
"use server";
import type { AuthUser, UserFormValues, SubscriptionPlan } from './types';
import { USER_ROLES, UserRole, SUBSCRIPTION_PLAN_IDS, SUBSCRIPTION_PLANS_CONFIG } from './constants';
import { addMonths, isAfter } from 'date-fns';

let MOCK_USERS_DB: AuthUser[] = [
  {
    uid: 'advocate1', firstName: 'Alice', lastName: 'Advocate', email: 'advocate@example.com', role: USER_ROLES.ADVOCATE, phone: '1234567890', createdOn: new Date('2023-01-15'), advocateEnrollmentNumber: 'MAH/123/2000', isActive: true,
    subscriptionPlanId: SUBSCRIPTION_PLAN_IDS.YEARLY, subscriptionExpiryDate: addMonths(new Date(), 10), lastPaymentAmount: 800, lastPaymentCurrency: 'INR', lastPaymentDate: new Date(new Date().setMonth(new Date().getMonth()-2))
  },
  { uid: 'client1', firstName: 'Bob', lastName: 'Client', email: 'client@example.com', role: USER_ROLES.CLIENT, phone: '0987654321', createdOn: new Date('2023-02-20'), isActive: true },
  { uid: 'admin1', firstName: 'Eve', lastName: 'Admin', email: 'admin@example.com', role: USER_ROLES.SUPER_ADMIN, phone: '1122334455', createdOn: new Date('2023-01-01'), isActive: true },
  {
    uid: 'advocate-other', firstName: 'Charles', lastName: 'Xavier', email: 'cx@example.com', role: USER_ROLES.ADVOCATE, createdOn: new Date('2023-03-10'), advocateEnrollmentNumber: 'DEL/456/2010', isActive: true,
    subscriptionPlanId: SUBSCRIPTION_PLAN_IDS.FREE_TRIAL, subscriptionExpiryDate: addMonths(new Date(), -2) // Expired trial
  },
  { uid: 'client-acme', firstName: 'Acme Rep', lastName: 'Corp', email: 'acme@example.com', role: USER_ROLES.CLIENT, createdOn: new Date('2023-04-05'), isActive: true },
  { uid: 'client-inactive', firstName: 'Inactive', lastName: 'User', email: 'inactive@example.com', role: USER_ROLES.CLIENT, createdOn: new Date('2023-05-01'), isActive: false },
];

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
    // Assign free trial
    const trialPlan = SUBSCRIPTION_PLANS_CONFIG[SUBSCRIPTION_PLAN_IDS.FREE_TRIAL];
    newUser.subscriptionPlanId = trialPlan.id;
    newUser.subscriptionExpiryDate = addMonths(new Date(), trialPlan.durationMonths);
    console.log(`[UserService] Creating Advocate: ${newUser.firstName} ${newUser.lastName}. Free trial assigned, expires: ${newUser.subscriptionExpiryDate}.`);
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
      // If role is Advocate but no number is provided and none exists, this is an issue.
      // However, if one exists, userData without it shouldn't clear it unless explicitly set to empty.
      // This logic can be refined, but for now, we assume advocateEnrollmentNumber is sticky unless changed.
    } else if (userData.role && userData.role !== USER_ROLES.ADVOCATE) {
        delete updatedUser.advocateEnrollmentNumber;
        // Also clear subscription details if no longer an advocate
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
    return [USER_ROLES.ADVOCATE, USER_ROLES.CLIENT, USER_ROLES.SUPER_ADMIN];
}

export async function updateAdvocateSubscription(userId: string, plan: SubscriptionPlan): Promise<AuthUser | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
  const userIndex = MOCK_USERS_DB.findIndex(u => u.uid === userId && u.role === USER_ROLES.ADVOCATE);
  if (userIndex === -1) {
    throw new Error("Advocate not found.");
  }

  const newExpiryDate = addMonths(new Date(), plan.durationMonths);
  
  MOCK_USERS_DB[userIndex] = {
    ...MOCK_USERS_DB[userIndex],
    subscriptionPlanId: plan.id,
    subscriptionExpiryDate: newExpiryDate,
    lastPaymentDate: new Date(),
    lastPaymentAmount: plan.priceINR,
    lastPaymentCurrency: 'INR',
    lastPaymentTransactionId: `MOCK_PHONEPE_${Date.now()}` // Simulate transaction ID
  };
  console.log(`[UserService] Subscription updated for ${MOCK_USERS_DB[userIndex].email} to ${plan.name}. Expires: ${newExpiryDate}`);
  return MOCK_USERS_DB[userIndex];
}
