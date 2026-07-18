import axios from 'axios';
import { TOKEN_KEY } from './constants.js';

// Shared axios instance: injects the admin bearer token and bounces to /login on 401.
export const httpClient = axios.create();

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(error);
  },
);
