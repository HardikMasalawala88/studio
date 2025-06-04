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
