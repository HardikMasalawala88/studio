
import type { UserRole, CaseStatus } from './constants';

export interface AuthUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdOn?: Date; // Firestore timestamp will be converted to Date
  advocateEnrollmentNumber?: string; // For advocates
}

export interface Note {
  message: string;
  by: string; // uid of user who wrote the note
  byName?: string; // Name of the user for display
  at: Date; // Firestore timestamp will be converted to Date
}

export interface CaseDocument {
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface Case {
  caseId: string;
  title: string;
  description: string;
  hearingDate: Date; // Firestore timestamp will be converted to Date
  status: CaseStatus;
  advocateId: string;
  advocateName?: string; // For display
  clientId: string;
  clientName?: string; // For display
  documents: CaseDocument[];
  notes: Note[];
  createdOn: Date; // Firestore timestamp will be converted to Date
}

export interface DailyHearing {
  date: Date; // Firestore timestamp will be converted to Date
  advocateId: string;
  caseIds: string[];
}

// For forms, especially case form
export type CaseFormValues = {
  title: string;
  description: string;
  hearingDate: Date;
  status: CaseStatus;
  advocateId: string; // Will be UID
  clientId: string; // Will be UID
  // documents and notes are handled separately
};

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string; // Only for new user creation or password change
  advocateEnrollmentNumber?: string; // For advocates
};
