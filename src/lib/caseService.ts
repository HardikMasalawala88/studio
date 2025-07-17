
"use server";
import type { Case, CaseFormValues, Note, CaseDocument, HearingEntry, AuthUser } from './types';
import { CASE_STATUSES, USER_ROLES, type UserRole, ALL_CASE_STATUSES } from './constants';
import { getUsers, getUserById } from './userService';

const today = new Date();
const todayAt = (hours: number, minutes: number = 0): Date => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d;
};

let MOCK_CASES: Case[] = [
  {
    caseId: 'case-001',
    title: 'Personal Injury Claim - John Doe',
    description: 'Claim regarding a slip and fall incident at a local supermarket. Seeking compensation for medical expenses and lost wages.',
    hearingDate: new Date('2024-09-15T10:00:00Z'),
    status: CASE_STATUSES.UPCOMING,
    advocateId: 'advocate1', 
    advocateName: 'Alice Advocate',
    clientId: 'client1', 
    clientName: 'Bob Client',
    documents: [
        { name: 'Medical Report.pdf', url: '#', uploadedAt: new Date('2024-07-01T10:00:00Z') },
        { name: 'Incident Photos.zip', url: '#', uploadedAt: new Date('2024-07-02T14:30:00Z') }
    ],
    notes: [
      { message: 'Initial consultation held. Client seems to have a strong case.', by: 'advocate1', byName: 'Alice Advocate', at: new Date('2024-07-01T11:00:00Z') },
      { message: 'Gathered all necessary medical documents.', by: 'advocate1', byName: 'Alice Advocate', at: new Date('2024-07-05T15:00:00Z') },
    ],
    hearingHistory: [
        { hearingDate: new Date('2024-07-15T10:00:00Z'), status: CASE_STATUSES.UPCOMING, notes: "Initial hearing scheduled.", updatedBy: 'advocate1', updatedByName: 'Alice Advocate', updatedAt: new Date('2024-07-01T09:00:00Z') }
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
    hearingHistory: [
        { hearingDate: new Date('2024-06-20T14:30:00Z'), status: CASE_STATUSES.UPCOMING, notes: "First hearing date set.", updatedBy: 'advocate1', updatedByName: 'Alice Advocate', updatedAt: new Date('2024-06-15T10:00:00Z') }
    ],
    createdOn: new Date('2024-06-15T10:00:00Z'),
  },
  {
    caseId: 'case-today-001',
    title: 'Urgent Flight Hearing - Leo Lanister',
    description: 'Seeking an urgent Flight against unauthorized access of intellectual property.',
    hearingDate: todayAt(9, 30),
    status: CASE_STATUSES.OPEN,
    advocateId: 'advocate1',
    advocateName: 'Alice Advocate',
    clientId: 'client-leo',
    clientName: 'Leo Lanister',
    documents: [{ name: 'EvidenceBundle.pdf', url: '#', uploadedAt: new Date() }],
    notes: [
        { message: 'Client call confirmed urgency.', by: 'advocate1', byName: 'Alice Advocate', at: todayAt(8,0) },
        { message: 'Drafted Flight application.', by: 'advocate1', byName: 'Alice Advocate', at: todayAt(8,45) },
    ],
    hearingHistory: [
        { hearingDate: todayAt(9, 30), status: CASE_STATUSES.UPCOMING, notes: "Urgent hearing scheduled for today.", updatedBy: 'advocate1', updatedByName: 'Alice Advocate', updatedAt: new Date(new Date().setDate(new Date().getDate() -1))}
    ],
    createdOn: new Date(new Date().setDate(new Date().getDate() - 1)), 
  },
  {
    caseId: 'case-today-002',
    title: 'Bail Application - Sara Star',
    description: 'Application for bail following recent arrest.',
    hearingDate: todayAt(11, 0),
    status: CASE_STATUSES.UPCOMING,
    advocateId: 'advocate1',
    advocateName: 'Alice Advocate',
    clientId: 'client-sara',
    clientName: 'Sara Star',
    documents: [],
    notes: [
        { message: 'Reviewed police report.', by: 'advocate1', byName: 'Alice Advocate', at: todayAt(9,0) },
        { message: 'Prepared arguments for bail.', by: 'advocate1', byName: 'Alice Advocate', at: todayAt(10,15) },
    ],
    hearingHistory: [
         { hearingDate: todayAt(11, 0), status: CASE_STATUSES.UPCOMING, notes: "Bail hearing scheduled.", updatedBy: 'advocate1', updatedByName: 'Alice Advocate', updatedAt: new Date(new Date().setDate(new Date().getDate() -2))}
    ],
    createdOn: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
];

export async function getCases(userId: string, userRole: UserRole): Promise<Case[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  if (userRole === USER_ROLES.ADMIN) {
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

export async function createCase(caseData: CaseFormValues, advocateId: string, clientId: string, currentUser: AuthUser): Promise<Case> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const advocateUser = await getUserById(advocateId);
  const clientUser = await getUserById(clientId);

  const initialHearingEntry: HearingEntry = {
    hearingDate: caseData.hearingDate,
    status: caseData.status,
    notes: "Case created and first hearing scheduled.",
    updatedBy: currentUser.uid,
    updatedByName: `${currentUser.firstName} ${currentUser.lastName}`,
    updatedAt: new Date(),
  };

  const newCase: Case = {
    ...caseData,
    caseId: `case-${Date.now()}`,
    advocateId,
    clientId,
    advocateName: advocateUser ? `${advocateUser.firstName} ${advocateUser.lastName}` : "Unknown Advocate",
    clientName: clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Unknown Client",
    documents: [],
    notes: [],
    hearingHistory: [initialHearingEntry],
    createdOn: new Date(),
  };
  MOCK_CASES.unshift(newCase);
  return newCase;
}

export async function updateCase(caseId: string, caseData: Partial<CaseFormValues>, currentUser: AuthUser): Promise<Case | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const caseIndex = MOCK_CASES.findIndex(c => c.caseId === caseId);
  if (caseIndex > -1) {
    const currentCase = MOCK_CASES[caseIndex];
    
    const oldHearingDate = currentCase.hearingDate;
    const oldStatus = currentCase.status;

    MOCK_CASES[caseIndex] = { ...currentCase, ...caseData } as Case;
    
    if (typeof caseData.hearingDate === 'string') {
        MOCK_CASES[caseIndex].hearingDate = new Date(caseData.hearingDate);
    } else if (caseData.hearingDate instanceof Date) {
        MOCK_CASES[caseIndex].hearingDate = caseData.hearingDate;
    }

    if (caseData.advocateId && caseData.advocateId !== currentCase.advocateId) {
        const advocateUser = await getUserById(caseData.advocateId);
        MOCK_CASES[caseIndex].advocateName = advocateUser ? `${advocateUser.firstName} ${advocateUser.lastName}` : "Unknown Advocate";
    }
    if (caseData.clientId && caseData.clientId !== currentCase.clientId) {
        const clientUser = await getUserById(caseData.clientId);
        MOCK_CASES[caseIndex].clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Unknown Client";
    }

    // If primary hearing date or status changed via general edit, update the latest history entry or add a new one.
    // This logic could be complex. For now, if next hearing date or status changes, create a new history entry.
    const newHearingDate = MOCK_CASES[caseIndex].hearingDate;
    const newStatus = MOCK_CASES[caseIndex].status;

    if (newHearingDate.getTime() !== oldHearingDate.getTime() || newStatus !== oldStatus) {
        const historyEntry: HearingEntry = {
            hearingDate: newHearingDate,
            status: newStatus,
            notes: `Case details updated. Next hearing: ${newHearingDate.toLocaleDateString()}. Status: ${newStatus}.`,
            updatedBy: currentUser.uid,
            updatedByName: `${currentUser.firstName} ${currentUser.lastName}`,
            updatedAt: new Date(),
        };
        MOCK_CASES[caseIndex].hearingHistory.push(historyEntry);
        // Sort history by date just in case
        MOCK_CASES[caseIndex].hearingHistory.sort((a,b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
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
  const queryDateStart = new Date(date);
  queryDateStart.setHours(0, 0, 0, 0);
  const queryDateEnd = new Date(date);
  queryDateEnd.setHours(23, 59, 59, 999);

  return MOCK_CASES.filter(c => 
    c.advocateId === advocateId &&
    new Date(c.hearingDate) >= queryDateStart &&
    new Date(c.hearingDate) <= queryDateEnd &&
    c.status !== CASE_STATUSES.CLOSED // Don't show closed cases for daily report action
  ).sort((a,b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
}

export async function recordHearingOutcomeAndSetNext(
  caseId: string,
  todaysHearingDate: Date, // The date of the hearing being recorded
  currentHearingOutcome: { status: CaseStatus; notes?: string },
  nextHearingDetails: { date: Date; status: CaseStatus } | null, // Null if case is closed
  currentUser: AuthUser
): Promise<Case | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const caseIndex = MOCK_CASES.findIndex(c => c.caseId === caseId);
  if (caseIndex === -1) return undefined;

  const caseToUpdate = MOCK_CASES[caseIndex];

  const historyEntry: HearingEntry = {
    hearingDate: todaysHearingDate, // Use the actual date of the hearing
    status: currentHearingOutcome.status,
    notes: currentHearingOutcome.notes || `Hearing on ${todaysHearingDate.toLocaleDateString()} concluded with status: ${currentHearingOutcome.status}`,
    updatedBy: currentUser.uid,
    updatedByName: `${currentUser.firstName} ${currentUser.lastName}`,
    updatedAt: new Date(),
  };
  caseToUpdate.hearingHistory.push(historyEntry);

  if (nextHearingDetails) {
    caseToUpdate.hearingDate = nextHearingDetails.date;
    caseToUpdate.status = nextHearingDetails.status;
    
    // Also add a history entry for scheduling the next hearing if it's different from the outcome status
    if (nextHearingDetails.status !== currentHearingOutcome.status || nextHearingDetails.date.getTime() !== todaysHearingDate.getTime()) {
        const nextSchedulingEntry: HearingEntry = {
            hearingDate: nextHearingDetails.date,
            status: nextHearingDetails.status,
            notes: `Next hearing scheduled for ${nextHearingDetails.date.toLocaleDateString()}. Case status set to ${nextHearingDetails.status}.`,
            updatedBy: currentUser.uid,
            updatedByName: `${currentUser.firstName} ${currentUser.lastName}`,
            updatedAt: new Date(new Date().getTime() + 1), // ensure slightly different timestamp
        };
        caseToUpdate.hearingHistory.push(nextSchedulingEntry);
    }

  } else {
    // Case is being closed or put on hold without a specific next date
    caseToUpdate.status = currentHearingOutcome.status; 
  }
  
  caseToUpdate.hearingHistory.sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
  MOCK_CASES[caseIndex] = caseToUpdate;
  return caseToUpdate;
}


export async function getMockAdvocates() {
    const allUsers = await getUsers();
    return allUsers
        .filter(u => u.role === USER_ROLES.ADVOCATE)
        .map(u => ({ id: u.uid, name: `${u.firstName} ${u.lastName}` }));
}
export async function getMockClients() {
    const allUsers = await getUsers();
    return allUsers
        .filter(u => u.role === USER_ROLES.CLIENT)
        .map(u => ({ id: u.uid, name: `${u.firstName} ${u.lastName}` }));
}
