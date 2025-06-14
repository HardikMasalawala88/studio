
export const USER_ROLES = {
  ADVOCATE: 'Advocate',
  CLIENT: 'Client',
  SUPER_ADMIN: 'SuperAdmin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ALL_USER_ROLES = Object.values(USER_ROLES);

export const CASE_STATUSES = {
  UPCOMING: 'Upcoming',
  CLOSED: 'Closed',
  ON_HOLD: 'On Hold',
} as const;

export type CaseStatus = typeof CASE_STATUSES[keyof typeof CASE_STATUSES];
export const ALL_CASE_STATUSES = Object.values(CASE_STATUSES);

export const APP_NAME = "CaseConnect";

export const SUBSCRIPTION_PLAN_IDS = {
  FREE_TRIAL: 'free_trial_1m',
  MONTHLY_3: 'paid_3m_300inr',
  HALF_YEARLY: 'paid_6m_500inr',
  YEARLY: 'paid_12m_800inr',
} as const;

export type SubscriptionPlanId = typeof SUBSCRIPTION_PLAN_IDS[keyof typeof SUBSCRIPTION_PLAN_IDS];

export const SUBSCRIPTION_PLANS_CONFIG = {
  [SUBSCRIPTION_PLAN_IDS.FREE_TRIAL]: { id: SUBSCRIPTION_PLAN_IDS.FREE_TRIAL, name: "1 Month Free Trial", priceINR: 0, durationMonths: 1, description: "Full access for 1 month.", isTrial: true },
  [SUBSCRIPTION_PLAN_IDS.MONTHLY_3]: { id: SUBSCRIPTION_PLAN_IDS.MONTHLY_3, name: "3 Month Access", priceINR: 300, durationMonths: 3, description: "₹300 for 3 months." },
  [SUBSCRIPTION_PLAN_IDS.HALF_YEARLY]: { id: SUBSCRIPTION_PLAN_IDS.HALF_YEARLY, name: "6 Month Access", priceINR: 500, durationMonths: 6, description: "₹500 for 6 months." },
  [SUBSCRIPTION_PLAN_IDS.YEARLY]: { id: SUBSCRIPTION_PLAN_IDS.YEARLY, name: "12 Month Access", priceINR: 800, durationMonths: 12, description: "₹800 for 12 months." },
} as const;

export const ALL_SUBSCRIPTION_PLANS = Object.values(SUBSCRIPTION_PLANS_CONFIG);
