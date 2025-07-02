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
export interface Case {
  id: string; // inferred from deletion code
  ClientId: string;
  AdvocateId: string;
  CaseTitle: string;
  CaseDetail: string;
  CaseNumber: string;
  HearingDate: Date;
  CourtLocation: string;
  CaseParentId?: string;
  FilingDate: Date;
  CaseStatus: string;
  CaseDocuments?: CaseDocument[];
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
}

export interface CaseDocument {
  id: string; 
  url: string;
  fileName: string;
  type: string;
  caseId: string;
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string | Date;
  modifiedAt?: string | Date;
}
