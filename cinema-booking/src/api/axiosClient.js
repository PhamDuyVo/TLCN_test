import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor cho Request: Đính kèm JWT Access Token nếu có trong localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Use the same API origin for refresh; concurrent failures share one refresh request.
let refreshing;
const expireSession = () => {
  for (const key of ['access_token', 'refresh_token', 'user_info']) localStorage.removeItem(key);
  window.dispatchEvent(new Event('auth:expired'));
};
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const publicAuth = /\/auth\/(login|google|register|register-init|verify-registration-otp|forgot-password|reset-password|refresh-token)(?:$|\?)/.test(originalRequest?.url || '');
    if (error.response?.status !== 401 || !originalRequest || publicAuth) return Promise.reject(error);
    if (originalRequest._retry) {
      expireSession();
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      expireSession();
      return Promise.reject(error);
    }
    try {
      if (!refreshing) {
        refreshing = axios.post(`${axiosClient.defaults.baseURL.replace(/\/$/, '')}/auth/refresh-token`,
          { refreshToken }, { timeout: 10000 }).then((res) => {
          const token = res.data?.data?.accessToken;
          if (!res.data?.success || !token) throw new Error('Invalid refresh response');
          // A logout during refresh must not recreate the session.
          if (localStorage.getItem('refresh_token') !== refreshToken) throw new Error('Session changed');
          localStorage.setItem('access_token', token);
          return token;
        }).finally(() => { refreshing = null; });
      }
      const token = await refreshing;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosClient(originalRequest);
    } catch {
      expireSession();
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
