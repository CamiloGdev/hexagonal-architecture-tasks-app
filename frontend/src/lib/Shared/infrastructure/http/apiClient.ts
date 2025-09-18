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
} from '../../../Auth/domain/AuthError';
import type { ApiErrorDto } from '../../../Auth/infrastructure/dtos/auth.dto';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
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

      if (!error.response) {
        // Network error (no response received)
        throw new NetworkError(
          'Network error: Unable to connect to the server',
        );
      }

      const { status, data } = error.response;
      const message = data?.message || error.message || 'An error occurred';

      // Handle common HTTP errors that are universal across all modules
      switch (status) {
        case 401:
          throw new UnauthorizedError(message);
        case 409:
          throw new ConflictError(message);
        case 400:
          // Generic validation error - specific modules can catch and re-throw with more context
          throw new ValidationError(message);
        case 500:
        case 502:
        case 503:
        case 504:
          throw new AuthError(`Server error: ${message}`, status);
        default:
          // For other errors (like 404, 422, etc.), let them pass through
          // so that specific repositories can handle them with domain-specific context
          throw error;
      }
    },
  );

  return client;
};

// Singleton instance - shared across all modules
export const apiClient = createApiClient();

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

  // Add response interceptor for token refresh logic
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token
          await apiClient.post('/auth/refresh');
          processQueue(null);
          onRefreshSuccess?.();

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          onRefreshFailed?.();
          isRefreshing = false;
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

// Export the client creation function for testing purposes
export { createApiClient };
