const API = {
  // Auth
  LOGIN: '/account/login',
  REGISTER: '/account/register',
  LIST_USERS: '/account/users',
  DELETE_USER: (id) => `/account/users/${id}`,

  // Lawyer
  ADD_CLIENT: '/advocate/add-client',
  GET_CLIENT: (id) => `/advocate/clientById/${id}`,
  UPDATE_CLIENT: (id) => `/advocate/update-client/${id}`,
  UPDATE_CLIENT_STATUS: (id) => `/advocate/client-status/${id}/status`,
  LIST_CLIENTS: '/advocate/clients',
  // DELETE_CLIENT: (id) => `/advocate/delete-client/${id}`,

  ADD_CASE: '/advocate/add-case',
  GET_CASE: (id) => `/advocate/caseById/${id}`,
  UPDATE_CASE: (id) => `/advocate/update-case/${id}`,
  DELETE_CASE: (id) => `/advocate/delete-case/${id}`,
  LIST_CASES: '/advocate/cases',

  ADD_DOCUMENT: (id) => `/advocate/cases/${id}/add-document`,
  UPDATE_HEARING: (id) => `/advocate/cases/${id}/update-hearing`,
  ADD_NOTE: (id) =>  `/advocate/cases/${id}/add-note`,

  // SuperAdmin
  GET_ADVOCATE: (id) => `/superadmin/advocates/${id}`,
  LIST_ADVOCATES: '/superadmin/Advocates',
  // ADD_ADVOCATE: '/superadmin/add-advocate',
  // UPDATE_ADVOCATE: (id) => `/superadmin/advocates/${id}`,
  // DELETE_ADVOCATE: (id) => `/superadmin/advocates/${id}`,

  // Subscription
  LIST_SUBSCRIPTION_PACKAGES: '/subscription/subscription-packages',
  GET_SUBSCRIPTION_PACKAGES: (id) => `/subscription/subscription-packageById/${id}`,
  UPDATE_SUBSCRIPTION_PACKAGES: (id) => `/subscription/update-subscription-packages/${id}`,
  ADD_USER_SUBSCRIPTION: '/subscription/add-user-subscriptions',
  GET_USER_SUBSCRIPTION: (id) => `/subscription/user-subscription/${id}`,
  GET_USER_SUBSCRIPTION_BYUSER: (id) => `/subscription/user-subscription/by-user/${id}`,
  GET_LATEST_USER_SUBSCRIPTION: (id) => `/subscription/user-subscriptions/latest/${id}`,
  LIST_USER_SUBSCRIPTIONS: '/subscription/user-subscriptions',
  
  GET_SELECTED_PAYMENT_GATEWAY: '/subscription/settings/payment-gateway',
  UPDATE_PAYMENT_GATEWAY: '/subscription/settings/update-payment-gateway',

  CREATE_PHONEPE_PAYMENT: '/phonepe/payment/phonepe-initiate',
  PHONEPE_CALLBACK: '/phonepe/payment/phonepe-callback',

  CREATE_RAZORPAY_PAYMENT: '/razorpay/payment/razorpay-initiate',
  RAZORPAY_CALLBACK: '/razorpay/payment/razorpay-callback',
};

export default API;
