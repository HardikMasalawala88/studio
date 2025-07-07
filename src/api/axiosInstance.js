import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Adjust baseURL as needed
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    (`[Request] ${config.method?.toUpperCase()} - ${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[Error] ${error.response?.status}: ${error.message}`);
    return Promise.reject(error);
  }
);


export default axiosInstance;
