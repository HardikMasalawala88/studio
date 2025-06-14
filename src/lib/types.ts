
import type { UserRole, CaseStatus } from './constants';

export interface AuthUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdOn?: Date;
  advocateEnrollmentNumber?: string;
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
  status: CaseStatus; // Status of the case *after* this hearing or as set for this hearing
  notes?: string; // Notes specific to this hearing's outcome
  updatedBy: string; // UID of the advocate who updated this entry
  updatedByName: string; // Name of the advocate
  updatedAt: Date; // When this history entry was made
}

export interface Case {
  caseId: string;
  title: string;
  description: string;
  hearingDate: Date; // Represents the *next* scheduled hearing date
  status: CaseStatus; // Represents the *current overall* status of the case
  advocateId: string;
  advocateName?: string; 
  clientId: string;
  clientName?: string; 
  documents: CaseDocument[];
  notes: Note[]; // General case notes, not specific to a single hearing outcome
  hearingHistory: HearingEntry[]; // Chronological record of hearings
  createdOn: Date; 
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
};

export type HearingUpdateFormValues = {
  currentHearingStatus: CaseStatus;
  currentHearingNotes?: string;
  nextHearingDate?: Date;
  nextHearingStatus?: CaseStatus;
};
