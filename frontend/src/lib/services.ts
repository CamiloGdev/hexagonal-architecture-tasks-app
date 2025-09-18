// Service configuration and dependency injection
import { createAuthService, createAxiosAuthRepository } from './Auth';
import { setupTokenRefresh } from './Shared';

// Create repository instances
const authRepository = createAxiosAuthRepository();

// Create service instances
export const authService = createAuthService(authRepository);

// Setup token refresh with callbacks
export const initializeAuth = (
  onRefreshSuccess?: () => void,
  onRefreshFailed?: () => void,
) => {
  setupTokenRefresh(onRefreshSuccess, onRefreshFailed);
};

// Export repositories for testing or advanced usage
export { authRepository };
