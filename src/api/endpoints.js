const API = {
  // Auth
  LOGIN: '/account/login',
  REGISTER: '/account/register',

  // Lawyer
  ADD_CLIENT: '/advocate/add-client',
  GET_CLIENT: (id) => `/advocate/clients/${id}`,
  UPDATE_CLIENT: (id) => `/advocate/clients/${id}`,
  DELETE_CLIENT: (id) => `/advocate/clients/${id}`,
  LIST_CLIENTS: '/advocate/clients',

  ADD_CASE: '/advocate/add-case',
  GET_CASE: (id) => `/advocate/cases/${id}`,
  UPDATE_CASE: (id) => `/advocate/cases/${id}`,
  DELETE_CASE: (id) => `/advocate/cases/${id}`,
  LIST_CASES: '/advocate/cases',
  UPLOAD_DOCUMENT: '/advocate/upload-document',

  // SuperAdmin
  ADD_ADVOCATE: '/superadmin/add-advocate',
  GET_ADVOCATE: (id) => `/superadmin/advocate/${id}`,
  UPDATE_ADVOCATE: (id) => `/superadmin/advocate/${id}`,
  DELETE_ADVOCATE: (id) => `/superadmin/advocate/${id}`,
  LIST_ADVOCATES: '/superadmin/advocate'
};

export default API;
