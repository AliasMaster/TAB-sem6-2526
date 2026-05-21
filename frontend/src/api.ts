import axios from 'axios';

// Backend is behind ApiGateway typically on port 80 or 8080.
// Adjust the baseURL if necessary depending on environment.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops if refresh token itself fails, and don't intercept login/register attempts
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/register') {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = localStorage.getItem('userId');

      if (refreshToken && userId) {
        try {
          const res = await axios.post(`${baseURL}/auth/refresh`, {
            userId,
            refreshToken,
          });
          
          if (res.data?.accessToken) {
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);

            // Update header and retry original request
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token is invalid or expired
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          window.location.href = '/login'; // Redirect to login
        }
      } else {
        // No refresh token available, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
