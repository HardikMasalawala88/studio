import axiosInstance from './axiosInstance';
import API from './endpoints';

const ApiService = {
  login: (data) => {
    // Use lowercase keys as backend expects
    const payload = {
      username: data.username || data.Username,
      password: data.password || data.Password,
    };
    return axiosInstance.post('/account/login', payload);
  },
  register: (data) => axiosInstance.post('/account/register', data),
  listUsers: () => axiosInstance.get(API.LIST_USERS),
  deleteUser: (id) => axiosInstance.delete(API.DELETE_USER(id)),

  addClient: (data) => axiosInstance.post(API.ADD_CLIENT, data),
  getClient: (id) => axiosInstance.get(API.GET_CLIENT(id)),
  updateClient: (id, data) => axiosInstance.put(API.UPDATE_CLIENT(id), data),
  updateClientStatus: (id, data) => axiosInstance.put(API.UPDATE_CLIENT_STATUS(id), data),
  listClients: () => axiosInstance.get(API.LIST_CLIENTS),
  // deleteClient: (id) => axiosInstance.delete(API.DELETE_CLIENT(id)),

  addCase: (data) => axiosInstance.post(API.ADD_CASE, data),
  getCase: (id) => axiosInstance.get(API.GET_CASE(id)),
  updateCase: (id, data) => axiosInstance.put(API.UPDATE_CASE(id), data),
  deleteCase: (id) => axiosInstance.delete(API.DELETE_CASE(id)),
  listCases: () => axiosInstance.get(API.LIST_CASES),

  uploadDocument: (id, data) =>
  axiosInstance.put(API.ADD_DOCUMENT(id), data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data),

  updateHearing: (id, data) => axiosInstance.put(API.UPDATE_HEARING(id), data).then((res) => res.data),
  addNote: (id, data) => axiosInstance.put(API.ADD_NOTE(id), data).then((res) => res.data),

  getAdvocate: (id) => axiosInstance.get(API.GET_ADVOCATE(id)),
  listAdvocates: () => axiosInstance.get(API.LIST_ADVOCATES),
  // addAdvocate: (data, specialization) =>
  //   axiosInstance.post(`${API.ADD_ADVOCATE}?specialization=${specialization}`, data),
  // updateAdvocate: (id, data) => axiosInstance.put(API.UPDATE_ADVOCATE(id), data),
  // deleteAdvocate: (id) => axiosInstance.delete(API.DELETE_ADVOCATE(id)),

  listSubscriptionPackages: () => axiosInstance.get(API.LIST_SUBSCRIPTION_PACKAGES),
  getSubscriptionPackageById: (id) => axiosInstance.get(API.GET_SUBSCRIPTION_PACKAGES(id)),
  updateSubscriptionPackage: (id, data) => axiosInstance.put(API.UPDATE_SUBSCRIPTION_PACKAGES(id), data),
  addUserSubscription: (data) => axiosInstance.post(API.ADD_USER_SUBSCRIPTION, data),
  getUserSubscriptionById: (id) => axiosInstance.get(API.GET_USER_SUBSCRIPTION(id)),
  getUserSubscriptionByUserId: (id) => axiosInstance.get(API.GET_USER_SUBSCRIPTION_BYUSER(id)),
  getLatestUserSubscription: (id) => axiosInstance.get(API.GET_LATEST_USER_SUBSCRIPTION(id)),
  listUserSubscriptions: () => axiosInstance.get(API.LIST_USER_SUBSCRIPTIONS),

  getSelectedGateway: () => axiosInstance.get(API.GET_SELECTED_PAYMENT_GATEWAY),
  updatePaymentGateway: (data) => axiosInstance.post(API.UPDATE_PAYMENT_GATEWAY, data),

  createPhonepePayment: (data) => axiosInstance.post(API.CREATE_PHONEPE_PAYMENT, data),
  phonepeCallBack: (data) => axiosInstance.post(API.PHONEPE_CALLBACK, data),

  createRazorpayPayment: (data) => axiosInstance.post(API.CREATE_RAZORPAY_PAYMENT, data),
  razorpayCallBack: (data) => axiosInstance.post(API.RAZORPAY_CALLBACK, data),
};

export default ApiService;
