import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Don't remove tokens for login attempts or expected 401s
      const isLoginAttempt = url.includes('login/');
      const isExpectedUnauth = [
        'auth/user/',
        'videos/',
        'comments/'
      ].some(endpoint => url.includes(endpoint));

      if (!isLoginAttempt && !isExpectedUnauth && localStorage.getItem('accessToken')) {
        // Only redirect if we had a token (meaning it expired)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      } else if (isExpectedUnauth && !isLoginAttempt) {
        // For expected 401s (not login), just remove tokens but don't redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      // For login attempts, don't remove tokens or redirect
    }
    return Promise.reject(error);
  }
);

export default api;