import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from '@/services/auth-services';


// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: "/",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If error is unauthorized and not a retry
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        // Try refreshing the token
        const refreshSuccessful = await refreshAccessToken();

        if (refreshSuccessful) {
          // Update auth header with new token
          const newToken = localStorage.getItem('access_token');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request with new token
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login on refresh failure
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);


export default api; 