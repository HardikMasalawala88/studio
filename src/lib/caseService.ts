"use server";
import type { Case, CaseFormValues, Note, CaseDocument } from './types';
import { CASE_STATUSES, USER_ROLES } from './constants';

let MOCK_CASES: Case[] = [
  {
    caseId: 'case-001',
    title: 'Personal Injury Claim - John Doe',
    description: 'Claim regarding a slip and fall incident at a local supermarket. Seeking compensation for medical expenses and lost wages.',
    hearingDate: new Date('2024-09-15T10:00:00Z'),
    status: CASE_STATUSES.UPCOMING,
    advocateId: 'advocate1', // Alice Advocate
    advocateName: 'Alice Advocate',
    clientId: 'client1', // Bob Client
    clientName: 'Bob Client',
    documents: [
        { name: 'Medical Report.pdf', url: '#', uploadedAt: new Date('2024-07-01T10:00:00Z') },
        { name: 'Incident Photos.zip', url: '#', uploadedAt: new Date('2024-07-02T14:30:00Z') }
    ],
    notes: [
      { message: 'Initial consultation held. Client seems to have a strong case.', by: 'advocate1', byName: 'Alice Advocate', at: new Date('2024-07-01T11:00:00Z') },
      { message: 'Gathered all necessary medical documents.', by: 'advocate1', byName: 'Alice Advocate', at: new Date('2024-07-05T15:00:00Z') },
    ],
    createdOn: new Date('2024-07-01T09:00:00Z'),
  },
  {
    caseId: 'case-002',
    title: 'Contract Dispute - Acme Corp',
    description: 'Dispute over non-payment for services rendered as per contract dated 2023-05-10.',
    hearingDate: new Date('2024-08-20T14:30:00Z'),
    status: CASE_STATUSES.UPCOMING,
    advocateId: 'advocate1',
    advocateName: 'Alice Advocate',
    clientId: 'client-acme',
    clientName: 'Acme Corp Representative',
    documents: [{ name: 'Contract.pdf', url: '#', uploadedAt: new Date() }],
    notes: [{ message: 'Filed initial complaint.', by: 'advocate1', byName: 'Alice Advocate', at: new Date() }],
    createdOn: new Date('2024-06-15T10:00:00Z'),
  },
  {
    caseId: 'case-003',
    title: 'Real Estate Litigation - Smith Estate',
    description: 'Boundary dispute with neighboring property. Ongoing for several months.',
    hearingDate: new Date('2024-07-25T09:00:00Z'),
    status: CASE_STATUSES.ON_HOLD,
    advocateId: 'advocate-other',
    advocateName: 'Charles Xavier',
    clientId: 'client1', // Bob Client
    clientName: 'Bob Client',
    documents: [],
    notes: [{ message: 'Mediation scheduled.', by: 'advocate-other', byName: 'Charles Xavier', at: new Date() }],
    createdOn: new Date('2024-03-10T11:00:00Z'),
  },
  {
    caseId: 'case-004',
    title: 'Family Law - Custody Agreement',
    description: 'Negotiating custody terms for minor children.',
    hearingDate: new Date('2023-12-01T11:00:00Z'),
    status: CASE_STATUSES.CLOSED,
    advocateId: 'advocate1',
    advocateName: 'Alice Advocate',
    clientId: 'client-family',
    clientName: 'Jane Family',
    documents: [{ name: 'Final Agreement.pdf', url: '#', uploadedAt: new Date() }],
    notes: [{ message: 'Agreement reached and signed by both parties.', by: 'advocate1', byName: 'Alice Advocate', at: new Date() }],
    createdOn: new Date('2023-09-01T14:00:00Z'),
  },
];

export async function getCases(userId: string, userRole: UserRole): Promise<Case[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  if (userRole === USER_ROLES.SUPER_ADMIN) {
    return MOCK_CASES;
  }
  if (userRole === USER_ROLES.ADVOCATE) {
    return MOCK_CASES.filter(c => c.advocateId === userId);
  }
  if (userRole === USER_ROLES.CLIENT) {
    return MOCK_CASES.filter(c => c.clientId === userId);
  }
  return [];
}

export async function getCaseById(caseId: string): Promise<Case | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CASES.find(c => c.caseId === caseId);
}

export async function createCase(caseData: CaseFormValues, advocateId: string, clientId: string): Promise<Case> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const newCase: Case = {
    ...caseData,
    caseId: `case-${Date.now()}`,
    advocateId,
    clientId,
    advocateName: "Mock Advocate", // In real app, fetch from advocateId
    clientName: "Mock Client",   // In real app, fetch from clientId
    documents: [],
    notes: [],
    createdOn: new Date(),
  };
  MOCK_CASES.unshift(newCase);
  return newCase;
}

export async function updateCase(caseId: string, caseData: Partial<CaseFormValues>): Promise<Case | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const caseIndex = MOCK_CASES.findIndex(c => c.caseId === caseId);
  if (caseIndex > -1) {
    MOCK_CASES[caseIndex] = { ...MOCK_CASES[caseIndex], ...caseData } as Case;
     // If hearingDate is a string, convert it
    if (typeof caseData.hearingDate === 'string') {
        MOCK_CASES[caseIndex].hearingDate = new Date(caseData.hearingDate);
    }
    return MOCK_CASES[caseIndex];
  }
  return undefined;
}

export async function deleteCase(caseId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = MOCK_CASES.length;
  MOCK_CASES = MOCK_CASES.filter(c => c.caseId !== caseId);
  return MOCK_CASES.length < initialLength;
}

export async function addNoteToCase(caseId: string, note: Pick<Note, 'message' | 'by' | 'byName'>): Promise<Note | undefined> {
  await new Promise(resolve => setTimeout(resolve, 400));
  const caseToUpdate = MOCK_CASES.find(c => c.caseId === caseId);
  if (caseToUpdate) {
    const newNote: Note = { ...note, at: new Date() };
    caseToUpdate.notes.push(newNote);
    return newNote;
  }
  return undefined;
}

export async function addDocumentToCase(caseId: string, document: Omit<CaseDocument, 'uploadedAt'>): Promise<CaseDocument | undefined> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const caseToUpdate = MOCK_CASES.find(c => c.caseId === caseId);
  if (caseToUpdate) {
    const newDocument: CaseDocument = { ...document, uploadedAt: new Date() };
    caseToUpdate.documents.push(newDocument);
    return newDocument;
  }
  return undefined;
}

export async function getDailyHearings(advocateId: string, date: Date): Promise<Case[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const todayStart = new Date(date);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(date);
  todayEnd.setHours(23, 59, 59, 999);

  return MOCK_CASES.filter(c => 
    c.advocateId === advocateId &&
    c.hearingDate >= todayStart &&
    c.hearingDate <= todayEnd &&
    c.status === CASE_STATUSES.UPCOMING
  ).sort((a,b) => a.hearingDate.getTime() - b.hearingDate.getTime());
}

// Utility to get mock users for dropdowns (replace with actual user service)
export async function getMockAdvocates() {
    return MOCK_USERS.filter(u => u.role === USER_ROLES.ADVOCATE).map(u => ({ id: u.uid, name: `${u.firstName} ${u.lastName}` }));
}
export async function getMockClients() {
    return MOCK_USERS.filter(u => u.role === USER_ROLES.CLIENT).map(u => ({ id: u.uid, name: `${u.firstName} ${u.lastName}` }));
}

// This should be in userService.ts, but for simplicity of mock data, it's here.
const MOCK_USERS = [
  { uid: 'advocate1', firstName: 'Alice', lastName: 'Advocate', email: 'advocate@example.com', role: USER_ROLES.ADVOCATE },
  { uid: 'client1', firstName: 'Bob', lastName: 'Client', email: 'client@example.com', role: USER_ROLES.CLIENT },
  { uid: 'advocate-other', firstName: 'Charles', lastName: 'Xavier', email: 'cx@example.com', role: USER_ROLES.ADVOCATE },
  { uid: 'client-acme', firstName: 'Acme Rep', lastName: '', email: 'acme@example.com', role: USER_ROLES.CLIENT },
  { uid: 'client-family', firstName: 'Jane', lastName: 'Family', email: 'family@example.com', role: USER_ROLES.CLIENT },
];
