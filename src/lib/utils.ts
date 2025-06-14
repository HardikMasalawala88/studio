import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AuthUser } from './types';
import { USER_ROLES } from './constants';
import { isAfter } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a user's subscription is active.
 * Non-advocates or users without subscription details are considered to have "active" access
 * in terms of not being restricted by subscription checks.
 * For advocates, it checks their subscriptionExpiryDate.
 */
export function isUserSubscriptionActive(user: AuthUser | null): boolean {
  if (!user || user.role !== USER_ROLES.ADVOCATE) {
    // Non-advocates, or if user object is null, don't apply subscription restrictions.
    // Access control for roles is handled separately.
    return true;
  }
  // For Advocates:
  if (!user.subscriptionExpiryDate) {
    // No expiry date means no active subscription (e.g., trial not started, or data issue).
    return false;
  }
  // Subscription is active if the expiry date is in the future.
  return isAfter(new Date(user.subscriptionExpiryDate), new Date());
}
