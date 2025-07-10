const API = {
  // Auth
  LOGIN: '/account/login',
  REGISTER: '/account/register',

  // Lawyer
  ADD_CLIENT: '/advocate/add-client',
  GET_CLIENT: (id) => `/advocate/clients/${id}`,
  UPDATE_CLIENT: (id) => `/advocate/clients/${id}`,
  DELETE_CLIENT: (id) => `/advocate/clients/${id}`,
  UPDATE_CLIENT_STATUS: (id) => `/advocate/clients/${id}/status`,
  LIST_CLIENTS: '/advocate/clients',

  ADD_CASE: '/advocate/add-case',
  GET_CASE: (id) => `/advocate/cases/${id}`,
  UPDATE_CASE: (id) => `/advocate/cases/${id}`,
  DELETE_CASE: (id) => `/advocate/cases/${id}`,
  LIST_CASES: '/advocate/cases',

  ADD_DOCUMENT: (id) => `/advocate/cases/${id}/add-document`,
  UPDATE_HEARING: (id) => `/advocate/cases/${id}/update-hearing`,
  ADD_NOTE: (id) =>  `/advocate/cases/${id}/add-note`,

  // SuperAdmin
  GET_ADVOCATE: (id) => `/superadmin/advocates/${id}`,
  LIST_ADVOCATES: '/superadmin/advocates'
  // ADD_ADVOCATE: '/superadmin/add-advocate',
  // UPDATE_ADVOCATE: (id) => `/superadmin/advocates/${id}`,
  // DELETE_ADVOCATE: (id) => `/superadmin/advocates/${id}`,
};

export default API;
