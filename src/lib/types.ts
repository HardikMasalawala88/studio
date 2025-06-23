
import type { UserRole, CaseStatus, SubscriptionPlanId } from './constants';

export interface AuthUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdOn?: Date;
  advocateEnrollmentNumber?: string;
  
  // This field is from the mock service, not the API
  isActive?: boolean;

  // These subscription-related fields are from the mock service, not the API
  subscriptionPlanId?: SubscriptionPlanId;
  subscriptionExpiryDate?: Date;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  lastPaymentCurrency?: 'INR';
  lastPaymentTransactionId?: string; 
}

export interface Note {
  message: string;
  by: string;
  byName?: string;
  at: Date;
}

export interface CaseDocument {
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface HearingEntry {
  hearingDate: Date;
  status: CaseStatus;
  notes?: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: Date;
}

export interface Task {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  createdOn: Date;
  completedOn?: Date;
  createdBy: string; 
  createdByName: string;
}

export interface Case {
  caseId: string;
  title: string;
  description: string;
  hearingDate: Date;
  status: CaseStatus;
  advocateId: string;
  advocateName?: string;
  clientId: string;
  clientName?: string;
  createdOn: Date;

  // These fields are from the mock service, not the API
  documents: CaseDocument[];
  notes: Note[];
  hearingHistory: HearingEntry[];
  tasks: Task[];
}

export interface DailyHearing {
  date: Date;
  advocateId: string;
  caseIds: string[];
}

export type CaseFormValues = {
  title: string;
  description: string;
  hearingDate: Date;
  status: CaseStatus;
  advocateId: string;
  clientId: string;
};

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
  advocateEnrollmentNumber?: string;
  isActive?: boolean;
  confirmIndiaAdvocate?: boolean; // Added for signup
};

export type HearingUpdateFormValues = {
  currentHearingStatus: CaseStatus;
  currentHearingNotes?: string;
  nextHearingDate?: Date;
  nextHearingStatus?: CaseStatus;
};

export type ClientFormValues = Omit<UserFormValues, 'role' | 'advocateEnrollmentNumber' | 'confirmIndiaAdvocate'>;

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  priceINR: number;
  durationMonths: number; // 0 for free trial, otherwise months
  description: string;
  isTrial?: boolean;
}
