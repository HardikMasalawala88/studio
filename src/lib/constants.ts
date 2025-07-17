
export const USER_ROLES = {
  ADVOCATE: 'Advocate',
  CLIENT: 'Client',
  ADMIN: 'Admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ALL_USER_ROLES = Object.values(USER_ROLES);

export const CASE_STATUSES = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  ON_HOLD: 'On Hold',
} as const;

export const ALL_CASE_STATUSES = ["Open", "Closed", "On Hold"] as const;

export type CaseStatus = string;
// export type CaseStatus = (typeof ALL_CASE_STATUSES)[number];

// export type CaseStatus = typeof CASE_STATUSES[keyof typeof CASE_STATUSES];

// // ✅ FIX: Cast to tuple so it's usable by `z.enum` 
// export const ALL_CASE_STATUSES = Object.values(CASE_STATUSES) 
//  as [CaseStatus, ...CaseStatus[]];


export const APP_NAME = "CaseConnect";

export const SUBSCRIPTION_PLAN_IDS = {
  FREE_TRIAL: 'free_trial_1m',
  MONTHLY_3: 'paid_3m_300inr',
  HALF_YEARLY: 'paid_6m_500inr',
  YEARLY: 'paid_12m_800inr',
} as const;

export type SubscriptionPlanId = typeof SUBSCRIPTION_PLAN_IDS[keyof typeof SUBSCRIPTION_PLAN_IDS];

// This config now serves as the INITIAL/DEFAULT values for plans.
// The actual mutable plan data will be managed in userService.ts.
// The 'id' and 'isTrial' properties are considered immutable from the admin UI.
export const INITIAL_SUBSCRIPTION_PLANS_CONFIG: Record<SubscriptionPlanId, {
  id: SubscriptionPlanId;
  name: string;
  priceINR: number;
  durationMonths: number;
  description: string;
  isTrial?: boolean;
}> = {
  [SUBSCRIPTION_PLAN_IDS.FREE_TRIAL]: { id: SUBSCRIPTION_PLAN_IDS.FREE_TRIAL, name: "1 Month Free Trial", priceINR: 0, durationMonths: 1, description: "Full access for 1 month.", isTrial: true },
  [SUBSCRIPTION_PLAN_IDS.MONTHLY_3]: { id: SUBSCRIPTION_PLAN_IDS.MONTHLY_3, name: "3 Month Access", priceINR: 300, durationMonths: 3, description: "₹300 for 3 months." },
  [SUBSCRIPTION_PLAN_IDS.HALF_YEARLY]: { id: SUBSCRIPTION_PLAN_IDS.HALF_YEARLY, name: "6 Month Access", priceINR: 500, durationMonths: 6, description: "₹500 for 6 months." },
  [SUBSCRIPTION_PLAN_IDS.YEARLY]: { id: SUBSCRIPTION_PLAN_IDS.YEARLY, name: "12 Month Access", priceINR: 800, durationMonths: 12, description: "₹800 for 12 months." },
};

// This can still be useful for components that need a quick list of all plan objects,
// but they should ideally fetch from the service if they need the latest editable data.
// For simplicity, this will now get its data from the service layer once it's initialized.
// However, since constants file is loaded first, we will initialize it here, and the service will use this.
export const ALL_INITIAL_SUBSCRIPTION_PLANS = Object.values(INITIAL_SUBSCRIPTION_PLANS_CONFIG);
