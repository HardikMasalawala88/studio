
"use server";
import type { AuthUser, UserFormValues, SubscriptionPlan } from './types';
import { USER_ROLES, UserRole, SUBSCRIPTION_PLAN_IDS, INITIAL_SUBSCRIPTION_PLANS_CONFIG, ALL_INITIAL_SUBSCRIPTION_PLANS, type SubscriptionPlanId } from './constants';
import { addMonths } from 'date-fns';
import apiFetch from './api-client';

// The MOCK_USERS_DB will now be used as a supplementary source for data not in the API
// e.g., isActive status and subscription details, per the instructions.
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

let MOCK_SUBSCRIPTION_PLANS_DB: SubscriptionPlan[] = JSON.parse(JSON.stringify(ALL_INITIAL_SUBSCRIPTION_PLANS));

// Helper to merge API data with mock data for fields not in API
const mergeWithMockUserData = (apiUser: any, userId: string): AuthUser => {
    const mockUser = MOCK_USERS_DB.find(u => u.uid === userId || u.email === apiUser.email);
    return {
        uid: userId, // The API doesn't seem to return the ID in the body, so we use the one we have
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        email: apiUser.email,
        role: apiUser.role,
        phone: apiUser.phone,
        createdOn: new Date(apiUser.createdAt || apiUser.createdOn),
        advocateEnrollmentNumber: apiUser.advocateEnrollmentNumber,
        // Merge fields from mock DB
        isActive: mockUser?.isActive ?? true,
        subscriptionPlanId: mockUser?.subscriptionPlanId,
        subscriptionExpiryDate: mockUser?.subscriptionExpiryDate,
        lastPaymentDate: mockUser?.lastPaymentDate,
        lastPaymentAmount: mockUser?.lastPaymentAmount,
        lastPaymentCurrency: mockUser?.lastPaymentCurrency,
        lastPaymentTransactionId: mockUser?.lastPaymentTransactionId
    };
};

export async function getUsers(): Promise<AuthUser[]> {
    // API has separate endpoints for advocates and clients. We'll fetch both and merge.
    const advocatesFromApi = await apiFetch('/superadmin/Advocates');
    const clientsFromApi = await apiFetch('/advocate/clients');

    const combinedUsers = [];
    if (Array.isArray(advocatesFromApi)) {
        // The advocate object is nested, need to map it correctly.
        combinedUsers.push(...advocatesFromApi.map((adv:any) => mergeWithMockUserData(adv.User, adv.User.id || adv.User.email)));
    }
    if (Array.isArray(clientsFromApi)) {
        combinedUsers.push(...clientsFromApi.map((cli:any) => mergeWithMockUserData(cli.User, cli.User.id || cli.User.email)));
    }

    // Add super admin from mock data as API doesn't have an endpoint for it.
    const admin = MOCK_USERS_DB.find(u => u.role === USER_ROLES.SUPER_ADMIN);
    if(admin) combinedUsers.push(admin);

    return combinedUsers;
}

export async function getUserById(uid: string): Promise<AuthUser | undefined> {
    // Since we don't know the role, we have to try both endpoints. This is not ideal.
    try {
        const client = await apiFetch(`/advocate/clients/${uid}`);
        return mergeWithMockUserData(client.User, uid);
    } catch (e) {
        try {
            const advocate = await apiFetch(`/superadmin/Advocates/${uid}`);
            return mergeWithMockUserData(advocate.User, uid);
        } catch (e2) {
            // Fallback to mock DB if API fails (e.g. for super admin)
            return MOCK_USERS_DB.find(u => u.uid === uid);
        }
    }
}

export async function createUser(userData: UserFormValues): Promise<AuthUser> {
    // Using `/account/register` as the primary signup/creation endpoint
    const apiPayload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      username: userData.email, // API uses username, we'll use email
      password: userData.password,
      confirmPassword: userData.password, // Assuming confirmPassword is the same
      advocateEnrollmentNumber: userData.advocateEnrollmentNumber || '',
      confirmIndiaAdvocate: userData.confirmIndiaAdvocate || false,
    };
    
    await apiFetch('/account/register', {
        method: 'POST',
        body: JSON.stringify(apiPayload)
    });
    
    // API doesn't return the created user, so we have to construct it.
    // This is not ideal, a real API should return the created object with its ID.
    const newUser: AuthUser = {
        uid: `user-${Date.now()}`, // Temporary UID
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        createdOn: new Date(),
        isActive: true,
        advocateEnrollmentNumber: userData.advocateEnrollmentNumber,
    };

    if (userData.role === USER_ROLES.ADVOCATE) {
        const trialPlan = await getSubscriptionPlanById(SUBSCRIPTION_PLAN_IDS.FREE_TRIAL);
        if (trialPlan) {
            newUser.subscriptionPlanId = trialPlan.id;
            newUser.subscriptionExpiryDate = addMonths(new Date(), trialPlan.durationMonths);
        }
    }
    
    MOCK_USERS_DB.push(newUser); // Add to mock db for supplementary data
    return newUser;
}

export async function updateUser(uid: string, userData: Partial<UserFormValues>): Promise<AuthUser | undefined> {
    const userToUpdate = await getUserById(uid);
    if (!userToUpdate) throw new Error("User not found");

    let apiPayload: any = {
        User: {
            ...userToUpdate,
            ...userData,
            username: userData.email || userToUpdate.email
        }
    };
    
    let endpoint = '';
    if(userToUpdate.role === USER_ROLES.ADVOCATE){
        endpoint = `/superadmin/Advocates/${uid}`;
        apiPayload = { ...apiPayload.User, Specialization: "General" } // API requires specialization
    } else if (userToUpdate.role === USER_ROLES.CLIENT){
        endpoint = `/advocate/clients/${uid}`;
    } else {
        // Not touching SuperAdmin updates as there's no endpoint
        const mockIndex = MOCK_USERS_DB.findIndex(u => u.uid === uid);
        if(mockIndex > -1) {
            MOCK_USERS_DB[mockIndex] = { ...MOCK_USERS_DB[mockIndex], ...userData };
            return MOCK_USERS_DB[mockIndex];
        }
        return undefined;
    }

    await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(apiPayload)
    });
    
    // API does not return updated object, so refetch
    return await getUserById(uid);
}

export async function deleteUser(uid: string): Promise<boolean> {
     const userToDelete = await getUserById(uid);
    if (!userToDelete) return false;

    let endpoint = '';
    if (userToDelete.role === USER_ROLES.ADVOCATE) {
        endpoint = `/superadmin/Advocates/${uid}`;
    } else if (userToDelete.role === USER_ROLES.CLIENT) {
        endpoint = `/advocate/clients/${uid}`;
    } else {
      // No endpoint for admin, use mock
      const initialLength = MOCK_USERS_DB.length;
      MOCK_USERS_DB = MOCK_USERS_DB.filter(u => u.uid !== uid);
      return MOCK_USERS_DB.length < initialLength;
    }

    await apiFetch(endpoint, { method: 'DELETE' });
    return true;
}

// --- Functions below are NOT connected to the API per instructions ---

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
  console.log(`[UserService] Subscription updated for ${MOCK_USERS_DB[userIndex].email} to ${plan.name}. Expires: ${newExpiryDate}`);
  return MOCK_USERS_DB[userIndex];
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
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
    const originalPlan = MOCK_SUBSCRIPTION_PLANS_DB[planIndex];
    if (originalPlan.isTrial && (updates.priceINR !== undefined || updates.durationMonths !== undefined)) {
        throw new Error("Price and duration for trial plans cannot be modified.");
    }

    MOCK_SUBSCRIPTION_PLANS_DB[planIndex] = {
      ...originalPlan,
      ...updates,
      id: originalPlan.id,
      isTrial: originalPlan.isTrial,
    };
    return JSON.parse(JSON.stringify(MOCK_SUBSCRIPTION_PLANS_DB[planIndex]));
  }
  return undefined;
}

export async function getMockAdvocates() {
    const allUsers = await getUsers();
    return allUsers
        .filter(u => u.role === USER_ROLES.ADVOCATE)
        .map(u => ({ id: u.uid, name: `${u.firstName} ${u.lastName}` }));
}
export async function getMockClients() {
    const allUsers = await getUsers();
    return allUsers
        .filter(u => u.role === USER_ROLES.CLIENT)
        .map(u => ({ id: u.uid, name: `${u.firstName} ${u.lastName}` }));
}
