import axiosInstance from './axiosInstance';
import API from './endpoints';

const ApiService = {
  login: (data) => {
    // Use lowercase keys as backend expects
    const payload = {
      username: data.username || data.Username,
      password: data.password || data.Password,
    };
    console.log("ApiService.login payload:", payload);
    return axiosInstance.post('/account/login', payload);
  },
  register: (data) => axiosInstance.post('/account/register', data),

  addClient: (data) => axiosInstance.post(API.ADD_CLIENT, data),
  getClient: (id) => axiosInstance.get(API.GET_CLIENT(id)),
  updateClient: (id, data) => axiosInstance.put(API.UPDATE_CLIENT(id), data),
  deleteClient: (id) => axiosInstance.delete(API.DELETE_CLIENT(id)),
  listClients: () => axiosInstance.get(API.LIST_CLIENTS),

  addCase: (data) => axiosInstance.post(API.ADD_CASE, data),
  getCase: (id) => axiosInstance.get(API.GET_CASE(id)),
  updateCase: (id, data) => axiosInstance.put(API.UPDATE_CASE(id), data),
  deleteCase: (id) => axiosInstance.delete(API.DELETE_CASE(id)),
  listCases: () => axiosInstance.get(API.LIST_CASES),

  uploadDocument: (data) =>
  axiosInstance.post(API.UPLOAD_DOCUMENT, data, {
    headers: {
      'Content-Type': undefined, // 🚫 Important: let Axios set it automatically
    },
  }),

  // uploadDocument: (data) => axiosInstance.post(API.UPLOAD_DOCUMENT, data),

  addAdvocate: (data, specialization) =>
    axiosInstance.post(`${API.ADD_ADVOCATE}?specialization=${specialization}`, data),
  getAdvocate: (id) => axiosInstance.get(API.GET_ADVOCATE(id)),
  updateAdvocate: (id, data) => axiosInstance.put(API.UPDATE_ADVOCATE(id), data),
  deleteAdvocate: (id) => axiosInstance.delete(API.DELETE_ADVOCATE(id)),
  listAdvocates: () => axiosInstance.get(API.LIST_ADVOCATES),
};

export default ApiService;
