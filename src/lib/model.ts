import { UserRole } from "./constants";

export interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdOn: string;
  subscriptionPackageId: string;
}

export interface UserFormValues  {
  uid?: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  role: UserRole;
  password?: string;
  confirmPassword?: string;
  isActive?: boolean;
  advocate?: {
    id?: string;
    // AdvocateUniqueNumber: string;
    Specialization: string;
    advocateEnrollmentNumber: string;
    createdBy?: string;
    modifiedBy?: string;
    createdAt?: Date;
    modifiedAt?: Date;
  };
  subscriptionPackageId?: string;
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
};

export interface ClientData  {
  id: string;
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
  cases?: Case[]; // You can replace `any` with a Case type if defined
  user: UserFormValues;
};

// lib/types.ts or models/case.ts
export interface HearingEntry {
  hearingDate: string | Date;
  note: string;
  updatedBy: string;
  createdAt?: string | Date;
}

export interface Note {
  description: string;
  createdAt?: string | Date;
}

export interface Case {
  id: string;
  clientId: string;
  advocateId: string;
  caseTitle: string;
  caseDetail: string;
  caseNumber: string;
  hearingDate: Date;
  courtLocation: string;
  caseParentId?: string;
  filingDate: Date;
  caseStatus: string;
  opponant: string;
  oppositeAdvocate: string;
  caseRemark: string;
  caseDocuments?: CaseDocument[];
  hearingHistory?: HearingEntry[];
  notes?: Note[];

  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
}

export interface CaseDocument {
  url: string;
  fileName: string;
  type: string;
  createdAt?: string | Date;
}

export interface SubscriptionPackage {
  id?: string;
  name: string;
  durationMonth: number;
  isTrial: boolean;
  packagePrice: number;
  isActive: boolean;
  description: string;

  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
}

export interface Payment {
  id?: string;
  orderId: string;
  amount: number;
  status: string;
  subscriptionPackageId: string; // Reference to SubscriptionPackage
  userId: string; // Reference to User
  paymentDate: string | Date;
  providerTransactionId: string;

  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
}

export interface UserSubscription {
  id?: string;
  userId: string;
  subscriptionPackageId: string;
  paymentId?: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED'; 

  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
}

