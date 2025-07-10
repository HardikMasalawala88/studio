import { UserRole } from "./constants";

export type UserFormValues = {
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
    AdvocateUniqueNumber: string;
    Specialization: string;
    advocateEnrollmentNumber: string;
    createdBy?: string;
    modifiedBy?: string;
    createdAt?: Date;
    modifiedAt?: Date;
  };
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
};

export type ClientData = {
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
