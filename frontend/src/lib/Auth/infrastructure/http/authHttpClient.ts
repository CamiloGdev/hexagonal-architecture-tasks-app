import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  AuthError,
  ConflictError,
  NetworkError,
  UnauthorizedError,
  ValidationError,
} from '../../domain/AuthError';
import type { ApiErrorDto } from '../dtos/auth.dto';

// Create axios instance with base configuration
const createAuthHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
    withCredentials: true, // Important for cookies (refresh/access tokens)
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      console.log(
        `Making ${config.method?.toUpperCase()} request to ${config.url}`,
      );
      return config;
    },
    (error: unknown) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(
        `Response received from ${response.config.url}:`,
        response.status,
      );
      return response;
    },
    async (error: AxiosError<ApiErrorDto>) => {
      console.error('Response interceptor error:', error);

      // Handle network errors
      if (!error.response) {
        throw new NetworkError('Network error - please check your connection');
      }

      const { status, data } = error.response;
      const message = data?.message || error.message || 'An error occurred';

      // Map HTTP status codes to domain errors
      switch (status) {
        case 400:
          // Check if it's a validation error with details
          if (data?.details && Array.isArray(data.details)) {
            const firstError = data.details[0];
            throw new ValidationError(firstError.message, firstError.field);
          }
          throw new ValidationError(message);

        case 401:
          throw new UnauthorizedError(message);

        case 409:
          throw new ConflictError(message);

        case 404:
          throw new AuthError(message, status);

        case 500:
        default:
          throw new AuthError(message, status);
      }
    },
  );

  return client;
};

// Singleton instance
export const authHttpClient = createAuthHttpClient();

// Token refresh functionality
export const setupTokenRefresh = (
  onRefreshSuccess?: () => void,
  onRefreshFailed?: () => void,
) => {
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    failedQueue = [];
  };

  // Add response interceptor for automatic token refresh
  authHttpClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return authHttpClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          await authHttpClient.post('/auth/refresh');
          processQueue(null);
          onRefreshSuccess?.();

          // Retry the original request
          return authHttpClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          onRefreshFailed?.();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};
