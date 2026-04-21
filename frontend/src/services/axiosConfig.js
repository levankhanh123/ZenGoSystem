// src/api/axiosConfig.js
import axios from 'axios';
import { message } from 'antd';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ===== Request interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu không phải FormData thì set JSON
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response interceptor =====
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 ) {
      sessionStorage.clear();
      message.error("Vui lòng đăng nhập để tiếp tục");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
