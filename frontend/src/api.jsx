import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api/',
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
      // Only redirect to login for specific endpoints that require auth
      // Don't redirect for expected 401s like /api/auth/user/ for unauthenticated users
      const url = error.config?.url || '';
      const shouldRedirect = ![
        'auth/user/',
        'videos/',
        'comments/'
      ].some(endpoint => url.includes(endpoint));

      if (shouldRedirect && localStorage.getItem('accessToken')) {
        // Only redirect if we had a token (meaning it expired)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      } else if (!shouldRedirect) {
        // For expected 401s, just remove tokens but don't redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api;