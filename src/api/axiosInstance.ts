import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import Config from '../config';
import { getAccessToken, clearAuthStorage } from '../utils/storage';
import { TIMEOUTS } from '../constants/appConstants';

/**
 * Django API client (auth, user, resume, coaching, teacher, student, etc.)
 */

export const nestClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL,
  timeout: TIMEOUTS.API_REQUEST,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

nestClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const noRefreshPaths = ['auth/me/', 'auth/refresh/', 'auth/login/', 'auth/register/'];

nestClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);
    const url = originalRequest.url ?? '';
    const isAuthEndpoint = noRefreshPaths.some((p) => url.includes(p));

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const refreshUrl = `${Config.API_URL}auth/refresh/`;
        const res = await axios.post(refreshUrl, {}, { withCredentials: true });
        const newToken = res.data?.accessToken;
        if (newToken) {
          const { setAccessToken } = await import('../utils/storage');
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return nestClient(originalRequest);
        }
      } catch {
        // ignore
      }
      clearAuthStorage();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * FastAPI client (interview service, etc.)
 */
export const fastApiClient: AxiosInstance = axios.create({
  baseURL: Config.FASTAPI_BASE_URL,
  timeout: TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

fastApiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

fastApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!originalRequest) return Promise.reject(error);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshUrl = `${Config.API_URL}auth/refresh/`;
        const res = await axios.post(refreshUrl, {}, { withCredentials: true });
        const newToken = res.data?.access;
        if (newToken) {
          const { setAccessToken } = await import('../utils/storage');
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return fastApiClient(originalRequest);
        }
      } catch {
        // ignore
      }
      clearAuthStorage();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
