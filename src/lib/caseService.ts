
"use server";
import type { Case, CaseFormValues, Note, CaseDocument, HearingEntry, AuthUser, Task } from './types';
import { CASE_STATUSES, USER_ROLES, type UserRole, ALL_CASE_STATUSES } from './constants';
import { getUsers, getUserById, getMockClients, getMockAdvocates } from './userService';
import apiFetch from './api-client';

const today = new Date();
const todayAt = (hours: number, minutes: number = 0): Date => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d;
};

// MOCK_CASES will now serve as a supplementary source for data not provided by the API
// e.g., documents, notes, hearingHistory, tasks per instructions
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
    tasks: [],
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
    tasks: [],
    createdOn: new Date('2024-06-15T10:00:00Z'),
  },
];


// Helper to merge API case data with mock data
const mergeWithMockCaseData = async (apiCase: any): Promise<Case> => {
    // The API doesn't return the caseId in the body, so we have to assume we have it.
    // This is a significant limitation of the API design.
    // For list view, the API has to be updated to return the ID.
    // For now, we assume the API case object includes an 'id' or 'caseId' field.
    const caseId = apiCase.id || apiCase.caseId; // Adjust if API uses a different key
    const mockCase = MOCK_CASES.find(c => c.caseId === caseId);

    const advocate = await getUserById(apiCase.AdvocateId);
    const client = await getUserById(apiCase.ClientId);

    return {
        caseId: caseId,
        title: apiCase.CaseTitle,
        description: apiCase.CaseDetail,
        hearingDate: new Date(apiCase.HearingDate),
        status: apiCase.CaseStatus,
        advocateId: apiCase.AdvocateId,
        clientId: apiCase.ClientId,
        createdOn: new Date(apiCase.createdAt),
        advocateName: advocate ? `${advocate.firstName} ${advocate.lastName}` : "N/A",
        clientName: client ? `${client.firstName} ${client.lastName}` : "N/A",
        // Merge mock data for features not in API
        documents: mockCase?.documents || [],
        notes: mockCase?.notes || [],
        hearingHistory: mockCase?.hearingHistory || [],
        tasks: mockCase?.tasks || [],
    };
};

export async function getCases(userId: string, userRole: UserRole): Promise<Case[]> {
    // API only provides a general /advocate/cases endpoint.
    // We'll use it for advocates and filter for clients/admins on the frontend side for now.
    if (userRole === USER_ROLES.SUPER_ADMIN || userRole === USER_ROLES.ADVOCATE) {
      try {
          const apiCases = await apiFetch('/advocate/cases');
          if (!Array.isArray(apiCases)) return [];

          const mergedCases = await Promise.all(apiCases.map(c => mergeWithMockCaseData(c)));

          // The API doesn't allow filtering by user, so we do it here.
          if (userRole === USER_ROLES.ADVOCATE) {
              return mergedCases.filter(c => c.advocateId === userId);
          }
          return mergedCases;

      } catch (error) {
          console.error("Failed to fetch cases from API, falling back to mock data.", error);
          // Fallback to mock data for all roles if API fails
          return MOCK_CASES;
      }
    }

    // For clients, filter the full mock list as there is no specific client endpoint
    const allCases = await getCases(userId, USER_ROLES.SUPER_ADMIN); // Get all cases
    return allCases.filter(c => c.clientId === userId);
}

export async function getCaseById(caseId: string): Promise<Case | undefined> {
  try {
      const apiCase = await apiFetch(`/advocate/cases/${caseId}`);
      return await mergeWithMockCaseData({ ...apiCase, caseId: caseId }); // Pass id to merger
  } catch (error) {
      console.error(`Failed to fetch case ${caseId} from API, falling back to mock data.`, error);
      return MOCK_CASES.find(c => c.caseId === caseId);
  }
}

export async function createCase(caseData: CaseFormValues, advocateId: string, clientId: string, currentUser: AuthUser): Promise<Case> {
    const apiPayload = {
      ClientId: clientId,
      AdvocateId: advocateId,
      CaseTitle: caseData.title,
      CaseDetail: caseData.description,
      // API requires CaseNumber and CourtLocation, providing defaults
      CaseNumber: `CN-${Date.now()}`,
      CourtLocation: 'Default Court',
      HearingDate: caseData.hearingDate.toISOString(),
      FilingDate: new Date().toISOString(),
      CaseStatus: caseData.status,
    };

    await apiFetch('/advocate/add-case', {
        method: 'POST',
        body: JSON.stringify(apiPayload)
    });

    // As the API does not return the created case, we'll create a mock version for the UI to update.
    const newCase: Case = {
      ...caseData,
      caseId: `case-${Date.now()}`,
      advocateId,
      clientId,
      createdOn: new Date(),
      advocateName: (await getUserById(advocateId))?.firstName,
      clientName: (await getUserById(clientId))?.firstName,
      documents: [],
      notes: [],
      hearingHistory: [],
      tasks: [],
    };
    MOCK_CASES.unshift(newCase);
    return newCase;
}

export async function updateCase(caseId: string, caseData: Partial<CaseFormValues>, currentUser: AuthUser): Promise<Case | undefined> {
    const existingCase = await getCaseById(caseId);
    if(!existingCase) throw new Error("Case not found");

    const apiPayload = {
      ClientId: caseData.clientId || existingCase.clientId,
      AdvocateId: caseData.advocateId || existingCase.advocateId,
      CaseTitle: caseData.title || existingCase.title,
      CaseDetail: caseData.description || existingCase.description,
      CaseNumber: `CN-Updated-${Date.now()}`, // Assuming we need to provide this
      CourtLocation: 'Default Court',
      HearingDate: (caseData.hearingDate || existingCase.hearingDate).toISOString(),
      FilingDate: (existingCase.createdOn).toISOString(),
      CaseStatus: caseData.status || existingCase.status,
    };
    
    await apiFetch(`/advocate/cases/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify(apiPayload)
    });
    
    // In a real scenario, we would invalidate a cache and refetch.
    // For now, we update the mock data to reflect the change immediately.
    const mockIndex = MOCK_CASES.findIndex(c => c.caseId === caseId);
    if(mockIndex > -1) {
        MOCK_CASES[mockIndex] = { ...MOCK_CASES[mockIndex], ...caseData };
    }

    return await getCaseById(caseId);
}

export async function deleteCase(caseId: string): Promise<boolean> {
  await apiFetch(`/advocate/cases/${caseId}`, { method: 'DELETE' });
  
  // Also remove from mock data
  const initialLength = MOCK_CASES.length;
  MOCK_CASES = MOCK_CASES.filter(c => c.caseId !== caseId);
  return MOCK_CASES.length < initialLength;
}

// --- Functions below are NOT connected to the API per instructions ---

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
    c.status !== CASE_STATUSES.CLOSED
  ).sort((a,b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
}

export async function addNoteToCase(caseId: string, note: Pick<Note, 'message' | 'by' | 'byName'>): Promise<Note | undefined> {
  await new Promise(resolve => setTimeout(resolve, 400));
  const caseToUpdate = MOCK_CASES.find(c => c.caseId === caseId);
  if (caseToUpdate) {
    const newNote: Note = { ...note, at: new Date() };
    if(!caseToUpdate.notes) caseToUpdate.notes = [];
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
    if(!caseToUpdate.documents) caseToUpdate.documents = [];
    caseToUpdate.documents.push(newDocument);
    return newDocument;
  }
  return undefined;
}

export async function addTaskToCase(caseId: string, taskData: Omit<Task, 'id' | 'createdOn' | 'completed' | 'caseId'>): Promise<Task | undefined> {
  await new Promise(resolve => setTimeout(resolve, 400));
  const caseToUpdate = MOCK_CASES.find(c => c.caseId === caseId);
  if (caseToUpdate) {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      caseId,
      createdOn: new Date(),
      completed: false,
    };
    if (!caseToUpdate.tasks) caseToUpdate.tasks = [];
    caseToUpdate.tasks.push(newTask);
    return newTask;
  }
  return undefined;
}

export async function updateTaskInCase(caseId: string, taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const caseToUpdate = MOCK_CASES.find(c => c.caseId === caseId);
  if (caseToUpdate && caseToUpdate.tasks) {
    const taskIndex = caseToUpdate.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      caseToUpdate.tasks[taskIndex] = { ...caseToUpdate.tasks[taskIndex], ...updates };
      if (updates.completed === true && !caseToUpdate.tasks[taskIndex].completedOn) {
        caseToUpdate.tasks[taskIndex].completedOn = new Date();
      } else if (updates.completed === false) {
        caseToUpdate.tasks[taskIndex].completedOn = undefined;
      }
      return caseToUpdate.tasks[taskIndex];
    }
  }
  return undefined;
}

export async function deleteTaskFromCase(caseId: string, taskId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const caseToUpdate = MOCK_CASES.find(c => c.caseId === caseId);
  if (caseToUpdate && caseToUpdate.tasks) {
    const initialLength = caseToUpdate.tasks.length;
    caseToUpdate.tasks = caseToUpdate.tasks.filter(t => t.id !== taskId);
    return caseToUpdate.tasks.length < initialLength;
  }
  return false;
}

export async function recordHearingOutcomeAndSetNext(
  caseId: string,
  todaysHearingDate: Date,
  currentHearingOutcome: { status: CaseStatus; notes?: string },
  nextHearingDetails: { date: Date; status: CaseStatus } | null,
  currentUser: AuthUser
): Promise<Case | undefined> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const caseIndex = MOCK_CASES.findIndex(c => c.caseId === caseId);
  if (caseIndex === -1) return undefined;

  const caseToUpdate = MOCK_CASES[caseIndex];

  const historyEntry: HearingEntry = {
    hearingDate: todaysHearingDate,
    status: currentHearingOutcome.status,
    notes: currentHearingOutcome.notes || `Hearing on ${todaysHearingDate.toLocaleDateString()} concluded with status: ${currentHearingOutcome.status}`,
    updatedBy: currentUser.uid,
    updatedByName: `${currentUser.firstName} ${currentUser.lastName}`,
    updatedAt: new Date(),
  };
  if(!caseToUpdate.hearingHistory) caseToUpdate.hearingHistory = [];
  caseToUpdate.hearingHistory.push(historyEntry);

  if (nextHearingDetails) {
    caseToUpdate.hearingDate = nextHearingDetails.date;
    caseToUpdate.status = nextHearingDetails.status;
    
    if (nextHearingDetails.status !== currentHearingOutcome.status || nextHearingDetails.date.getTime() !== todaysHearingDate.getTime()) {
        const nextSchedulingEntry: HearingEntry = {
            hearingDate: nextHearingDetails.date,
            status: nextHearingDetails.status,
            notes: `Next hearing scheduled for ${nextHearingDetails.date.toLocaleDateString()}. Case status set to ${nextHearingDetails.status}.`,
            updatedBy: currentUser.uid,
            updatedByName: `${currentUser.firstName} ${currentUser.lastName}`,
            updatedAt: new Date(new Date().getTime() + 1),
        };
        caseToUpdate.hearingHistory.push(nextSchedulingEntry);
    }

  } else {
    caseToUpdate.status = currentHearingOutcome.status; 
  }
  
  caseToUpdate.hearingHistory.sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
  MOCK_CASES[caseIndex] = caseToUpdate;
  return caseToUpdate;
}
